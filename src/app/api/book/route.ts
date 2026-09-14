/**
 * Pickup request intake.
 *
 * This is the only place an order enters the business. It validates the
 * request, measures the distance itself, prices it itself, and only then
 * emails a ticket to the shop and a confirmation to the customer.
 *
 * The browser's own totals are never trusted. A calculator in a page can be
 * edited by anyone with dev tools open, so the figures on the ticket the
 * business works from are recomputed here from the address and the weight.
 */

import { callerKey, RateLimiter } from "@/lib/geo/cache";
import { getGeoProvider } from "@/lib/geo";
import { GeoError } from "@/lib/geo/types";
import { getEmailProvider, getOrderInbox, EmailError } from "@/lib/email";
import { createOrderReference } from "@/lib/orders/reference";
import {
  renderBusinessEmail,
  renderCustomerEmail,
} from "@/lib/orders/render";
import { serviceAreaError, validateOrderRequest } from "@/lib/orders/schema";
import type { Order } from "@/lib/orders/types";
import { calculateEstimate } from "@/lib/pricing";
import { BUSINESS } from "@/lib/business";
import { isStripeConfigured } from "@/lib/stripe/config";
import { chargeOffSession } from "@/lib/stripe/charge";
import {
  markSetupIntentBooked,
  verifyCheckoutSession,
  verifySetupIntent,
} from "@/lib/stripe/verify";

/** Booking is deliberate and rare, so this can be far tighter than search. */
const limiter = new RateLimiter(8, 60 * 60 * 1000);

const MAX_BODY_BYTES = 16 * 1024;

function error(status: number, message: string, fields?: Record<string, string>) {
  return Response.json({ error: message, fields }, { status });
}

export async function POST(request: Request) {
  const caller = callerKey(request);
  if (!limiter.allow(caller)) {
    return error(
      429,
      "That is a lot of bookings in a short time. Give us a call instead."
    );
  }

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return error(413, "That request was too large.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "We could not read that request.");
  }

  const validation = validateOrderRequest(body);
  if (!validation.ok || !validation.value) {
    return error(
      422,
      "Some details need another look.",
      validation.errors
    );
  }
  const submitted = validation.value;

  // ---- Measure and price on the server ------------------------------------
  const geo = getGeoProvider();
  if (!geo) {
    console.error("[book] geo provider unconfigured — cannot price an order");
    return error(
      503,
      `Online booking is briefly unavailable. Please call ${BUSINESS.phoneDisplay} and we will take your order over the phone.`
    );
  }

  let distanceMiles: number;
  try {
    distanceMiles = await geo.drivingDistanceMiles(
      { lat: submitted.address.lat, lon: submitted.address.lon },
      request.signal
    );
  } catch (caught) {
    if (caught instanceof GeoError && caught.code === "no_route") {
      return error(422, "We could not find a driving route to that address.", {
        "address.label": "We could not find a driving route to that address.",
      });
    }
    console.error("[book] distance lookup failed", caught);
    return error(
      503,
      `We could not work out the delivery for that address. Please call ${BUSINESS.phoneDisplay}.`
    );
  }

  const outOfArea = serviceAreaError(distanceMiles);
  if (outOfArea) {
    return error(422, outOfArea, { "address.label": outOfArea });
  }

  const estimate = calculateEstimate({
    weightLbs: submitted.service.estimatedWeightLbs,
    distanceMiles,
    tierId: submitted.service.tierId,
    addOnIds: submitted.service.addOnIds,
  });

  // ---- Card on file -------------------------------------------------------
  // When Stripe is configured, a booking without a verified Checkout session
  // (or legacy SetupIntent) is rejected, then the estimate is charged immediately.
  let cardOnFile: Order["cardOnFile"];
  if (isStripeConfigured()) {
    if (submitted.checkoutSessionId) {
      const verified = await verifyCheckoutSession(submitted.checkoutSessionId);
      if ("error" in verified) {
        return error(422, verified.error, { payment: verified.error });
      }
      cardOnFile = verified;
    } else if (submitted.payment) {
      const verified = await verifySetupIntent(submitted.payment);
      if ("error" in verified) {
        return error(422, verified.error, { payment: verified.error });
      }
      cardOnFile = verified;
    } else {
      return error(422, "Please add a card before booking.", {
        payment: "Please add a card before booking.",
      });
    }
  }

  const reference = createOrderReference();

  let charge: Order["charge"];
  if (cardOnFile) {
    const charged = await chargeOffSession({
      customerId: cardOnFile.customerId,
      paymentMethodId: cardOnFile.paymentMethodId,
      amountDollars: estimate.total,
      reference,
      idempotencyKey: `book-charge-${cardOnFile.setupIntentId}`,
      description: `California Laundromat ${reference} (estimate)`,
    });
    if ("error" in charged) {
      return error(402, charged.error, { payment: charged.error });
    }
    charge = charged;
  }

  const order: Order = {
    ...submitted,
    reference,
    receivedAt: new Date().toISOString(),
    distanceMiles,
    deliveryFee: estimate.deliveryFee,
    billableWeightLbs: estimate.billableLbs,
    minimumApplied: estimate.minimumApplied,
    laundryTotal: estimate.laundryTotal,
    addOnTotal: estimate.lines
      .filter((line) => line.id !== estimate.tier.id)
      .reduce((sum, line) => sum + line.amount, 0),
    total: estimate.total,
    ...(cardOnFile ? { cardOnFile } : {}),
    ...(charge ? { charge } : {}),
  };

  // ---- Deliver it ---------------------------------------------------------
  const email = getEmailProvider();
  const inbox = getOrderInbox();

  // Local Stripe testing often has no Resend keys. Opt-in only — never silent
  // on production without email.
  const allowWithoutEmail =
    process.env.BOOKING_ALLOW_NO_EMAIL?.trim() === "true";

  if (!email || !inbox) {
    if (!allowWithoutEmail) {
      console.error("[book] email unconfigured — order could not be delivered", {
        reference: order.reference,
      });
      return error(
        503,
        "Booking email is not configured on this server (RESEND_API_KEY, ORDER_EMAIL_FROM, ORDER_EMAIL_TO). For local Stripe tests set BOOKING_ALLOW_NO_EMAIL=true in .env.local, or add the Resend keys."
      );
    }

    console.warn(
      "[book] BOOKING_ALLOW_NO_EMAIL — accepting order without email",
      {
        reference: order.reference,
        email: order.contact.email,
        total: order.total,
        charge: order.charge?.paymentIntentId ?? null,
        card: order.cardOnFile
          ? `${order.cardOnFile.brand} ${order.cardOnFile.last4}`
          : null,
      }
    );

    if (order.cardOnFile) {
      await markSetupIntentBooked(
        order.cardOnFile.setupIntentId,
        order.reference
      );
    }

    return Response.json(bookingSuccessPayload(order, { emailSkipped: true }));
  }

  const ticket = renderBusinessEmail(order);
  try {
    await email.send({
      to: inbox,
      subject: ticket.subject,
      text: ticket.text,
      html: ticket.html,
      // Replying to the ticket should reach the customer directly.
      replyTo: order.contact.email,
    });
  } catch (caught) {
    const message =
      caught instanceof EmailError
        ? caught.message
        : "The order could not be sent.";
    console.error("[book] failed to deliver order to the business", {
      reference: order.reference,
      message,
    });
    return error(
      502,
      `We could not submit that booking. Please call ${BUSINESS.phoneDisplay} — sorry about that.`
    );
  }

  // The customer's copy is a courtesy. The business already has the order, so
  // a failure here must not tell the customer their booking did not land.
  const confirmation = renderCustomerEmail(order);
  try {
    await email.send({
      to: order.contact.email,
      subject: confirmation.subject,
      text: confirmation.text,
      html: confirmation.html,
      replyTo: inbox,
    });
  } catch (caught) {
    console.error("[book] confirmation email failed", {
      reference: order.reference,
      caught,
    });
  }

  if (order.cardOnFile) {
    await markSetupIntentBooked(
      order.cardOnFile.setupIntentId,
      order.reference
    );
  }

  return Response.json(bookingSuccessPayload(order));
}

function bookingSuccessPayload(
  order: Order,
  extras?: { emailSkipped?: boolean }
) {
  return {
    reference: order.reference,
    distanceMiles: order.distanceMiles,
    deliveryFee: order.deliveryFee,
    total: order.total,
    ...(extras?.emailSkipped ? { emailSkipped: true } : {}),
    ...(order.charge
      ? {
          charged: true,
          chargedAmount: order.charge.amount,
          paymentIntentId: order.charge.paymentIntentId,
        }
      : { charged: false }),
    ...(order.cardOnFile
      ? {
          card: {
            brand: order.cardOnFile.brand,
            last4: order.cardOnFile.last4,
          },
        }
      : {}),
  };
}
