/**
 * Validation for an incoming pickup request.
 *
 * Deliberately hand-rolled rather than pulling in a schema library: there is
 * exactly one form on this site, and the rules below are business rules worth
 * reading in plain code. Runs on the server against untrusted input, and is
 * reused on the client so the customer sees the same messages before posting.
 */

import {
  businessDatePlus,
  businessToday,
  getPickupWindow,
  pickupWindowsForDate,
  pickupWindowsOnWeekday,
  type PickupWindowId,
} from "@/lib/business";
import {
  isAddOnId,
  isTurnaroundTierId,
  isWithinServiceArea,
  MAX_SERVICE_RADIUS_MILES,
} from "@/lib/pricing";
import type {
  OrderFieldErrors,
  OrderRequest,
  WaitlistRequest,
} from "./types";

/** Longest a customer could plausibly plan ahead. */
const MAX_DAYS_AHEAD = 30;
/** Guards against a bag weight that is a typo rather than a load. */
const MAX_WEIGHT_LBS = 400;

const MAX_LENGTHS = {
  name: 60,
  phone: 32,
  email: 160,
  addressLabel: 200,
  addressContext: 200,
  addressNotes: 500,
  instructions: 1000,
} as const;

/**
 * Permissive on purpose. Real addresses defeat clever email regexes, and a
 * rejected order costs the business far more than a bounced confirmation.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Ten digits is a US number; anything shorter is a mistake. */
function digitsOf(value: string): string {
  return value.replace(/\D/g, "");
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Dates are compared as `YYYY-MM-DD` strings rather than `Date` objects.
 * That sorts correctly, and it sidesteps the whole class of bugs where the
 * server's UTC clock disagrees with the shop's Pacific one.
 */
function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export interface ValidationResult {
  ok: boolean;
  errors: OrderFieldErrors;
  /** Present only when `ok` is true. */
  value?: OrderRequest;
}

/**
 * Contact and address are validated on their own because the waitlist needs
 * exactly these two and nothing else — someone outside the area has no
 * pickup window or service tier to give us.
 */
function validateContactAndAddress(
  body: Record<string, unknown>,
  errors: OrderFieldErrors
) {
  const contact = (body.contact ?? {}) as Record<string, unknown>;
  const address = (body.address ?? {}) as Record<string, unknown>;

  const firstName = text(contact.firstName);
  if (!firstName) errors["contact.firstName"] = "We need a first name.";
  else if (firstName.length > MAX_LENGTHS.name)
    errors["contact.firstName"] = "That name is too long.";

  const lastName = text(contact.lastName);
  if (!lastName) errors["contact.lastName"] = "We need a last name.";
  else if (lastName.length > MAX_LENGTHS.name)
    errors["contact.lastName"] = "That name is too long.";

  const phone = text(contact.phone);
  const phoneDigits = digitsOf(phone);
  if (!phone) errors["contact.phone"] = "We need a number to confirm pickup.";
  else if (phoneDigits.length < 10)
    errors["contact.phone"] = "That does not look like a full phone number.";
  else if (phone.length > MAX_LENGTHS.phone)
    errors["contact.phone"] = "That number is too long.";

  const email = text(contact.email);
  if (!email) errors["contact.email"] = "We send your confirmation here.";
  else if (!EMAIL_PATTERN.test(email) || email.length > MAX_LENGTHS.email)
    errors["contact.email"] = "Check that email address.";

  const label = text(address.label);
  const lat = Number(address.lat);
  const lon = Number(address.lon);
  const hasCoordinates =
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180;

  if (!label) {
    errors["address.label"] = "Pick your address from the suggestions.";
  } else if (!hasCoordinates) {
    // Typing an address without choosing a suggestion leaves us unable to
    // measure the distance, so the order cannot be priced or routed.
    errors["address.label"] =
      "Choose your address from the dropdown so we can work out delivery.";
  } else if (label.length > MAX_LENGTHS.addressLabel) {
    errors["address.label"] = "That address is too long.";
  }

  return {
    contact: { firstName, lastName, phone, email },
    address: {
      label,
      context: text(address.context).slice(0, MAX_LENGTHS.addressContext),
      lat,
      lon,
      notes: text(address.notes).slice(0, MAX_LENGTHS.addressNotes),
    },
  };
}

export interface WaitlistValidationResult {
  ok: boolean;
  errors: OrderFieldErrors;
  value?: WaitlistRequest;
}

export function validateWaitlistRequest(
  input: unknown
): WaitlistValidationResult {
  const errors: OrderFieldErrors = {};
  const body = (input ?? {}) as Record<string, unknown>;
  const value = validateContactAndAddress(body, errors);

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, errors, value };
}

export function validateOrderRequest(input: unknown): ValidationResult {
  const errors: OrderFieldErrors = {};
  const body = (input ?? {}) as Record<string, unknown>;

  const { contact, address } = validateContactAndAddress(body, errors);

  const service = (body.service ?? {}) as Record<string, unknown>;
  const pickup = (body.pickup ?? {}) as Record<string, unknown>;

  // ---- Service -----------------------------------------------------------
  const tierId = text(service.tierId);
  if (!isTurnaroundTierId(tierId))
    errors["service.tierId"] = "Choose how fast you need it back.";

  const rawAddOns = Array.isArray(service.addOnIds) ? service.addOnIds : [];
  const addOnIds = Array.from(new Set(rawAddOns.filter(isAddOnId)));
  if (rawAddOns.length !== addOnIds.length)
    errors["service.addOnIds"] = "One of those extras is not available.";

  const weight = Number(service.estimatedWeightLbs);
  if (!Number.isFinite(weight) || weight <= 0)
    errors["service.estimatedWeightLbs"] = "Roughly how heavy is the load?";
  else if (weight > MAX_WEIGHT_LBS)
    errors["service.estimatedWeightLbs"] =
      "That is a commercial load — give us a call and we will quote it.";

  // ---- Pickup ------------------------------------------------------------
  const dateValue = text(pickup.date);
  const windowId = text(pickup.windowId);

  if (!isValidIsoDate(dateValue)) {
    errors["pickup.date"] = "Choose a pickup day.";
  } else if (dateValue < businessToday()) {
    errors["pickup.date"] = "That day has already passed.";
  } else if (dateValue > businessDatePlus(MAX_DAYS_AHEAD)) {
    errors["pickup.date"] = `Please book within ${MAX_DAYS_AHEAD} days.`;
  }

  if (!getPickupWindow(windowId)) {
    errors["pickup.windowId"] = "Choose a pickup window.";
  } else if (!errors["pickup.date"]) {
    // Two separate mistakes, told apart so the message is actually useful: a
    // window the schedule does not run that day, versus one that ran earlier
    // today and is already over.
    const runsToday = pickupWindowsOnWeekday(dateValue).some(
      (window) => window.id === windowId
    );
    const stillOpen = pickupWindowsForDate(dateValue).some(
      (window) => window.id === windowId
    );

    if (!runsToday) {
      errors["pickup.windowId"] = "We do not run that window on the day chosen.";
    } else if (!stillOpen) {
      errors["pickup.windowId"] =
        "That window has already passed today. Pick a later one.";
    }
  }

  // ---- Terms -------------------------------------------------------------
  const acceptedCancellationPolicy = body.acceptedCancellationPolicy === true;
  if (!acceptedCancellationPolicy) {
    errors["acceptedCancellationPolicy"] =
      "Please confirm you have read the cancellation policy.";
  }

  // ---- Payment (optional at schema level; /api/book requires it when Stripe is on)
  const paymentBody = (body.payment ?? null) as Record<string, unknown> | null;
  let payment: OrderRequest["payment"] | undefined;
  if (paymentBody) {
    const customerId = text(paymentBody.customerId);
    const paymentMethodId = text(paymentBody.paymentMethodId);
    const setupIntentId = text(paymentBody.setupIntentId);
    if (
      !customerId.startsWith("cus_") ||
      !paymentMethodId.startsWith("pm_") ||
      !setupIntentId.startsWith("seti_")
    ) {
      errors["payment"] = "Card details are incomplete. Please try the card again.";
    } else {
      payment = { customerId, paymentMethodId, setupIntentId };
    }
  }

  const checkoutSessionId = text(body.checkoutSessionId);
  let checkout: string | undefined;
  if (checkoutSessionId) {
    if (!checkoutSessionId.startsWith("cs_")) {
      errors["payment"] = "Card checkout is incomplete. Please try again.";
    } else {
      checkout = checkoutSessionId;
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    errors,
    value: {
      contact,
      address,
      service: {
        tierId: tierId as OrderRequest["service"]["tierId"],
        addOnIds,
        estimatedWeightLbs: Math.round(weight),
      },
      pickup: {
        date: dateValue,
        windowId: windowId as PickupWindowId,
      },
      instructions: text(body.instructions).slice(0, MAX_LENGTHS.instructions),
      acceptedCancellationPolicy,
      ...(payment ? { payment } : {}),
      ...(checkout ? { checkoutSessionId: checkout } : {}),
    },
  };
}

/**
 * Separate from field validation because it needs a measured distance, which
 * only the server has after routing the address.
 */
export function serviceAreaError(distanceMiles: number): string | null {
  if (isWithinServiceArea(distanceMiles)) return null;
  return `That address is about ${distanceMiles} miles out, and we book pickups within ${MAX_SERVICE_RADIUS_MILES} miles. Leave your details and we will let you know as soon as we reach you — or give us a call, since longer runs are sometimes still possible.`;
}
