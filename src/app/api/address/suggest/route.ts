/**
 * Address suggestions for the pricing calculator.
 *
 * GET /api/address/suggest?q=<partial address>
 *
 * Exists so the mapping provider's API key stays on the server. The browser
 * talks only to this route; the key is never shipped in the client bundle.
 */

import { getGeoProvider } from "@/lib/geo";
import { callerKey, RateLimiter, TtlCache } from "@/lib/geo/cache";
import { geoErrorResponse, handleGeoError } from "@/lib/geo/http";
import type { AddressSuggestion, SuggestResponse } from "@/lib/geo/types";

/** Below this length the provider returns noise, so we do not spend a credit. */
const MIN_QUERY_LENGTH = 3;
const MAX_QUERY_LENGTH = 120;

/** Typed addresses repeat constantly between visitors; an hour is plenty. */
const suggestionCache = new TtlCache<AddressSuggestion[]>(60 * 60 * 1000, 500);

/**
 * Generous enough for real typing (the client debounces to roughly one call
 * per 300ms) while still stopping a script draining the daily quota.
 */
const limiter = new RateLimiter(45, 60 * 1000);

export async function GET(request: Request) {
  const provider = getGeoProvider();
  if (!provider) {
    return geoErrorResponse(
      "unconfigured",
      "Address lookup is not switched on yet."
    );
  }

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
    return Response.json({ suggestions: [] } satisfies SuggestResponse);
  }

  const cacheKey = query.toLowerCase();
  const cached = suggestionCache.get(cacheKey);
  if (cached) {
    return Response.json({ suggestions: cached } satisfies SuggestResponse);
  }

  if (!limiter.allow(callerKey(request))) {
    return geoErrorResponse(
      "rate_limited",
      "Too many lookups. Give it a moment and try again."
    );
  }

  try {
    const suggestions = await provider.suggest(query, request.signal);
    suggestionCache.set(cacheKey, suggestions);
    return Response.json({ suggestions } satisfies SuggestResponse);
  } catch (error) {
    return handleGeoError(error, "suggest");
  }
}
