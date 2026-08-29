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
 * True when a request ended because the caller went away rather than because
 * anything went wrong. The autocomplete field aborts the in-flight lookup on
 * every keystroke, so this is the single most common way these routes end.
 */
function isCallerGone(error: unknown, request?: Request): boolean {
  if (request?.signal.aborted) return true;
  const name = (error as { name?: string } | null)?.name;
  return name === "AbortError" || name === "ResponseAborted";
}

/**
 * Maps a thrown error onto a response. Anything that is not a `GeoError` is
 * logged and reported as an upstream failure — provider internals and stack
 * traces never reach the browser.
 */
export function handleGeoError(
  error: unknown,
  context: string,
  request?: Request
): Response {
  if (isCallerGone(error, request)) {
    // Nothing went wrong and nobody is listening. Logging these would bury
    // real failures under one entry per keystroke.
    return new Response(null, { status: 499 });
  }

  if (error instanceof GeoError) {
    return geoErrorResponse(error.code, error.message);
  }

  console.error(`[geo] unexpected failure in ${context}`, error);
  return geoErrorResponse(
    "upstream",
    "We could not reach the address service."
  );
}
