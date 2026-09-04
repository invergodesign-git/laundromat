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
  /** Registered entity name — used where the legal name is required. */
  legalName: "California Laundromat, LLC",
  city: "San Diego, CA",
  servingArea: "Mission Valley, San Diego",
  /**
   * Short line for the header strip and footer. Booking really is always
   * open, so this is the honest headline — the driver's road hours are in
   * `HOURS` below and shown wherever there is room for the detail.
   */
  hoursLabel: "Book online 24/7",
  // TODO: swap in the real business line before this goes live — this is a
  // clearly-marked placeholder, not a working number.
  phoneDisplay: "(619) 000-0000",
  phoneHref: "tel:+16190000000",
  email: "washnow@californialaundromat.com",
  emailHref: "mailto:washnow@californialaundromat.com",
  /**
   * Mailing address only — not a shop customers visit, and not the pickup
   * origin used for mileage. Shown in contact so mail and formal notices
   * have somewhere to go.
   */
  poBox: "PO Box 83772, San Diego, CA 92138",
  /**
   * Google Business listing. Env overrides this if a dedicated write-a-review
   * URL is added later; until then the share link the owner sent is enough
   * to open the listing.
   */
  reviewHref:
    process.env.NEXT_PUBLIC_REVIEW_URL?.trim() ||
    "https://share.google/vAXhy2Q2I6lQn7cNc",
} as const;

/**
 * The business runs on Pacific time. Everything date-related is pinned to it
 * explicitly rather than read from the machine's clock, because the site is
 * rendered on servers running UTC — without this, a booking made at 9pm on a
 * Friday in San Diego would be judged against Saturday's schedule.
 *
 * Pinning it also means the server and the browser always agree, whatever
 * timezone the customer happens to be in.
 */
export const BUSINESS_TIMEZONE = "America/Los_Angeles";

/** Today's date in the business's timezone, as `YYYY-MM-DD`. */
export function businessToday(): string {
  // en-CA formats as YYYY-MM-DD, which sorts correctly as a string.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Minutes since midnight right now, in the business's timezone. */
export function businessMinutesNow(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  // Some runtimes render midnight as hour 24.
  return (value("hour") % 24) * 60 + value("minute");
}

/** `YYYY-MM-DD`, `days` after today, in the business's timezone. */
export function businessDatePlus(days: number): string {
  const [year, month, day] = businessToday().split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Day of week (0 = Sunday) for a `YYYY-MM-DD` string. */
export function weekdayOf(isoDate: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/**
 * The windows a driver is actually on the road. Weekdays run a day and a
 * night shift; weekends and holidays run one long shift.
 *
 * `weekdays` holds day numbers (0 = Sunday) so the form can offer only the
 * windows that exist on the chosen date. `endMinutes` lets us drop a window
 * that has already finished today, rather than accepting a pickup for a slot
 * the van has already driven.
 */
export const PICKUP_WINDOWS = [
  {
    id: "weekday-day",
    label: "9:30 AM – 2:30 PM",
    weekdays: [1, 2, 3, 4, 5],
    startMinutes: 9 * 60 + 30,
    endMinutes: 14 * 60 + 30,
  },
  {
    id: "weekday-night",
    label: "7:30 PM – 10:30 PM",
    weekdays: [1, 2, 3, 4, 5],
    startMinutes: 19 * 60 + 30,
    endMinutes: 22 * 60 + 30,
  },
  {
    id: "weekend-day",
    label: "9:30 AM – 7:30 PM",
    weekdays: [0, 6],
    startMinutes: 9 * 60 + 30,
    endMinutes: 19 * 60 + 30,
  },
] as const;

export type PickupWindowId = (typeof PICKUP_WINDOWS)[number]["id"];
export type PickupWindow = (typeof PICKUP_WINDOWS)[number];

export function getPickupWindow(id: string): PickupWindow | null {
  return PICKUP_WINDOWS.find((window) => window.id === id) ?? null;
}

/**
 * Every window the schedule runs on that day, whatever the time. Kept apart
 * from `pickupWindowsForDate` so a rejection can say which of the two things
 * went wrong: the wrong day, or too late in the day.
 */
export function pickupWindowsOnWeekday(isoDate: string): PickupWindow[] {
  const day = weekdayOf(isoDate);
  if (day === null) return [];
  return PICKUP_WINDOWS.filter((window) =>
    (window.weekdays as readonly number[]).includes(day)
  );
}

/**
 * Windows that can still be booked on `isoDate`. On today's date, windows
 * whose end time has already passed are excluded.
 */
export function pickupWindowsForDate(isoDate: string): PickupWindow[] {
  const onThisDay = pickupWindowsOnWeekday(isoDate);
  if (isoDate !== businessToday()) return onThisDay;

  const now = businessMinutesNow();
  return onThisDay.filter((window) => window.endMinutes > now);
}

/**
 * The soonest date with a window still open. Used as the form's default so
 * nobody lands on a day they cannot actually book.
 */
export function firstBookableDate(): string {
  for (let offset = 0; offset < 8; offset += 1) {
    const date = businessDatePlus(offset);
    if (pickupWindowsForDate(date).length > 0) return date;
  }
  return businessToday();
}

/**
 * Two different clocks, and customers care about the difference: you can
 * place an order at any hour, but a van only comes past during the windows
 * above. Keeping them separate avoids implying a 3am pickup is possible.
 */
export const HOURS = {
  booking: {
    label: "Booking",
    value: "24 hours a day, every day",
    detail:
      "Order online whenever it suits you, or call and leave us a message any time.",
  },
  /** Grouped for display. Same windows as `PICKUP_WINDOWS`, worded for people. */
  pickup: [
    {
      days: "Monday to Friday",
      windows: ["9:30 AM – 2:30 PM", "7:30 PM – 10:30 PM"],
    },
    {
      days: "Saturday, Sunday & holidays",
      windows: ["9:30 AM – 7:30 PM"],
    },
  ],
} as const;

/**
 * How long before a window starts that a booking can still be cancelled for
 * free. Past this the driver is being routed, so the run is already a cost.
 *
 * TODO: confirm this figure with the owner — it is a policy decision, not a
 * technical one, and it is deliberately in one place so it is a one-line
 * change once settled.
 */
export const FREE_CANCELLATION_HOURS = 2;

/**
 * The cancellation terms a customer agrees to when booking. Worded to be
 * firm about the charge but clear that it comes back if they rebook — the
 * point is to stop no-shows, not to punish people.
 */
export const CANCELLATION_POLICY = {
  headline: `Free to cancel up to ${FREE_CANCELLATION_HOURS} hours before your window.`,
  terms: [
    `Cancel more than ${FREE_CANCELLATION_HOURS} hours before your pickup window starts and there is no charge at all.`,
    "After that the driver is already being routed to you, so a late cancellation is charged.",
    "If we arrive and there is no laundry to collect, that counts as a late cancellation.",
    "Any late cancellation charge is credited back against your next order when you rebook.",
  ],
  /** Shown next to the acknowledgement control at booking. */
  agreement: `I understand that cancelling within ${FREE_CANCELLATION_HOURS} hours of my pickup window, or not having laundry ready when the driver arrives, may be charged — and that the charge is credited back when I rebook.`,
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
