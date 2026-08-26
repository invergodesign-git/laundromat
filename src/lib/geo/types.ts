/**
 * Shared shapes for the geo layer.
 *
 * Deliberately provider-agnostic — nothing in this file mentions a specific
 * mapping service. Swapping Geoapify for Google, Mapbox or anything else means
 * writing one new module that satisfies `GeoProvider`; no route handler and no
 * component needs to change.
 *
 * This file is safe to import from client components: it contains types and a
 * plain error class, never credentials.
 */

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface AddressSuggestion extends Coordinates {
  /** Provider's stable id for the place. Used as the React key and dedupe key. */
  id: string;
  /** Street line, e.g. "3021 Camino del Rio N". */
  label: string;
  /** City / state / postcode line rendered under the label. */
  context: string;
}

/**
 * The two operations the pricing calculator needs from a mapping service.
 * Implementations live in sibling modules and are resolved by `./index`.
 */
export interface GeoProvider {
  /** Provider name, for logs. */
  readonly name: string;
  /** Address suggestions for a partial query, biased to the service area. */
  suggest(query: string, signal?: AbortSignal): Promise<AddressSuggestion[]>;
  /** Real driving distance in miles from the pickup base to a destination. */
  drivingDistanceMiles(
    destination: Coordinates,
    signal?: AbortSignal
  ): Promise<number>;
}

export type GeoErrorCode =
  /** No API key or origin configured — the feature is switched off. */
  | "unconfigured"
  /** The mapping service failed, timed out, or returned something unusable. */
  | "upstream"
  /** The service answered, but there is no drivable route to that point. */
  | "no_route"
  /** The caller sent a malformed query or coordinates. */
  | "invalid_request"
  /** Too many requests from one client. */
  | "rate_limited";

export class GeoError extends Error {
  constructor(
    readonly code: GeoErrorCode,
    message: string
  ) {
    super(message);
    this.name = "GeoError";
  }
}

/** Response body of `GET /api/address/suggest`. */
export interface SuggestResponse {
  suggestions: AddressSuggestion[];
}

/** Response body of `GET /api/address/distance`. */
export interface DistanceResponse {
  distanceMiles: number;
}

/** Error body returned by both geo endpoints. */
export interface GeoErrorResponse {
  error: GeoErrorCode;
  message: string;
}

export const METERS_PER_MILE = 1609.344;
