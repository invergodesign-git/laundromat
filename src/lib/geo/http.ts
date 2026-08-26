/**
 * Shared helpers for the geo route handlers.
 *
 * SERVER ONLY.
 */

import { GeoError, type GeoErrorCode, type GeoErrorResponse } from "./types";

const STATUS_BY_CODE: Record<GeoErrorCode, number> = {
  unconfigured: 503,
  upstream: 502,
  no_route: 422,
  invalid_request: 400,
  rate_limited: 429,
};

export function geoErrorResponse(
  code: GeoErrorCode,
  message: string
): Response {
  return Response.json({ error: code, message } satisfies GeoErrorResponse, {
    status: STATUS_BY_CODE[code],
  });
}

/**
 * Maps a thrown error onto a response. Anything that is not a `GeoError` is
 * logged and reported as an upstream failure — provider internals and stack
 * traces never reach the browser.
 */
export function handleGeoError(error: unknown, context: string): Response {
  if (error instanceof GeoError) {
    return geoErrorResponse(error.code, error.message);
  }

  console.error(`[geo] unexpected failure in ${context}`, error);
  return geoErrorResponse(
    "upstream",
    "We could not reach the address service."
  );
}
