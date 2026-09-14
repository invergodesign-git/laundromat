import { BUSINESS } from "@/lib/business";
import { callerKey, RateLimiter } from "@/lib/geo/cache";
import { getStripe, isStripeConfigured } from "@/lib/stripe/config";
import { requestOrigin } from "@/lib/stripe/origin";
import { validateOrderRequest } from "@/lib/orders/schema";

/**
 * Starts Stripe-hosted Checkout in setup mode — collects a card.
 * After return, /api/book charges the estimated total off-session.
 */

const limiter = new RateLimiter(20, 60 * 60 * 1000);

function error(status: number, message: string, fields?: Record<string, string>) {
  return Response.json({ error: message, fields }, { status });
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return error(
      503,
      `Card saving is briefly unavailable. Please call ${BUSINESS.phoneDisplay}.`
    );
  }

  if (!limiter.allow(callerKey(request))) {
    return error(429, "Too many card attempts. Give us a call instead.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "We could not read that request.");
  }

  // Validate the full booking draft before sending anyone to Stripe.
  const validation = validateOrderRequest(body);
  if (!validation.ok || !validation.value) {
    return error(422, "Some details need another look.", validation.errors);
  }

  const submitted = validation.value;
  const stripe = getStripe();
  if (!stripe) {
    return error(
      503,
      `Card saving is briefly unavailable. Please call ${BUSINESS.phoneDisplay}.`
    );
  }

  const { email, firstName, lastName, phone } = submitted.contact;
  const origin = requestOrigin(request);

  try {
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer =
      existing.data[0] ??
      (await stripe.customers.create({
        email,
        name: `${firstName} ${lastName}`.trim() || undefined,
        phone: phone || undefined,
        metadata: { source: "website-booking" },
      }));

    if (existing.data[0]) {
      await stripe.customers.update(customer.id, {
        name: `${firstName} ${lastName}`.trim() || customer.name || undefined,
        phone: phone || customer.phone || undefined,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      currency: "usd",
      customer: customer.id,
      payment_method_types: ["card"],
      success_url: `${origin}/book/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book?checkout=cancelled`,
      metadata: { source: "website-booking" },
    });

    if (!session.url) {
      return error(502, "Stripe did not return a checkout URL.");
    }

    return Response.json({
      url: session.url,
      sessionId: session.id,
      customerId: customer.id,
      testMode: session.livemode === false,
    });
  } catch (caught) {
    console.error("[stripe] checkout-session failed", caught);
    return error(
      502,
      `We could not open card checkout. Please call ${BUSINESS.phoneDisplay}.`
    );
  }
}
