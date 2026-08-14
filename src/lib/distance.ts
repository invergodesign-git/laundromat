/**
 * Distance / geocoding layer.
 *
 * This module is intentionally isolated from the UI and from `pricing.ts`.
 * Today it contains a DEMO stand-in that fabricates a plausible distance
 * from an address string. It does NOT call any real mapping service.
 *
 * To wire in a real provider later (Google Distance Matrix, Mapbox
 * Directions, etc.), replace the body of `getDistanceFromLaundry` with a
 * real API call — the function signature and `DistanceResult` shape can
 * stay exactly the same, so no UI code needs to change.
 */

export const LAUNDRY_ORIGIN = {
  label: "Main Laundry Location",
  address: "2575 Old Quarry Road, San Diego, CA",
  city: "San Diego, CA",
} as const;

export interface DistanceResult {
  distanceMiles: number;
  originAddress: string;
  destinationAddress: string;
  /** True when this came from the demo estimator, not a real geocoding API. */
  isDemoEstimate: true;
}

/**
 * DEMO ONLY — deterministic pseudo-distance generator.
 *
 * Hashes the entered address into a stable number between ~0.6 and ~14
 * miles, so the same address always produces the same demo result. This is
 * a placeholder for a real driving-distance lookup and must not be
 * presented to users as an actual Google Maps / geocoding calculation.
 */
function estimateDemoDistanceMiles(address: string): number {
  const normalized = address.trim().toLowerCase();
  if (!normalized) return 0;

  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }

  const pseudoRandom = Math.abs(hash % 1000) / 1000; // 0..1, stable per address
  const distance = 0.6 + pseudoRandom * 13.4; // ~0.6mi - 14mi demo range

  return Math.round(distance * 10) / 10;
}

/**
 * Resolves the pickup distance (in miles) for a given address, relative to
 * `LAUNDRY_ORIGIN`. Simulates realistic network latency so the loading
 * state in the UI feels honest about "calculating" something.
 *
 * DEMO IMPLEMENTATION — see module comment above.
 */
export async function getDistanceFromLaundry(
  address: string
): Promise<DistanceResult> {
  const trimmed = address.trim();

  await new Promise((resolve) =>
    setTimeout(resolve, 900 + Math.random() * 500)
  );

  if (!trimmed) {
    throw new Error("Please enter a pickup address.");
  }

  return {
    distanceMiles: estimateDemoDistanceMiles(trimmed),
    originAddress: LAUNDRY_ORIGIN.address,
    destinationAddress: trimmed,
    isDemoEstimate: true,
  };
}
