/**
 * Stripe card-on-file smoke test against a running server.
 *
 * Creates a real SetupIntent with Stripe's test PaymentMethod, then posts a
 * booking that should verify the card and email the ticket.
 *
 * Usage: node scripts/check-stripe-booking.mjs [baseUrl]
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const BASE = process.argv[2] ?? "http://localhost:3005";
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function nextWeekday() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

async function findAddress(query) {
  const url = new URL("/api/address/suggest", BASE);
  url.searchParams.set("q", query);
  const data = await (await fetch(url)).json();
  return data.suggestions?.[0] ?? null;
}

async function main() {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
    console.error("Need sk_test_ STRIPE_SECRET_KEY in .env.local");
    process.exit(1);
  }

  console.log(`Base: ${BASE}`);
  console.log("1) Creating Stripe customer + SetupIntent (test card)…");

  const customer = await stripe.customers.create({
    email: "stripe-test@example.com",
    name: "Stripe Test",
    phone: "6195550142",
    metadata: { source: "check-stripe-booking" },
  });

  const intent = await stripe.setupIntents.create({
    customer: customer.id,
    usage: "off_session",
    payment_method_types: ["card"],
  });

  const confirmed = await stripe.setupIntents.confirm(intent.id, {
    payment_method: "pm_card_visa",
  });

  if (confirmed.status !== "succeeded") {
    console.error("SetupIntent did not succeed:", confirmed.status);
    process.exit(1);
  }

  const paymentMethodId =
    typeof confirmed.payment_method === "string"
      ? confirmed.payment_method
      : confirmed.payment_method?.id;

  console.log(`   customer ${customer.id}`);
  console.log(`   setupIntent ${confirmed.id}`);
  console.log(`   paymentMethod ${paymentMethodId}`);

  console.log("2) Resolving a San Diego address…");
  const address = await findAddress("Camino De La Reina, San Diego");
  if (!address) {
    console.error("No address suggestion — is GEOAPIFY_API_KEY set?");
    process.exit(1);
  }
  console.log(`   ${address.label}`);

  console.log("3) Posting /api/book with card on file…");
  const response = await fetch(`${BASE}/api/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contact: {
        firstName: "Stripe",
        lastName: "Test",
        phone: "6195550142",
        email: "stripe-test@example.com",
      },
      address: { ...address, notes: "Stripe smoke test" },
      service: {
        tierId: "2-day",
        addOnIds: [],
        estimatedWeightLbs: 24,
      },
      pickup: { date: nextWeekday(), windowId: "weekday-day" },
      instructions: "Stripe card-on-file test — ignore this pickup",
      acceptedCancellationPolicy: true,
      payment: {
        customerId: customer.id,
        paymentMethodId,
        setupIntentId: confirmed.id,
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  console.log(`   HTTP ${response.status}`);
  console.log(`   ${JSON.stringify(payload, null, 2)}`);

  if (!response.ok) process.exit(1);
  if (!payload.card?.last4) {
    console.error("Expected card.last4 on success payload");
    process.exit(1);
  }

  console.log("\nOK — booking accepted with card on file.");
  console.log("Check washnow@ for the ticket (card brand + last4).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
