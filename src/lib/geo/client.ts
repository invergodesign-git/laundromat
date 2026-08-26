/**
 * Browser-side calls to the geo route handlers.
 *
 * Safe to import from client components — it only ever talks to our own
 * endpoints, so no provider credential is involved.
 *
 * Both helpers rethrow as `GeoError` with the server's code, letting the UI
 * tell apart "the feature is not switched on yet" from "the lookup failed"
 * and say something useful in each case.
 */

import {
  GeoError,
  type AddressSuggestion,
  type Coordinates,
  type DistanceResponse,
  type GeoErrorResponse,
  type SuggestResponse,
} from "./types";

async function readError(response: Response): Promise<GeoError> {
  try {
    const body = (await response.json()) as Partial<GeoErrorResponse>;
    if (body.error) {
      return new GeoError(
        body.error,
        body.message ?? "Address lookup failed."
      );
    }
  } catch {
    // Fall through to the generic message below.
  }
  return new GeoError("upstream", "Address lookup failed.");
}

export async function fetchSuggestions(
  query: string,
  signal?: AbortSignal
): Promise<AddressSuggestion[]> {
  const response = await fetch(
    `/api/address/suggest?q=${encodeURIComponent(query)}`,
    { signal }
  );

  if (!response.ok) throw await readError(response);

  const data = (await response.json()) as SuggestResponse;
  return data.suggestions ?? [];
}

export async function fetchDistanceMiles(
  { lat, lon }: Coordinates,
  signal?: AbortSignal
): Promise<number> {
  const response = await fetch(
    `/api/address/distance?lat=${lat}&lon=${lon}`,
    { signal }
  );

  if (!response.ok) throw await readError(response);

  const data = (await response.json()) as DistanceResponse;
  if (typeof data.distanceMiles !== "number") {
    throw new GeoError("upstream", "Address lookup failed.");
  }
  return data.distanceMiles;
}
