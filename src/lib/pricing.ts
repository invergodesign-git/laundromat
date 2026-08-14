/**
 * Pricing rules for California Laundromat.
 *
 * This file is the single source of truth for all pricing math. Nothing in
 * the UI layer should hardcode a rate or fee — everything reads from
 * `PRICING_CONFIG` and the helper functions below, so business rules can be
 * updated here without touching any component.
 *
 * IMPORTANT: The pickup/delivery fee curve below is a DEMO assumption only,
 * provided as a placeholder until Robert confirms real, final pricing rules.
 */

import { clamp, roundToCent } from "./utils";

export interface PickupFeeConfig {
  /** Fee charged at or below `minDistanceMiles`, in USD. */
  minFee: number;
  /** Fee charged at or above `maxDistanceMiles`, in USD. */
  maxFee: number;
  /** Distance (miles) at which the minimum fee applies. */
  minDistanceMiles: number;
  /** Distance (miles) at which the maximum fee applies. */
  maxDistanceMiles: number;
}

export interface PricingConfig {
  /** Wash & Fold rate, per pound, in USD. */
  washFoldRatePerLb: number;
  pickup: PickupFeeConfig;
}

/**
 * DEMO PRICING CONFIG.
 *
 * Wash & Fold: $3.25/lb (confirmed demo rate for this build).
 * Pickup fee scales linearly between 1.5mi ($1.50) and 15mi ($5.00),
 * clamped outside that range. Change these numbers — and only these
 * numbers — to update pricing across the entire site.
 */
export const PRICING_CONFIG: PricingConfig = {
  washFoldRatePerLb: 3.25,
  pickup: {
    minFee: 1.5,
    maxFee: 5.0,
    minDistanceMiles: 1.5,
    maxDistanceMiles: 15,
  },
};

/**
 * Calculates the pickup & delivery fee for a given distance (in miles) from
 * the laundry location, using a linear scale between the configured min and
 * max fee/distance pairs. Result is clamped and rounded to the nearest cent.
 */
export function calculatePickupFee(
  distanceMiles: number,
  config: PickupFeeConfig = PRICING_CONFIG.pickup
): number {
  const { minFee, maxFee, minDistanceMiles, maxDistanceMiles } = config;

  if (!Number.isFinite(distanceMiles) || distanceMiles <= minDistanceMiles) {
    return roundToCent(minFee);
  }

  if (distanceMiles >= maxDistanceMiles) {
    return roundToCent(maxFee);
  }

  const ratio =
    (distanceMiles - minDistanceMiles) / (maxDistanceMiles - minDistanceMiles);
  const fee = minFee + ratio * (maxFee - minFee);

  return roundToCent(clamp(fee, minFee, maxFee));
}

/** Calculates the Wash & Fold subtotal for a given weight, in pounds. */
export function calculateWashFoldCost(
  weightLbs: number,
  ratePerLb: number = PRICING_CONFIG.washFoldRatePerLb
): number {
  return roundToCent(Math.max(0, weightLbs || 0) * ratePerLb);
}

export interface EstimateBreakdown {
  washFold: number;
  pickupFee: number;
  total: number;
  weightLbs: number;
  distanceMiles: number;
  ratePerLb: number;
}

/**
 * Produces a full, labeled estimate breakdown for the pricing calculator.
 * This is always an ESTIMATE — no checkout or payment is performed here.
 */
export function calculateEstimate(
  weightLbs: number,
  distanceMiles: number
): EstimateBreakdown {
  const washFold = calculateWashFoldCost(weightLbs);
  const pickupFee = calculatePickupFee(distanceMiles);

  return {
    washFold,
    pickupFee,
    total: roundToCent(washFold + pickupFee),
    weightLbs,
    distanceMiles,
    ratePerLb: PRICING_CONFIG.washFoldRatePerLb,
  };
}
