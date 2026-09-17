/**
 * Booking + estimator targets.
 *
 * By default every "Book now" goes to `/book`, the site's own intake form.
 * "Estimator" goes to the pricing calculator (`/pricing#pricing`).
 *
 * `NEXT_PUBLIC_BOOKING_URL` overrides the book target only (e.g. external
 * Square). Leave it blank so booking stays on this site.
 */

const configured = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();

export const BOOKING = {
  /** True when booking is handled by an external service rather than by us. */
  isExternal: Boolean(configured),
  href: configured || "/book",
  target: configured ? "_blank" : undefined,
  rel: configured ? "noopener noreferrer" : undefined,
} as const;

/** Price calculator — home `#pricing` or the dedicated pricing page. */
export const ESTIMATOR = {
  href: "/pricing#pricing",
  homeHref: "#pricing",
} as const;
