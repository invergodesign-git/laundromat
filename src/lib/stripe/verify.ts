/**
 * Confirms a card saved via Stripe Checkout (setup mode) or a raw SetupIntent,
 * and returns the card summary we put on the order ticket.
 *
 * Never trusts the browser's last4 — we re-fetch from Stripe.
 */

import "server-only";

import type Stripe from "stripe";
import { getStripe } from "./config";

export interface VerifiedCardOnFile {
  customerId: string;
  paymentMethodId: string;
  setupIntentId: string;
  brand: string;
  last4: string;
}

async function cardFromSucceededSetupIntent(
  stripe: Stripe,
  intent: Stripe.SetupIntent,
  expectedCustomerId?: string
): Promise<VerifiedCardOnFile | { error: string }> {
  if (intent.status !== "succeeded") {
    return { error: "The card was not saved. Please try again." };
  }

  if (intent.metadata?.booking_reference) {
    return {
      error:
        "That card session was already used for a booking. Start a new pickup request.",
    };
  }

  const customerId =
    typeof intent.customer === "string"
      ? intent.customer
      : intent.customer?.id;

  if (!customerId?.startsWith("cus_")) {
    return { error: "That card does not match this booking." };
  }

  if (expectedCustomerId && customerId !== expectedCustomerId) {
    return { error: "That card does not match this booking." };
  }

  const paymentMethodId =
    typeof intent.payment_method === "string"
      ? intent.payment_method
      : intent.payment_method?.id;

  if (!paymentMethodId?.startsWith("pm_")) {
    return { error: "That card could not be read. Please try again." };
  }

  const method = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (method.customer !== customerId) {
    return { error: "That card is not attached to this customer." };
  }

  const card = method.card;
  if (!card?.last4) {
    return { error: "We could not read that card. Please try another." };
  }

  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  return {
    customerId,
    paymentMethodId,
    setupIntentId: intent.id,
    brand: card.brand ?? "card",
    last4: card.last4,
  };
}

/** Mark the SetupIntent so the same Checkout return cannot book twice. */
export async function markSetupIntentBooked(
  setupIntentId: string,
  reference: string
): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;
  try {
    await stripe.setupIntents.update(setupIntentId, {
      metadata: { booking_reference: reference },
    });
  } catch (caught) {
    console.error("[stripe] markSetupIntentBooked failed", caught);
  }
}

export async function verifySetupIntent(input: {
  customerId: string;
  paymentMethodId: string;
  setupIntentId: string;
}): Promise<VerifiedCardOnFile | { error: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { error: "Card saving is briefly unavailable." };
  }

  const { customerId, paymentMethodId, setupIntentId } = input;

  if (
    !customerId.startsWith("cus_") ||
    !paymentMethodId.startsWith("pm_") ||
    !setupIntentId.startsWith("seti_")
  ) {
    return { error: "That card reference does not look right." };
  }

  try {
    const intent = await stripe.setupIntents.retrieve(setupIntentId);
    const verified = await cardFromSucceededSetupIntent(
      stripe,
      intent,
      customerId
    );
    if ("error" in verified) return verified;
    if (verified.paymentMethodId !== paymentMethodId) {
      return { error: "That card does not match this booking." };
    }
    return verified;
  } catch (caught) {
    console.error("[stripe] verifySetupIntent failed", caught);
    return { error: "We could not confirm that card. Please try again." };
  }
}

/**
 * After Stripe-hosted Checkout (mode=setup), the browser only has a session id.
 * We resolve it server-side to the saved card.
 */
export async function verifyCheckoutSession(
  sessionId: string
): Promise<VerifiedCardOnFile | { error: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { error: "Card saving is briefly unavailable." };
  }

  if (!sessionId.startsWith("cs_")) {
    return { error: "That checkout session does not look right." };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["setup_intent"],
    });

    if (session.mode !== "setup") {
      return { error: "That checkout session is not a card save." };
    }

    if (session.status !== "complete") {
      return { error: "Card checkout was not finished. Please try again." };
    }

    const intent = session.setup_intent;
    if (!intent || typeof intent === "string") {
      return { error: "We could not confirm that card. Please try again." };
    }

    return cardFromSucceededSetupIntent(stripe, intent);
  } catch (caught) {
    console.error("[stripe] verifyCheckoutSession failed", caught);
    return { error: "We could not confirm that card. Please try again." };
  }
}
