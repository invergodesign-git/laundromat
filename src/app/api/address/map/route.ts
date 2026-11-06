/**
 * Static map preview of a chosen pickup address.
 *
 * GET /api/address/map?lat=<number>&lon=<number>
 *
 * Proxies Geoapify's Static Maps API so the API key stays on the server. Only
 * the customer's own pin is drawn — the pickup base is never shown, matching
 * how the distance route keeps the origin private.
 */

import "server-only";

import { getGeoConfig } from "@/lib/geo/config";
import { callerKey, RateLimiter } from "@/lib/geo/cache";
import { geoErrorResponse } from "@/lib/geo/http";

const STATIC_MAP_URL = "https://maps.geoapify.com/v1/staticmap";
const REQUEST_TIMEOUT_MS = 12_000;

/** One image per selected address; browsers cache it after that. */
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
  const config = getGeoConfig();
  if (!config) {
    return geoErrorResponse("unconfigured", "Map preview is not switched on yet.");
  }

  const params = new URL(request.url).searchParams;
  const lat = parseCoordinate(params.get("lat"), -90, 90);
  const lon = parseCoordinate(params.get("lon"), -180, 180);
  if (lat === null || lon === null) {
    return geoErrorResponse("invalid_request", "Pick an address from the suggestions.");
  }

  if (!limiter.allow(callerKey(request))) {
    return geoErrorResponse("rate_limited", "Too many lookups. Give it a moment and try again.");
  }

  // Rounded so the same address always produces the same upstream URL.
  const point = `${lon.toFixed(5)},${lat.toFixed(5)}`;

  const url = new URL(STATIC_MAP_URL);
  url.searchParams.set("style", "osm-bright");
  url.searchParams.set("width", "640");
  url.searchParams.set("height", "280");
  url.searchParams.set("scaleFactor", "2");
  url.searchParams.set("format", "jpeg");
  url.searchParams.set("center", `lonlat:${point}`);
  url.searchParams.set("zoom", "15.5");
  url.searchParams.set(
    "marker",
    `lonlat:${point};type:awesome;color:#4536d6;icon:home;iconsize:large;size:x-large`
  );
  url.searchParams.set("apiKey", config.apiKey);

  try {
    const upstream = await fetch(url, {
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
      cache: "no-store",
    });

    if (!upstream.ok) {
      console.error(`[geo] static map responded ${upstream.status}`);
      return geoErrorResponse("upstream", "The map service returned an error.");
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        // Addresses do not move.
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    console.error("[geo] static map request failed", error);
    return geoErrorResponse("upstream", "We could not reach the map service.");
  }
}
