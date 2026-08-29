/**
 * Pricing rules for California Laundromat.
 *
 * Single source of truth for all pricing math. Nothing in the UI layer should
 * hardcode a rate or a fee — everything reads from the constants and helpers
 * below, so the business can change a price here and have it update across
 * every page, calculator and FAQ answer at once.
 *
 * All figures below were supplied by the business owner.
 */

import { roundToCent } from "./utils";

/** Orders are billed at a 24 lb minimum, even when the bag weighs less. */
export const MIN_ORDER_LBS = 24;

/** Delivery is charged per mile travelled, one way, from the home office. */
export const DELIVERY_RATE_PER_MILE = 0.77;

/**
 * Ceiling on the delivery charge, whatever the distance. Set by the owner so
 * the occasional longer run stays affordable enough that customers still book
 * it — the extra miles are absorbed as a cost of building the round.
 *
 * At the current per-mile rate the cap starts biting at roughly 7.8 miles.
 */
export const DELIVERY_FEE_CAP = 6.0;

/**
 * How far out we quote at all. Beyond this the calculator stops pricing and
 * asks the customer to call, rather than committing the business to a run it
 * may not want to make.
 */
export const MAX_SERVICE_RADIUS_MILES = 18;

/** The distance at which the cap takes over from the per-mile rate. */
export const DELIVERY_CAP_FROM_MILES =
  Math.round((DELIVERY_FEE_CAP / DELIVERY_RATE_PER_MILE) * 10) / 10;

export function isWithinServiceArea(distanceMiles: number): boolean {
  return (
    Number.isFinite(distanceMiles) &&
    distanceMiles >= 0 &&
    distanceMiles <= MAX_SERVICE_RADIUS_MILES
  );
}

/**
 * What happens when a bag comes in under the minimum. Kept as copy rather
 * than logic because it is a discretionary goodwill policy, not a rule the
 * calculator can apply on its own.
 */
export const MIN_ORDER_POLICY =
  `Our minimum service charge is ${MIN_ORDER_LBS} lbs. If your bag comes in under that, we may issue a store credit for the difference against your next order — for example, pay for ${MIN_ORDER_LBS} lbs on a 20 lb bag and we can credit you the 4 lbs next time.`;

export interface TurnaroundTier {
  id: string;
  label: string;
  ratePerLb: number;
  /** Short promise used on cards and in the calculator. */
  summary: string;
  /** Longer description for the services and pricing pages. */
  details: string;
  /**
   * True for the billed-monthly co-operative plan. Stated on every tier
   * rather than left off the others, so the list reads as a table and the
   * literal ids above survive for callers.
   */
  isSubscription: boolean;
}

/**
 * Wash & fold turnaround options. Ordered fastest → cheapest so the
 * calculator and the price tables always present the same sequence.
 */
export const TURNAROUND_TIERS = [
  {
    id: "express-12hr",
    label: "12 Hour Express",
    ratePerLb: 9.0,
    summary: "Back within 12 hours.",
    details:
      "We pick up your dirty laundry as soon as possible and return it clean and folded within 12 hours. For the days when waiting is not an option.",
    isSubscription: false,
  },
  {
    id: "1-day",
    label: "1 Day Service",
    ratePerLb: 3.25,
    summary: "Back the next day.",
    details:
      "We pick up your dirty laundry as soon as possible and return it clean and folded in 1 day.",
    isSubscription: false,
  },
  {
    id: "2-day",
    label: "2 Day Service",
    ratePerLb: 3.0,
    summary: "Back in two days.",
    details:
      "We pick up your dirty laundry as soon as possible and return it clean and folded in 2 days.",
    isSubscription: false,
  },
  {
    id: "3-day",
    label: "3 Day Service",
    ratePerLb: 2.75,
    summary: "Back in three days.",
    details:
      "We pick up your dirty laundry as soon as possible and return it clean and folded in 3 days. The easiest way to keep the cost down.",
    isSubscription: false,
  },
  {
    id: "subscription",
    label: "Monthly Co-op Subscription",
    ratePerLb: 2.5,
    summary: "Every Tuesday, back Thursday.",
    details:
      "Billed monthly. We pick up every Tuesday and return your laundry clean and folded on Thursday of the same week. Subscribers get coupons and discounts advertised to them each month.",
    isSubscription: true,
  },
] as const satisfies readonly TurnaroundTier[];

/** Union of the real tier ids, so callers cannot invent one. */
export type TurnaroundTierId = (typeof TURNAROUND_TIERS)[number]["id"];

export const DEFAULT_TIER_ID: TurnaroundTierId = "2-day";

export function isTurnaroundTierId(id: unknown): id is TurnaroundTierId {
  return TURNAROUND_TIERS.some((tier) => tier.id === id);
}

export function getTier(id: string): TurnaroundTier {
  return (
    TURNAROUND_TIERS.find((t) => t.id === id) ??
    TURNAROUND_TIERS.find((t) => t.id === DEFAULT_TIER_ID)!
  );
}

/** The cheapest per-pound rate on offer — used for "from $x" copy. */
export const LOWEST_RATE_PER_LB = Math.min(
  ...TURNAROUND_TIERS.map((t) => t.ratePerLb)
);

export type AddOnKind = "per-lb" | "per-minimum-block";

export interface AddOn {
  id: string;
  label: string;
  rate: number;
  kind: AddOnKind;
  /** Human-readable rate, e.g. "$0.25 / lb". */
  rateLabel: string;
  details: string;
}

export const ADD_ONS = [
  {
    id: "stain-treatment",
    label: "Stain treatment",
    rate: 0.25,
    kind: "per-lb",
    rateLabel: "$0.25 / lb",
    details:
      "During sorting, our laundry technician spot-treats stains by hand before the wash.",
  },
  {
    id: "fragrance",
    label: "Laundry fragrance",
    rate: 2.0,
    kind: "per-minimum-block",
    rateLabel: `$2.00 per ${MIN_ORDER_LBS} lbs`,
    details:
      "A light finishing fragrance added to your order. Skip it and your laundry comes back low-scent.",
  },
] as const satisfies readonly AddOn[];

/** Union of the real add-on ids. */
export type AddOnId = (typeof ADD_ONS)[number]["id"];

export function isAddOnId(id: unknown): id is AddOnId {
  return ADD_ONS.some((addOn) => addOn.id === id);
}

/** Rounds a weight up to the number of billed 24 lb blocks. */
function blocksOf(weightLbs: number): number {
  return Math.max(1, Math.ceil(weightLbs / MIN_ORDER_LBS));
}

/**
 * Applies the 24 lb minimum. Bags under the minimum are billed at the
 * minimum; anything above is billed on its real weight.
 */
export function billableWeight(weightLbs: number): number {
  const w = Number.isFinite(weightLbs) ? Math.max(0, weightLbs) : 0;
  return Math.max(w, MIN_ORDER_LBS);
}

/**
 * Delivery charge for a given distance: the per-mile rate, held at
 * `DELIVERY_FEE_CAP` once the distance would push it past that.
 */
export function calculateDeliveryFee(
  distanceMiles: number,
  ratePerMile: number = DELIVERY_RATE_PER_MILE
): number {
  if (!Number.isFinite(distanceMiles) || distanceMiles <= 0) return 0;
  return roundToCent(Math.min(distanceMiles * ratePerMile, DELIVERY_FEE_CAP));
}

/** True when the cap, rather than the mileage, is setting the price. */
export function isDeliveryCapped(distanceMiles: number): boolean {
  return (
    Number.isFinite(distanceMiles) &&
    distanceMiles * DELIVERY_RATE_PER_MILE > DELIVERY_FEE_CAP
  );
}

export function calculateAddOnCost(addOn: AddOn, billableLbs: number): number {
  if (addOn.kind === "per-lb") return roundToCent(billableLbs * addOn.rate);
  return roundToCent(blocksOf(billableLbs) * addOn.rate);
}

export interface EstimateLine {
  id: string;
  label: string;
  amount: number;
  /** Small print under the line, e.g. "24 lbs × $3.00". */
  note?: string;
}

export interface EstimateBreakdown {
  tier: TurnaroundTier;
  weightLbs: number;
  billableLbs: number;
  /** True when the entered weight was raised to the 24 lb minimum. */
  minimumApplied: boolean;
  distanceMiles: number;
  lines: EstimateLine[];
  laundryTotal: number;
  deliveryFee: number;
  total: number;
}

/**
 * Produces a full, labelled estimate for the pricing calculator. This is
 * always an ESTIMATE — final weight is measured at the shop and no payment
 * is taken here.
 */
export function calculateEstimate(options: {
  weightLbs: number;
  distanceMiles: number;
  tierId: string;
  addOnIds?: readonly string[];
}): EstimateBreakdown {
  const { weightLbs, distanceMiles, tierId, addOnIds = [] } = options;

  const tier = getTier(tierId);
  const billableLbs = billableWeight(weightLbs);
  const minimumApplied = billableLbs > Math.max(0, weightLbs || 0);

  const lines: EstimateLine[] = [
    {
      id: tier.id,
      label: tier.label,
      amount: roundToCent(billableLbs * tier.ratePerLb),
      note: `${billableLbs} lbs × $${tier.ratePerLb.toFixed(2)} / lb`,
    },
  ];

  for (const addOn of ADD_ONS) {
    if (!addOnIds.includes(addOn.id)) continue;
    lines.push({
      id: addOn.id,
      label: addOn.label,
      amount: calculateAddOnCost(addOn, billableLbs),
      note: addOn.rateLabel,
    });
  }

  const laundryTotal = roundToCent(
    lines.reduce((sum, line) => sum + line.amount, 0)
  );
  const deliveryFee = calculateDeliveryFee(distanceMiles);

  return {
    tier,
    weightLbs,
    billableLbs,
    minimumApplied,
    distanceMiles,
    lines,
    laundryTotal,
    deliveryFee,
    total: roundToCent(laundryTotal + deliveryFee),
  };
}
