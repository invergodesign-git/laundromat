/**
 * Geoapify implementation of `GeoProvider`.
 *
 * SERVER ONLY — this module handles the API key.
 *
 * Two endpoints are used:
 *   - Address Autocomplete, for the suggestion dropdown
 *     https://api.geoapify.com/v1/geocode/autocomplete
 *   - Routing, for real driving distance from the pickup base
 *     https://api.geoapify.com/v1/routing
 *
 * Free-plan usage requires visible "Powered by Geoapify" attribution, which is
 * rendered under the pricing calculator.
 */

import type { GeoConfig } from "./config";
import {
  GeoError,
  METERS_PER_MILE,
  type AddressSuggestion,
  type Coordinates,
  type GeoProvider,
} from "./types";

const AUTOCOMPLETE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";
const ROUTING_URL = "https://api.geoapify.com/v1/routing";

const REQUEST_TIMEOUT_MS = 6_000;
const SUGGESTION_LIMIT = 5;

interface GeoapifyAutocompleteResult {
  place_id?: string;
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
  lat?: number;
  lon?: number;
}

interface GeoapifyRoutingResponse {
  features?: {
    properties?: {
      distance?: number;
      distance_units?: string;
    };
  }[];
}

/**
 * Runs a request with both an overall timeout and the caller's abort signal,
 * so a slow provider can never hold a route handler open indefinitely.
 */
async function fetchJson<T>(
  url: URL,
  signal: AbortSignal | undefined,
  context: string
): Promise<T> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(url, {
      signal: combined,
      headers: { Accept: "application/json" },
      // Provider results are cached by our own TtlCache, not by fetch.
      cache: "no-store",
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    console.error(`[geo] ${context} request failed`, error);
    throw new GeoError("upstream", "The address service did not respond.");
  }

  if (!response.ok) {
    console.error(`[geo] ${context} responded ${response.status}`);
    throw new GeoError("upstream", "The address service returned an error.");
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    console.error(`[geo] ${context} returned unparseable JSON`, error);
    throw new GeoError("upstream", "The address service returned bad data.");
  }
}

function toSuggestion(
  result: GeoapifyAutocompleteResult
): AddressSuggestion | null {
  const { lat, lon } = result;
  if (typeof lat !== "number" || typeof lon !== "number") return null;

  const label = result.address_line1?.trim() || result.formatted?.trim();
  if (!label) return null;

  return {
    id: result.place_id ?? `${lat},${lon}`,
    label,
    context: result.address_line2?.trim() ?? "",
    lat,
    lon,
  };
}

/** Converts a routing response's distance into miles, whatever unit it used. */
function distanceToMiles(properties: {
  distance?: number;
  distance_units?: string;
}): number {
  const { distance, distance_units: units } = properties;
  if (typeof distance !== "number" || !Number.isFinite(distance) || distance < 0) {
    throw new GeoError("no_route", "No driving route to that address.");
  }

  // The API answers in metres unless `units=imperial` was requested. We ask for
  // the default, but the unit is echoed back so we honour it either way.
  const miles =
    units === "miles" || units === "imperial"
      ? distance
      : distance / METERS_PER_MILE;

  return Math.round(miles * 10) / 10;
}

export function createGeoapifyProvider(config: GeoConfig): GeoProvider {
  const { apiKey, origin, searchRadiusMeters } = config;

  return {
    name: "geoapify",

    async suggest(query, signal) {
      const url = new URL(AUTOCOMPLETE_URL);
      url.searchParams.set("text", query);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", String(SUGGESTION_LIMIT));
      url.searchParams.set("lang", "en");
      // Hard filter: only offer addresses we could plausibly drive to.
      url.searchParams.set(
        "filter",
        `circle:${origin.lon},${origin.lat},${searchRadiusMeters}`
      );
      // Soft bias: rank the closest matches first inside that circle.
      url.searchParams.set("bias", `proximity:${origin.lon},${origin.lat}`);
      url.searchParams.set("apiKey", apiKey);

      const data = await fetchJson<{ results?: GeoapifyAutocompleteResult[] }>(
        url,
        signal,
        "autocomplete"
      );

      const seen = new Set<string>();
      const suggestions: AddressSuggestion[] = [];

      for (const result of data.results ?? []) {
        const suggestion = toSuggestion(result);
        if (!suggestion || seen.has(suggestion.id)) continue;
        seen.add(suggestion.id);
        suggestions.push(suggestion);
      }

      return suggestions;
    },

    async drivingDistanceMiles(destination: Coordinates, signal) {
      const url = new URL(ROUTING_URL);
      url.searchParams.set(
        "waypoints",
        `${origin.lat},${origin.lon}|${destination.lat},${destination.lon}`
      );
      url.searchParams.set("mode", "drive");
      url.searchParams.set("apiKey", apiKey);

      const data = await fetchJson<GeoapifyRoutingResponse>(
        url,
        signal,
        "routing"
      );

      const properties = data.features?.[0]?.properties;
      if (!properties) {
        throw new GeoError("no_route", "No driving route to that address.");
      }

      return distanceToMiles(properties);
    },
  };
}
