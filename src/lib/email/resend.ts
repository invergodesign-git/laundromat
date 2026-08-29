/**
 * Resend implementation of `EmailProvider`.
 *
 * SERVER ONLY — this module handles the API key.
 *
 * Uses the REST endpoint directly rather than the SDK. It is one POST, and
 * avoiding the dependency keeps the deploy small and the failure modes
 * visible.
 */

import "server-only";

import type { EmailConfig } from "./config";
import { EmailError, type EmailMessage, type EmailProvider } from "./types";

const SEND_URL = "https://api.resend.com/emails";
const REQUEST_TIMEOUT_MS = 10_000;

export function createResendProvider(config: EmailConfig): EmailProvider {
  return {
    name: "resend",

    async send(message: EmailMessage) {
      let response: Response;

      try {
        response = await fetch(SEND_URL, {
          method: "POST",
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: config.from,
            to: [message.to],
            subject: message.subject,
            text: message.text,
            ...(message.html ? { html: message.html } : {}),
            ...(message.replyTo ? { reply_to: message.replyTo } : {}),
          }),
        });
      } catch (error) {
        console.error("[email] send request failed", error);
        throw new EmailError("upstream", "The email service did not respond.");
      }

      if (!response.ok) {
        // Body carries the reason (unverified domain, bad key). Worth logging
        // because a silent failure here means a lost order.
        const detail = await response.text().catch(() => "");
        console.error(
          `[email] send responded ${response.status}`,
          detail.slice(0, 500)
        );
        throw new EmailError("upstream", "The email service rejected the message.");
      }
    },
  };
}
