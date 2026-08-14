/**
 * Verified business facts only. Nothing in this file should be a marketing
 * claim, a statistic, or a guarantee — just the real, known details
 * provided by the business owner.
 */

export const BUSINESS = {
  ownerFirstName: "Robert",
  name: "California Laundromat",
  city: "San Diego, CA",
  servingArea: "Mission Valley, San Diego",
  address: "2575 Old Quarry Road, San Diego, CA",
  washFoldRateLabel: "$3.25 / lb",
  /** Shown until Robert confirms published hours. */
  hoursLabel: "Call to confirm hours",
  mapsHref:
    "https://www.google.com/maps/dir/?api=1&destination=2575+Old+Quarry+Road,+San+Diego,+CA",
  // TODO(Robert): swap in the real business line before this goes live —
  // this is a clearly-marked placeholder, not a working number.
  phoneDisplay: "(619) 000-0000",
  phoneHref: "tel:+16190000000",
} as const;
