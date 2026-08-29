/**
 * Resolves the configured email provider.
 *
 * SERVER ONLY.
 */

import "server-only";

import { getEmailConfig, type EmailConfig } from "./config";
import { createResendProvider } from "./resend";
import type { EmailProvider } from "./types";

let cached: EmailProvider | null | undefined;

/** Returns null when email is not configured, so callers can degrade. */
export function getEmailProvider(): EmailProvider | null {
  if (cached !== undefined) return cached;

  const config = getEmailConfig();
  cached = config ? createResendProvider(config) : null;
  return cached;
}

export function getOrderInbox(): string | null {
  return getEmailConfig()?.orderInbox ?? null;
}

export type { EmailConfig };
export * from "./types";
