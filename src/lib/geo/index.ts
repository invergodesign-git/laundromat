/**
 * Geo provider resolution.
 *
 * SERVER ONLY. Route handlers ask for a provider here rather than constructing
 * one, so the concrete service is chosen in a single place and the rest of the
 * codebase depends only on the `GeoProvider` interface.
 *
 * Returns `null` when the feature is not configured. Callers must handle that
 * explicitly — the calculator asks people to call for a quote rather than
 * inventing a distance.
 */

import { getGeoConfig } from "./config";
import { createGeoapifyProvider } from "./geoapify";
import type { GeoProvider } from "./types";

let provider: GeoProvider | null | undefined;

export function getGeoProvider(): GeoProvider | null {
  if (provider !== undefined) return provider;

  const config = getGeoConfig();
  provider = config ? createGeoapifyProvider(config) : null;
  return provider;
}

export { GeoError } from "./types";
export type { AddressSuggestion, Coordinates, GeoProvider } from "./types";
