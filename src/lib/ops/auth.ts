/**
 * Ops dashboard session.
 *
 * One shared password. Cookie holds a hash of that password so changing the
 * env value invalidates every open session.
 *
 * A demo default is baked in so Vercel does not need an env var for the
 * design walkthrough. `OPS_DASHBOARD_PASSWORD` still overrides it when set.
 *
 * Hashing is a small portable FNV-1a mix rather than node:crypto, because the
 * Next.js proxy (which checks the cookie) can run on the Edge runtime.
 */

export const OPS_COOKIE = "ops_session";

/** How long a signed-in browser stays in. Demo walkthroughs need more than a day. */
export const OPS_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 14;

/**
 * Default for the design demo. Override with OPS_DASHBOARD_PASSWORD when you
 * want a different unlock without shipping a code change.
 */
const DEMO_PASSWORD = "laundromat-ops-demo";

export function getOpsPassword(): string {
  return process.env.OPS_DASHBOARD_PASSWORD?.trim() || DEMO_PASSWORD;
}

function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Two passes with a different seed so a short password is not trivial.
  let hash2 = 0x811c9dc5 ^ 0xabcdef;
  for (let i = 0; i < input.length; i += 1) {
    hash2 ^= input.charCodeAt(i);
    hash2 = Math.imul(hash2, 0x01000193);
  }
  return (
    (hash >>> 0).toString(16).padStart(8, "0") +
    (hash2 >>> 0).toString(16).padStart(8, "0")
  );
}

/** Expected cookie value for the current password. */
export function expectedSessionToken(): string {
  return fnv1aHex(`california-laundromat-ops:${getOpsPassword()}`);
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = expectedSessionToken();
  if (expected.length !== token.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return mismatch === 0;
}

export function passwordMatches(input: string): boolean {
  const password = getOpsPassword();
  if (password.length !== input.length) return false;
  let mismatch = 0;
  for (let i = 0; i < password.length; i += 1) {
    mismatch |= password.charCodeAt(i) ^ input.charCodeAt(i);
  }
  return mismatch === 0;
}
