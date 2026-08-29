/**
 * Booking target.
 *
 * By default every "Book now" goes to `/book`, the site's own intake form —
 * the customer enters their details once and the order arrives complete.
 *
 * `NEXT_PUBLIC_BOOKING_URL` overrides this. Set it to a Square booking page
 * and every button on the site switches over with no component changes, which
 * keeps the option open without committing to it now.
 */

const configured = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();

export const BOOKING = {
  /** True when booking is handled by an external service rather than by us. */
  isExternal: Boolean(configured),
  href: configured || "/book",
  target: configured ? "_blank" : undefined,
  rel: configured ? "noopener noreferrer" : undefined,
} as const;
