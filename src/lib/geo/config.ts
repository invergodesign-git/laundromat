/**
 * Server-side configuration for the geo layer.
 *
 * SERVER ONLY. Every value read here is a server environment variable with no
 * `NEXT_PUBLIC_` prefix, so none of it is inlined into the client bundle. This
 * module must only ever be imported from route handlers or other server code.
 *
 * The pickup base coordinates live here rather than in `lib/business.ts`
 * because the business does not publish its street address. The browser only
 * ever receives a mile count — never the origin itself.
 */

import { METERS_PER_MILE, type Coordinates } from "./types";

export interface GeoConfig {
  apiKey: string;
  origin: Coordinates;
  /** Radius around the origin that address suggestions are searched within. */
  searchRadiusMeters: number;
}

/**
 * Suggestions are searched over a wider area than we actually deliver to, so
 * that someone just outside the service area still gets their address matched
 * and can be told plainly that they are out of range.
 */
const DEFAULT_SEARCH_RADIUS_MILES = 45;

function parseFloatInRange(
  raw: string | undefined,
  min: number,
  max: number
): number | null {
  if (!raw) return null;
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value) || value < min || value > max) return null;
  return value;
}

let cached: GeoConfig | null | undefined;
let warned = false;

/**
 * Reads and validates the geo environment. Returns `null` when the feature is
 * not configured, which callers treat as "switched off" rather than as an
 * error — the calculator degrades to asking people to call instead of showing
 * a price built on a guess.
 */
export function getGeoConfig(): GeoConfig | null {
  if (cached !== undefined) return cached;

  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();
  const lat = parseFloatInRange(process.env.LAUNDRY_ORIGIN_LAT, -90, 90);
  const lon = parseFloatInRange(process.env.LAUNDRY_ORIGIN_LON, -180, 180);

  if (!apiKey || lat === null || lon === null) {
    if (!warned) {
      warned = true;
      console.warn(
        "[geo] Distance lookup is disabled. Set GEOAPIFY_API_KEY, LAUNDRY_ORIGIN_LAT and LAUNDRY_ORIGIN_LON to enable it."
      );
    }
    cached = null;
    return cached;
  }

  const radiusMiles =
    parseFloatInRange(process.env.GEO_SEARCH_RADIUS_MILES, 1, 500) ??
    DEFAULT_SEARCH_RADIUS_MILES;

  cached = {
    apiKey,
    origin: { lat, lon },
    searchRadiusMeters: Math.round(radiusMiles * METERS_PER_MILE),
  };
  return cached;
}
