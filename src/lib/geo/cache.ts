/**
 * In-process caching and throttling for the geo endpoints.
 *
 * Both exist to protect the mapping provider's free-tier quota: autocomplete
 * fires while someone is typing, so an uncached, unthrottled endpoint would
 * burn the daily allowance quickly.
 *
 * SCALING NOTE: state here is per Node process. On a single deployment — which
 * is what this marketing site runs on — that is exactly right. If the site is
 * ever scaled to several instances behind a load balancer, both classes should
 * be backed by Redis so the quota and the throttle are shared. The call sites
 * only use `get`/`set`/`allow`, so that swap is contained to this file.
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Time-to-live map with a hard entry cap. Eviction is insertion-ordered
 * (oldest first), which `Map` gives us for free.
 */
export class TtlCache<T> {
  private readonly store = new Map<string, Entry<T>>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries: number
  ) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }

    // Refresh recency so hot keys survive eviction.
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.store.has(key)) this.store.delete(key);
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });

    while (this.store.size > this.maxEntries) {
      const oldest = this.store.keys().next();
      if (oldest.done) break;
      this.store.delete(oldest.value);
    }
  }
}

interface Window {
  count: number;
  resetAt: number;
}

/**
 * Fixed-window counter keyed by caller (IP). Deliberately simple: the goal is
 * to stop one client draining the daily quota, not to police precise bursts.
 */
export class RateLimiter {
  private readonly windows = new Map<string, Window>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxKeys = 5_000
  ) {}

  /** Records a hit. Returns false when the caller is over the limit. */
  allow(key: string): boolean {
    const now = Date.now();
    const existing = this.windows.get(key);

    if (!existing || existing.resetAt <= now) {
      if (this.windows.size >= this.maxKeys) this.evictExpired(now);
      this.windows.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    existing.count += 1;
    return existing.count <= this.limit;
  }

  private evictExpired(now: number): void {
    for (const [key, window] of this.windows) {
      if (window.resetAt <= now) this.windows.delete(key);
    }
    // Still full of live windows — drop the oldest to bound memory.
    if (this.windows.size >= this.maxKeys) {
      const oldest = this.windows.keys().next();
      if (!oldest.done) this.windows.delete(oldest.value);
    }
  }
}

/**
 * Best-effort caller identity for throttling. Falls back to a shared bucket
 * when no proxy headers are present, which is the safe direction: unknown
 * callers share one allowance rather than each getting a fresh one.
 */
export function callerKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
