/**
 * The shape of a pickup request.
 *
 * This is the one place an order is defined. The booking form builds it, the
 * intake route validates it, and the emails render it. When payment or route
 * planning is connected later, they read this same object rather than asking
 * the customer for anything a second time — which is the entire point of
 * owning intake on the website.
 */

import type { PickupWindowId } from "@/lib/business";
import type { AddOnId, TurnaroundTierId } from "@/lib/pricing";

export interface OrderContact {
  name: string;
  phone: string;
  email: string;
}

export interface OrderAddress {
  /** The line the customer picked from the suggestion list. */
  label: string;
  /** City / postcode line that accompanied it. */
  context: string;
  lat: number;
  lon: number;
  /** Gate codes, apartment numbers, where to leave the bag. */
  notes: string;
}

export interface OrderService {
  tierId: TurnaroundTierId;
  addOnIds: AddOnId[];
  /**
   * The customer's own guess, used only to show them an estimate. The real
   * weight is measured at pickup and is what actually gets charged.
   */
  estimatedWeightLbs: number;
}

export interface OrderPickup {
  /** ISO `YYYY-MM-DD`, in the business's local timezone. */
  date: string;
  windowId: PickupWindowId;
}

/** What the browser posts to the intake route. */
export interface OrderRequest {
  contact: OrderContact;
  address: OrderAddress;
  service: OrderService;
  pickup: OrderPickup;
  /** Anything else the customer wants us to know about the load. */
  instructions: string;
}

/**
 * A validated request, with the money worked out on the server. The browser's
 * own totals are never carried through — they are display-only.
 */
export interface Order extends OrderRequest {
  /** Short, quotable code for phone conversations. */
  reference: string;
  receivedAt: string;
  distanceMiles: number;
  deliveryFee: number;
  billableWeightLbs: number;
  minimumApplied: boolean;
  laundryTotal: number;
  addOnTotal: number;
  total: number;
}

export interface OrderFieldErrors {
  [field: string]: string;
}
