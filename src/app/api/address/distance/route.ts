/**
 * Driving distance from the pickup base to a customer address.
 *
 * GET /api/address/distance?lat=<number>&lon=<number>
 *
 * Coordinates come from a suggestion the visitor already picked, so no second
 * geocoding call is needed. The origin is read from server environment
 * variables and never leaves the server — the response is only a mile count.
 *
 * This route answers a purely geographic question. Whether that distance is
 * inside the service area, and what it costs, is decided by `lib/pricing.ts`.
 */

import { getGeoProvider } from "@/lib/geo";
import { callerKey, RateLimiter, TtlCache } from "@/lib/geo/cache";
import { geoErrorResponse, handleGeoError } from "@/lib/geo/http";
import type { DistanceResponse } from "@/lib/geo/types";

/** Addresses do not move, so routes can be cached hard. */
const distanceCache = new TtlCache<number>(24 * 60 * 60 * 1000, 500);

/** One call per selected address — far lower volume than autocomplete. */
const limiter = new RateLimiter(20, 60 * 1000);

function parseCoordinate(
  raw: string | null,
  min: number,
  max: number
): number | null {
  if (!raw) return null;
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value) || value < min || value > max) return null;
  return value;
}

export async function GET(request: Request) {
  const provider = getGeoProvider();
  if (!provider) {
    return geoErrorResponse(
      "unconfigured",
      "Distance lookup is not switched on yet."
    );
  }

  const params = new URL(request.url).searchParams;
  const lat = parseCoordinate(params.get("lat"), -90, 90);
  const lon = parseCoordinate(params.get("lon"), -180, 180);

  if (lat === null || lon === null) {
    return geoErrorResponse(
      "invalid_request",
      "Pick an address from the suggestions."
    );
  }

  // ~11 m of precision: enough to distinguish neighbouring houses, coarse
  // enough that the same address always hits the same cache entry.
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const cached = distanceCache.get(cacheKey);
  if (cached !== undefined) {
    return Response.json({
      distanceMiles: cached,
    } satisfies DistanceResponse);
  }

  if (!limiter.allow(callerKey(request))) {
    return geoErrorResponse(
      "rate_limited",
      "Too many lookups. Give it a moment and try again."
    );
  }

  try {
    const distanceMiles = await provider.drivingDistanceMiles(
      { lat, lon },
      request.signal
    );
    distanceCache.set(cacheKey, distanceMiles);
    return Response.json({ distanceMiles } satisfies DistanceResponse);
  } catch (error) {
    return handleGeoError(error, "distance");
  }
}
