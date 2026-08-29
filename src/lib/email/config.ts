/**
 * Email configuration, read from the environment.
 *
 * SERVER ONLY — holds the API key.
 */

import "server-only";

export interface EmailConfig {
  apiKey: string;
  /** Verified sender, e.g. "California Laundromat <bookings@…>". */
  from: string;
  /** Where new order tickets land. */
  orderInbox: string;
}

let cached: EmailConfig | null | undefined;
let warned = false;

export function getEmailConfig(): EmailConfig | null {
  if (cached !== undefined) return cached;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.ORDER_EMAIL_FROM?.trim();
  const orderInbox = process.env.ORDER_EMAIL_TO?.trim();

  if (!apiKey || !from || !orderInbox) {
    if (!warned) {
      warned = true;
      console.warn(
        "[email] Online booking is disabled. Set RESEND_API_KEY, ORDER_EMAIL_FROM and ORDER_EMAIL_TO to enable it."
      );
    }
    cached = null;
    return cached;
  }

  cached = { apiKey, from, orderInbox };
  return cached;
}
