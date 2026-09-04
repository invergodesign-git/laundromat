/**
 * Ops dashboard types.
 *
 * Built on the same `Order` shape the booking form produces, plus the
 * lifecycle fields a desk needs. When real bookings land in a store later,
 * these screens keep working — only the data source changes.
 */

import type { Order, WaitlistEntry } from "@/lib/orders/types";

export const OPS_STATUSES = [
  "booked",
  "out-for-pickup",
  "collected",
  "washing",
  "out-for-delivery",
  "delivered",
  "no-show",
] as const;

export type OpsStatus = (typeof OPS_STATUSES)[number];

export const OPS_STATUS_LABEL: Record<OpsStatus, string> = {
  booked: "Booked",
  "out-for-pickup": "Out for pickup",
  collected: "Collected",
  washing: "Washing",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  "no-show": "No-show",
};

/**
 * Allowed next statuses from each step. Keeps the demo honest about the
 * real run — you cannot mark delivered before collected.
 */
export const OPS_STATUS_NEXT: Record<OpsStatus, readonly OpsStatus[]> = {
  booked: ["out-for-pickup", "no-show"],
  "out-for-pickup": ["collected", "no-show"],
  collected: ["washing"],
  washing: ["out-for-delivery"],
  "out-for-delivery": ["delivered"],
  delivered: [],
  "no-show": [],
};

export type PaymentState = "none" | "ready" | "paid" | "cancelled-fee";

export interface OpsOrder extends Order {
  status: OpsStatus;
  /**
   * Weight measured at the door. Null until collected — that is when the
   * estimate becomes a bill.
   */
  actualWeightLbs: number | null;
  /** Final total once weighed (or the estimate while still open). */
  chargeAmount: number;
  paymentStatus: PaymentState;
  /** Fake card on file so the pre-auth story is visible in the Money screen. */
  cardLast4: string;
  neighbourhood: string;
  statusHistory: readonly { status: OpsStatus; at: string }[];
}

export interface OpsCustomer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  orderCount: number;
  lastOrderAt: string;
  neighbourhood: string;
}

export interface OpsWaitlistLead extends WaitlistEntry {
  id: string;
  neighbourhood: string;
}

export type OpsAction =
  | { type: "set-status"; reference: string; status: OpsStatus }
  | { type: "set-actual-weight"; reference: string; lbs: number }
  | { type: "charge"; reference: string }
  | { type: "reset" };
