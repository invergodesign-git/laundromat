import { BUSINESS } from "@/lib/business";
import { callerKey, RateLimiter } from "@/lib/geo/cache";
import { getStripe, isStripeConfigured } from "@/lib/stripe/config";

/**
 * Creates (or reuses) a Stripe Customer and a SetupIntent so the booking
 * form can save a card without charging it.
 */

const limiter = new RateLimiter(20, 60 * 60 * 1000);

function error(status: number, message: string) {
  return Response.json({ error: message }, { status });
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

  let body: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  try {
    body = await request.json();
  } catch {
    return error(400, "We could not read that request.");
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const firstName =
    typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (!email || !email.includes("@")) {
    return error(422, "We need a valid email before saving a card.");
  }

  const stripe = getStripe();
  if (!stripe) {
    return error(
      503,
      `Card saving is briefly unavailable. Please call ${BUSINESS.phoneDisplay}.`
    );
  }

  try {
    // Prefer an existing customer with this email so repeats do not scatter.
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer =
      existing.data[0] ??
      (await stripe.customers.create({
        email,
        name: `${firstName} ${lastName}`.trim() || undefined,
        phone: phone || undefined,
        metadata: { source: "website-booking" },
      }));

    if (existing.data[0] && (firstName || lastName || phone)) {
      await stripe.customers.update(customer.id, {
        name: `${firstName} ${lastName}`.trim() || customer.name || undefined,
        phone: phone || customer.phone || undefined,
      });
    }

    // Keep in sync with Elements `paymentMethodTypes: ["card"]` — mixing
    // automatic_payment_methods on one side and payment_method_types on the
    // other makes confirmSetup reject the collected Payment Element data.
    const intent = await stripe.setupIntents.create({
      customer: customer.id,
      usage: "off_session",
      payment_method_types: ["card"],
      metadata: { source: "website-booking" },
    });

    if (!intent.client_secret) {
      return error(502, "Stripe did not return a setup secret.");
    }

    return Response.json({
      customerId: customer.id,
      clientSecret: intent.client_secret,
      setupIntentId: intent.id,
      testMode: intent.livemode === false,
    });
  } catch (caught) {
    console.error("[stripe] setup-intent failed", caught);
    return error(
      502,
      `We could not start card saving. Please call ${BUSINESS.phoneDisplay}.`
    );
  }
}
