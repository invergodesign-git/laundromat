/**
 * Browser-side Stripe helpers. Safe to import from client components — only
 * the publishable key is read.
 */

export function getStripePublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  return key || null;
}

export function isStripePublishableConfigured(): boolean {
  return Boolean(getStripePublishableKey());
}
