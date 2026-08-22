/**
 * Verified business facts only. Nothing in this file should be a marketing
 * claim, a statistic, or a guarantee — just the real, known details
 * provided by the business owner.
 *
 * The owner is referred to by role ("the owner", "our team"), never by
 * personal name, so the site reads as a business rather than one person.
 */

export const BUSINESS = {
  name: "California Laundromat",
  shortName: "California Laundromat",
  city: "San Diego, CA",
  servingArea: "Mission Valley, San Diego",
  hoursLabel: "Call to confirm hours",
  // TODO: swap in the real business line before this goes live — this is a
  // clearly-marked placeholder, not a working number.
  phoneDisplay: "(619) 000-0000",
  phoneHref: "tel:+16190000000",
  email: "hello@californialaundromat.com",
  emailHref: "mailto:hello@californialaundromat.com",
  /**
   * Where "Leave a review" sends people. Point this at the Google Business
   * review link once the listing is confirmed; until then it is the phone.
   */
  reviewHref: process.env.NEXT_PUBLIC_REVIEW_URL ?? "",
} as const;

/**
 * The owner's service promise, supplied verbatim by the business. Displayed
 * as a commitment, so the wording is not paraphrased anywhere in the UI.
 */
export const SERVICE_PROMISE =
  "We will always provide good service and ensure that our customers are treated fairly in any issue that may arise.";

/**
 * How orders are actually washed. Written by the business — the detergent
 * detail matters to customers with allergies and to commercial accounts.
 */
export const PROCESS = {
  headline: "Low-scent, hypoallergenic, and tested on real households.",
  body: "We use low-scent hypoallergenic detergents for all household clothing and bedding, from tested and trusted household and commercial brands. Ask us any time for more information about the detergents we use.",
  notice:
    "Items with special care instructions, heavy grease, or biological contaminants may require specialised non-hypoallergenic or heavy-duty commercial detergents for a superior clean. We can work with your laundry requirements — please tell us about any special requests, and remember that special requirements may increase service costs.",
} as const;
