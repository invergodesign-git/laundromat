/**
 * Charge a saved card off-session (customer not at the keyboard).
 * Used right after booking once Checkout setup has attached a card.
 */

import "server-only";

import Stripe from "stripe";
import { getStripe } from "./config";
import { roundToCent } from "@/lib/utils";

export interface ChargeResult {
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export async function chargeOffSession(input: {
  customerId: string;
  paymentMethodId: string;
  /** Dollars (e.g. 68.39). Converted to cents for Stripe. */
  amountDollars: number;
  reference: string;
  /** Stable key so a retry does not double-charge. */
  idempotencyKey: string;
  description?: string;
}): Promise<ChargeResult | { error: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { error: "Card charging is briefly unavailable." };
  }

  const amountCents = Math.round(roundToCent(input.amountDollars) * 100);
  if (!Number.isFinite(amountCents) || amountCents < 50) {
    return { error: "That charge amount is too small to process." };
  }

  try {
    const intent = await stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency: "usd",
        customer: input.customerId,
        payment_method: input.paymentMethodId,
        off_session: true,
        confirm: true,
        description:
          input.description ??
          `California Laundromat pickup ${input.reference}`,
        metadata: {
          source: "website-booking",
          reference: input.reference,
        },
      },
      { idempotencyKey: input.idempotencyKey }
    );

    if (intent.status !== "succeeded") {
      return {
        error:
          intent.status === "requires_action"
            ? "That card needs extra verification. Please try another card or call us."
            : "The card charge did not go through. Please try another card.",
      };
    }

    return {
      paymentIntentId: intent.id,
      amount: roundToCent(amountCents / 100),
      currency: intent.currency,
      status: intent.status,
    };
  } catch (caught) {
    console.error("[stripe] chargeOffSession failed", caught);
    if (caught instanceof Stripe.errors.StripeCardError) {
      return {
        error:
          caught.message ||
          "That card was declined. Please try another card.",
      };
    }
    return {
      error: "We could not charge that card. Please try again or call us.",
    };
  }
}
