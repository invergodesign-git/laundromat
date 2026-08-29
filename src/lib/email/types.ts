/**
 * Provider-agnostic email contract, mirroring `src/lib/geo`. Swapping Resend
 * for Postmark or SES means adding one module here and changing one line in
 * `index.ts` — nothing that sends mail needs to know which service is used.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  /** Plain text is required; HTML is an enhancement. */
  text: string;
  html?: string;
  /** Where a customer's reply should land. */
  replyTo?: string;
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<void>;
}

export type EmailErrorCode = "unconfigured" | "upstream";

export class EmailError extends Error {
  constructor(
    readonly code: EmailErrorCode,
    message: string
  ) {
    super(message);
    this.name = "EmailError";
  }
}
