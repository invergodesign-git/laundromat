/**
 * The service catalogue.
 *
 * Every service the business offers lives here — copy, pricing rows, imagery
 * and the accent colour it wears across the site. Pages read from this list,
 * so adding a service or changing a price is a one-file edit and the nav,
 * the cards, the detail pages and the price tables all follow.
 *
 * Per-pound wash & fold rates are NOT duplicated here; they come from
 * `pricing.ts`, which is the single source of truth for that math.
 */

import {
  BedDouble,
  Biohazard,
  Footprints,
  Layers,
  PawPrint,
  Shirt,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  LOWEST_RATE_PER_LB,
  MIN_ORDER_LBS,
  TURNAROUND_TIERS,
} from "./pricing";
import { formatCurrency } from "./utils";

/**
 * Accent palettes. Each service owns one so the site stays colourful without
 * any page inventing its own combination.
 */
export type AccentName = "royal" | "ember" | "aqua" | "mint" | "blush" | "rich";

export interface Accent {
  /** Solid tile behind the icon. */
  chip: string;
  /** Card border. */
  ring: string;
  /** Soft background wash. */
  wash: string;
  /** Highlight swipe behind a word in headings. */
  marker: string;
  text: string;
}

export const ACCENTS: Record<AccentName, Accent> = {
  royal: {
    chip: "bg-royal text-white",
    ring: "ring-royal/45",
    wash: "bg-royal/10",
    marker: "bg-royal/25",
    text: "text-royal",
  },
  ember: {
    chip: "bg-ember text-white",
    ring: "ring-ember/45",
    wash: "bg-ember/10",
    marker: "bg-ember/30",
    text: "text-ember",
  },
  aqua: {
    chip: "bg-aqua text-ink",
    ring: "ring-aqua/50",
    wash: "bg-aqua/12",
    marker: "bg-aqua/45",
    text: "text-aqua",
  },
  mint: {
    chip: "bg-mint text-ink",
    ring: "ring-mint/55",
    wash: "bg-mint/12",
    marker: "bg-mint/45",
    text: "text-mint",
  },
  blush: {
    chip: "bg-blush text-ink",
    ring: "ring-blush/50",
    wash: "bg-blush/12",
    marker: "bg-blush/40",
    text: "text-blush",
  },
  rich: {
    chip: "bg-rich text-white",
    ring: "ring-rich/45",
    wash: "bg-rich/10",
    marker: "bg-rich/25",
    text: "text-rich",
  },
};

export interface PriceRow {
  label: string;
  price: string;
  detail?: string;
}

export interface Service {
  slug: string;
  /** Full name, used as the page title. */
  name: string;
  /** Short name for cards and breadcrumbs. */
  short: string;
  /** One line that says what you get. */
  tagline: string;
  /** Card body — two sentences at most. */
  summary: string;
  /** Headline price shown on the card, e.g. "from $2.75 / lb". */
  priceLabel: string;
  image: string;
  imageAlt: string;
  accent: AccentName;
  icon: LucideIcon;
  /** Body paragraphs on the detail page. */
  intro: readonly string[];
  /** The price table on the detail page. */
  rows: readonly PriceRow[];
  /** What is always included. */
  includes: readonly string[];
  /** Small print shown under the price table. */
  note?: string;
  /** Set on the flagship service so the homepage can feature it. */
  featured?: boolean;
}

const perLb = (n: number) => `${formatCurrency(n)} / lb`;

export const SERVICES: readonly Service[] = [
  {
    slug: "wash-fold-delivery",
    name: "Laundry Wash & Fold Delivery",
    short: "Wash & Fold",
    tagline: "Your everyday laundry, picked up and returned folded.",
    summary:
      "The main event. We collect your bag, sort it, wash it, dry it and fold it by hand, then bring it back to your door on the timeline you pick.",
    priceLabel: `from ${perLb(LOWEST_RATE_PER_LB)}`,
    image: "/images/real/fold.jpg",
    imageAlt: "Freshly laundered clothes being folded by hand",
    accent: "royal",
    icon: Shirt,
    featured: true,
    intro: [
      "Choose how fast you want it back and the per-pound rate follows. Everything else stays the same: sorted by colour and fabric, washed at the right temperature, dried properly and folded by a person before it comes home to you.",
      "You do not need to be in. Leave the bag out at the agreed time and it will be back in the same place, clean and sealed.",
    ],
    rows: TURNAROUND_TIERS.map((tier) => ({
      label: tier.label,
      price: perLb(tier.ratePerLb),
      detail: tier.details,
    })),
    includes: [
      "Sorted by colour and fabric before anything goes in",
      "Low-scent hypoallergenic detergent as standard",
      "Folded by hand, not by machine",
      "Returned in a sealed bag to your door",
    ],
    note: `Minimum service charge is ${MIN_ORDER_LBS} lbs. Stain treatment and laundry fragrance can be added to any order.`,
  },
  {
    slug: "athletic-shoes-equipment",
    name: "Athletic Shoes & Equipment Cleaning",
    short: "Shoes & Gear",
    tagline: "Trainers, gloves and pads — washed, sanitised and dried.",
    summary:
      "We collect soiled shoes and sports equipment, wash and sanitise them, dry them properly and return them clean in two days.",
    priceLabel: `${formatCurrency(5)} per pair`,
    image: "/images/real/shoes.jpg",
    imageAlt: "A clean pair of white athletic trainers",
    accent: "aqua",
    icon: Footprints,
    intro: [
      "Gym kit picks up more than dirt. We wash and sanitise shoes and equipment so they come back fresh instead of just rinsed, and we handle leather and synthetic materials differently because they need different treatment.",
      "Boxing gloves, pads, trainers and cleats all welcome. If you are unsure whether something can be cleaned, call and ask before you book.",
    ],
    rows: [
      {
        label: "Per pair of shoes",
        price: formatCurrency(5),
        detail: "Leather and synthetic uppers both handled.",
      },
      {
        label: "Per pair of gloves or pads",
        price: formatCurrency(5),
        detail: "Boxing gloves, sparring pads and similar equipment.",
      },
    ],
    includes: [
      "Picked up soiled, returned clean in two days",
      "Washed, sanitised and fully dried",
      "Leather and synthetic materials handled separately",
    ],
  },
  {
    slug: "comforters-bedding",
    name: "Comforters, Pillows & Bedding",
    short: "Bedding",
    tagline: "The big items that never fit in a home machine.",
    summary:
      "Comforters, bedding sets and pillows washed at a flat price by size, so a king set costs what a king set costs — no weighing involved.",
    priceLabel: `from ${formatCurrency(12)}`,
    image: "/images/real/bedding.jpg",
    imageAlt: "A made bed with a patterned comforter and pillows",
    accent: "blush",
    icon: BedDouble,
    intro: [
      "Household machines are not built for a king comforter, and stuffing one in is how they end up lumpy. We have the drum capacity to wash and dry these properly so the filling stays even.",
      "Prices below are flat per set, and each set price includes two pillows.",
    ],
    rows: [
      {
        label: "King comforter, bedding & 2 pillows",
        price: formatCurrency(18),
      },
      {
        label: "Queen comforter, bedding & 2 pillows",
        price: formatCurrency(15),
      },
      {
        label: "Full comforter, bedding & 2 pillows",
        price: formatCurrency(12),
      },
      { label: "4 standard size pillows", price: formatCurrency(12) },
    ],
    includes: [
      "Flat price by size — no weighing",
      "Washed and dried at full capacity so filling stays even",
      "Two pillows included with every comforter set",
    ],
  },
  {
    slug: "pet-bedding",
    name: "Pet Items & Bedding",
    short: "Pet Items",
    tagline: "Dog beds and blankets, washed separately.",
    summary:
      "Pet bedding is washed on its own, never mixed with household laundry, at a flat price per item.",
    priceLabel: `${formatCurrency(20)} each`,
    image: "/images/real/pet.jpg",
    imageAlt: "A dog asleep in a pile of soft blankets",
    accent: "mint",
    icon: PawPrint,
    intro: [
      "Pet bedding carries hair and odour that you do not want anywhere near your own clothes, so it never shares a machine with household laundry.",
      "Beds, blankets, covers and soft toys all count as one item each.",
    ],
    rows: [
      {
        label: "Per pet item",
        price: formatCurrency(20),
        detail: "Beds, blankets, covers and soft toys.",
      },
    ],
    includes: [
      "Washed completely separately from household laundry",
      "Hair removed before washing",
      "Flat price per item",
    ],
  },
  {
    slug: "heavy-soiled-contaminated",
    name: "Heavily Soiled & Contaminated Clothing",
    short: "Heavy Soiled",
    tagline: "Biological contamination handled safely.",
    summary:
      "Clothing affected by blood, faeces or urine, washed with heavy-duty commercial detergents and handled apart from everything else.",
    priceLabel: perLb(3.75),
    image: "/images/real/machines.jpg",
    imageAlt: "Commercial washing machines mid-cycle",
    accent: "ember",
    icon: Biohazard,
    intro: [
      "Some loads need more than a hypoallergenic detergent. Biologically contaminated clothing is quarantined on arrival, washed with specialised heavy-duty commercial products, and never shares a machine with another customer's order.",
      "Tell us what we are dealing with when you book so it is handled correctly from the moment we collect it.",
    ],
    rows: [
      {
        label: "Heavily soiled or contaminated clothing",
        price: perLb(3.75),
        detail: "Blood, faeces and urine.",
      },
    ],
    includes: [
      "Kept separate from every other order",
      "Specialised heavy-duty commercial detergents",
      "Machines sanitised after the cycle",
    ],
    note: "Specialised requirements may increase service costs — we will tell you before we start.",
  },
  {
    slug: "grease-oil-workwear",
    name: "Heavy Grease & Oil Contaminated Clothing",
    short: "Grease & Oil",
    tagline: "Workwear that ordinary detergent will not touch.",
    summary:
      "Mechanic overalls, kitchen whites and shop rags washed with heavy-duty degreasing products built for oil and grease.",
    priceLabel: perLb(3.75),
    image: "/images/real/dryers.jpg",
    imageAlt: "A row of commercial dryers running",
    accent: "rich",
    icon: Wrench,
    intro: [
      "Grease does not come out with a hypoallergenic wash — it needs commercial degreasing detergent and a machine you are willing to run it through. We keep this work separate so no one else's laundry picks up the residue.",
      "Standing weekly collections are available for garages, kitchens and workshops. Call to set one up.",
    ],
    rows: [
      {
        label: "Grease and oil contaminated clothing",
        price: perLb(3.75),
        detail: "Overalls, kitchen whites, shop rags and workwear.",
      },
    ],
    includes: [
      "Heavy-duty commercial degreasing detergents",
      "Washed apart from all household laundry",
      "Weekly standing collections available for trade accounts",
    ],
    note: "Specialised requirements may increase service costs — we will tell you before we start.",
  },
  {
    slug: "white-towel-service",
    name: "White Towel Service",
    short: "Towel Service",
    tagline: "We own the inventory problem, you just use towels.",
    summary:
      "Weekly pickup and drop-off of towels with inventory managed and re-supplied for you. Built for households, barbershops, kitchens, mechanics and salons.",
    priceLabel: perLb(2.25),
    image: "/images/real/towels.jpg",
    imageAlt: "Clean folded and rolled white towels",
    accent: "aqua",
    icon: Layers,
    intro: [
      "Running out of clean towels mid-shift is a scheduling problem, not a laundry problem. On this service we track how many towels you have in circulation, collect the dirty ones weekly, and re-supply so the shelf is never empty.",
      "Available to businesses and households alike. Barbershops, kitchens, mechanics, gyms and salons are the usual customers.",
    ],
    rows: [
      {
        label: "White towel service",
        price: perLb(2.25),
        detail:
          "Plus the initial cost of the towels themselves and delivery.",
      },
    ],
    includes: [
      "Weekly pickup and drop-off",
      "Inventory tracked and re-supplied for you",
      "For households, businesses, mechanics, cooks and barbershops",
    ],
    note: "Priced per pound plus the initial cost of towels and delivery.",
  },
  {
    slug: "concierge-dry-cleaning",
    name: "Concierge Services",
    short: "Concierge",
    tagline: "Dry cleaning, sourced at the best local rate.",
    summary:
      "Anything that needs dry cleaning, taken off your hands. We find the best local return time and rate, and deliver it back to you.",
    priceLabel: "Call for rates",
    image: "/images/real/dryclean.jpg",
    imageAlt: "Dry cleaned garments hanging in protective covers",
    accent: "royal",
    icon: Sparkles,
    intro: [
      "Suits, coats, formal wear and anything else marked dry clean only. We handle the running around — comparing local turnaround times and rates, dropping off, collecting, and bringing it back to your door with the rest of your laundry.",
      "Because rates move depending on the garment and the turnaround, this one is quoted rather than listed. Call and we will give you the best price we can find.",
    ],
    rows: [
      {
        label: "Dry cleaning",
        price: "Best local rate + delivery",
        detail: "Call now for a quote on your specific garments.",
      },
    ],
    includes: [
      "Best local return time and rate, found for you",
      "Collected and returned with your regular order",
      "Quoted before anything is committed",
    ],
  },
] as const;

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export const FEATURED_SERVICE = SERVICES.find((s) => s.featured) ?? SERVICES[0];
