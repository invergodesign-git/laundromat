/**
 * Stripe configuration.
 *
 * SERVER ONLY for the secret key. Publishable key is also readable here for
 * the setup-intent route; the browser loads it from NEXT_PUBLIC_*.
 */

import "server-only";

import Stripe from "stripe";

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  /** True when keys are pk_test_ / sk_test_. */
  isTestMode: boolean;
}

let cachedConfig: StripeConfig | null | undefined;
let cachedClient: Stripe | null | undefined;
let warned = false;

export function getStripeConfig(): StripeConfig | null {
  if (cachedConfig !== undefined) return cachedConfig;

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();

  if (!secretKey || !publishableKey) {
    if (!warned) {
      warned = true;
      console.warn(
        "[stripe] Card-on-file disabled. Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY."
      );
    }
    cachedConfig = null;
    return cachedConfig;
  }

  const isTestMode =
    secretKey.startsWith("sk_test_") && publishableKey.startsWith("pk_test_");

  if (
    (secretKey.startsWith("sk_test_") && !publishableKey.startsWith("pk_test_")) ||
    (secretKey.startsWith("sk_live_") && !publishableKey.startsWith("pk_live_"))
  ) {
    console.error(
      "[stripe] Publishable and secret keys are from different modes — refusing to start."
    );
    cachedConfig = null;
    return cachedConfig;
  }

  cachedConfig = { secretKey, publishableKey, isTestMode };
  return cachedConfig;
}

/** Null when Stripe is not configured — callers degrade gracefully. */
export function getStripe(): Stripe | null {
  if (cachedClient !== undefined) return cachedClient;

  const config = getStripeConfig();
  if (!config) {
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = new Stripe(config.secretKey);
  return cachedClient;
}

export function isStripeConfigured(): boolean {
  return getStripeConfig() !== null;
}
