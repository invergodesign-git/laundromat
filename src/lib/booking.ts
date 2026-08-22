/**
 * Booking target.
 *
 * Square online booking will own this action. Until the Square account is
 * connected, every "Book now" in the UI falls back to the pricing page, where
 * a customer can price their order and call. When Square goes live, set
 * `NEXT_PUBLIC_BOOKING_URL` and every button on the site switches over — no
 * component changes required.
 */

const configured = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();

export const BOOKING = {
  /** True once a real Square booking URL is configured. */
  isLive: Boolean(configured),
  href: configured || "/pricing",
  /** External targets need to open in a new tab. */
  target: configured ? "_blank" : undefined,
  rel: configured ? "noopener noreferrer" : undefined,
} as const;
