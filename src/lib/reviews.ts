/**
 * Customer reviews.
 *
 * Append an entry to publish it — the review wall, the average rating and the
 * review count on every page read from this list. If the list is emptied, the
 * UI falls back to a "be the first to review us" invitation rather than
 * rendering a blank section.
 */

import { BUSINESS } from "./business";

export interface Review {
  /** Reviewer's name as they gave it. */
  name: string;
  /** Neighbourhood or area, optional. */
  location?: string;
  /** 1–5. */
  rating: number;
  /** ISO date the review was left. */
  date: string;
  body: string;
  /** Where it was left, e.g. "Google". */
  source?: string;
}

export const REVIEWS: readonly Review[] = [
  {
    name: "Danielle R.",
    location: "Mission Valley",
    rating: 5,
    date: "2026-07-30",
    source: "Google",
    body: "I booked the 2 day service on a Monday and had everything back folded on Wednesday morning, exactly like they said. What sold me is that they weighed the bag in front of me and the price was the same one the website calculator gave me. No surprise add-ons at the end.",
  },
  {
    name: "Marcus T.",
    location: "Linda Vista",
    rating: 5,
    date: "2026-07-11",
    source: "Google",
    body: "Sent in a king comforter that my machine at home has never managed to wash properly. It came back clean and, more importantly, the filling was still even instead of bunched into one corner. Flat price, no weighing, no drama.",
  },
  {
    name: "Priya S.",
    location: "Grantville",
    rating: 5,
    date: "2026-06-19",
    source: "Google",
    body: "We run a barbershop and the weekly towel service has genuinely taken a job off my plate — they track what we have out and top us up before we run short. My son also reacts to most detergents and the low-scent one they use has been completely fine.",
  },
];

export const HAS_REVIEWS = REVIEWS.length > 0;

export const AVERAGE_RATING = HAS_REVIEWS
  ? Math.round(
      (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length) * 10
    ) / 10
  : null;

/**
 * Where "Leave a review" points. Uses the configured review URL when the
 * business listing is live, and falls back to email so the button is never
 * a dead end.
 */
export const LEAVE_REVIEW = BUSINESS.reviewHref
  ? {
      href: BUSINESS.reviewHref,
      isExternal: true,
      label: "Leave a review",
      helper: "Opens our review page in a new tab.",
    }
  : {
      href: `${BUSINESS.emailHref}?subject=${encodeURIComponent(
        "My review of California Laundromat"
      )}`,
      isExternal: false,
      label: "Send us your review",
      helper: `Email it to ${BUSINESS.email} and we will publish it here.`,
    };
