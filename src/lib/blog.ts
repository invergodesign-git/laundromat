/**
 * Blog content.
 *
 * Posts are typed data rather than MDX so the whole site stays statically
 * rendered with no content pipeline to maintain. To add a post, append to
 * `POSTS` — the index page, the cards on the homepage and the route for
 * `/blog/[slug]` all read from here.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: readonly string[] }
  | { type: "quote"; text: string };

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date — used for sorting and the <time> element. */
  date: string;
  readingMinutes: number;
  category: string;
  image: string;
  imageAlt: string;
  body: readonly Block[];
}

export const POSTS: readonly Post[] = [
  {
    slug: "how-much-does-a-load-of-laundry-weigh",
    title: "How much does a load of laundry actually weigh?",
    excerpt:
      "Wash and fold is priced per pound, which is useless information until you know what a pound of laundry looks like. Here is a real-world guide.",
    date: "2026-08-04",
    readingMinutes: 4,
    category: "Pricing",
    image: "/images/real/basket.jpg",
    imageAlt: "A laundry basket filled with clothes",
    body: [
      {
        type: "p",
        text: "Every wash and fold service in the country prices by the pound, and almost nobody knows what that means when they are standing over a full hamper. So here is the honest version, based on what actually comes through our door.",
      },
      { type: "h2", text: "The quick rule of thumb" },
      {
        type: "p",
        text: "A standard kitchen bin bag, filled but not crammed, is usually somewhere between 12 and 18 pounds. A full tall hamper is generally 20 to 30. If you are a single person doing a week of laundry, you are almost always in the 15 to 25 pound range.",
      },
      { type: "h2", text: "Rough weights for common items" },
      {
        type: "ul",
        items: [
          "T-shirt — around 5 ounces, so roughly three to a pound",
          "Pair of jeans — about 1.5 pounds on their own",
          "Bath towel — a little under a pound dry",
          "Hoodie — 1.5 to 2 pounds",
          "Set of queen sheets — around 3 pounds",
        ],
      },
      {
        type: "p",
        text: "Wet weight is not what you pay for. We weigh laundry dry, on the way in, and that is the number your order is billed on.",
      },
      { type: "h2", text: "Why there is a minimum" },
      {
        type: "p",
        text: "A pickup, a wash cycle, a dry cycle, the folding and the drive back cost roughly the same whether the bag holds 8 pounds or 24. The minimum charge is what makes a small order possible at all, rather than something we would have to turn down.",
      },
      {
        type: "p",
        text: "If your bag lands under the minimum, tell us. We would rather credit you the difference toward your next order than have you feel short-changed.",
      },
    ],
  },
  {
    slug: "hypoallergenic-detergent-guide",
    title: "What we mean when we say hypoallergenic detergent",
    excerpt:
      "The word gets used loosely. Here is what we actually put in the machine for household laundry, and when we deliberately use something stronger.",
    date: "2026-07-22",
    readingMinutes: 5,
    category: "Our Process",
    image: "/images/real/whites.jpg",
    imageAlt: "Clean white laundry",
    body: [
      {
        type: "p",
        text: "Detergent is the part of this job that customers ask about most, usually because someone in the house reacts to something. It is a fair question and it deserves a specific answer rather than a marketing one.",
      },
      { type: "h2", text: "What goes in for a normal household load" },
      {
        type: "p",
        text: "All household clothing and bedding is washed with low-scent hypoallergenic detergent from tested household and commercial brands. Low scent matters as much as the hypoallergenic part — heavy fragrance is what most people are actually reacting to when they say a detergent bothers them.",
      },
      {
        type: "p",
        text: "If you want your laundry to come back smelling of something, that is an add-on rather than the default. It is not in there unless you ask for it.",
      },
      { type: "h2", text: "When we use something stronger" },
      {
        type: "p",
        text: "Hypoallergenic detergent is gentle by design, which is exactly why it will not shift heavy grease or sanitise biologically contaminated clothing. Those loads get specialised heavy-duty commercial products instead, and they are washed apart from everything else.",
      },
      {
        type: "ul",
        items: [
          "Mechanic overalls, kitchen whites and shop rags — commercial degreaser",
          "Blood, faeces or urine contamination — heavy-duty sanitising wash",
          "Garments with special care instructions — handled to the label, or returned unwashed if we are not confident",
        ],
      },
      {
        type: "quote",
        text: "Tell us about anything unusual when you book. Special requirements can increase the cost, and we would always rather say so up front than surprise you afterwards.",
      },
      { type: "h2", text: "Just ask" },
      {
        type: "p",
        text: "If you want to know the exact brands we are running this month, call and ask. There is no reason for it to be a secret.",
      },
    ],
  },
  {
    slug: "getting-stains-out-what-actually-works",
    title: "Stains: what actually works, and what makes it worse",
    excerpt:
      "Most stains are recoverable if you do nothing clever in the first ten minutes. A short guide to not setting the mark permanently.",
    date: "2026-07-09",
    readingMinutes: 4,
    category: "Tips",
    image: "/images/real/colors.jpg",
    imageAlt: "Colourful clothing in a laundry pile",
    body: [
      {
        type: "p",
        text: "The single most common reason a stain becomes permanent is not the stain. It is what happened to it before it reached us.",
      },
      { type: "h2", text: "The three things that set a stain for good" },
      {
        type: "ul",
        items: [
          "Heat — a hot wash or a tumble dry cooks protein stains into the fibre permanently",
          "Rubbing — scrubbing spreads the stain outward and damages the weave",
          "Time in a sealed bag — damp fabric left in a bin bag for days will mildew",
        ],
      },
      {
        type: "p",
        text: "If you take nothing else from this: do not put a stained garment in the dryer to see whether the stain survived the wash. That is the step that makes it permanent.",
      },
      { type: "h2", text: "What to do instead" },
      {
        type: "p",
        text: "Blot, do not rub. Cold water, not hot. Then leave it alone and get it to us, ideally with the stained item on top of the bag and a note about what caused it — coffee, oil and blood all need completely different treatment, and knowing which one it is doubles our chances.",
      },
      { type: "h2", text: "What we do on our side" },
      {
        type: "p",
        text: "Our stain treatment add-on means a technician spot-treats marks by hand during sorting, before anything goes near a machine. It is the cheapest insurance on the price list, and on a bag with kids' clothes in it, it pays for itself.",
      },
    ],
  },
  {
    slug: "why-pickup-delivery-costs-less-than-you-think",
    title: "Why pickup and delivery costs less than you think",
    excerpt:
      "People assume door-to-door laundry carries a big convenience premium. Priced per mile, the maths usually comes out closer than expected.",
    date: "2026-06-27",
    readingMinutes: 3,
    category: "Pricing",
    image: "/images/real/van.jpg",
    imageAlt: "A delivery van used for laundry pickup",
    body: [
      {
        type: "p",
        text: "The objection we hear most often is that delivery must add a lot to the bill. It is a reasonable assumption, and it is usually wrong.",
      },
      { type: "h2", text: "We charge by the mile, not by the order" },
      {
        type: "p",
        text: "Delivery is billed at a flat base rate per mile. That means the cost is tied to something you can check yourself rather than a flat convenience fee that has no relationship to the work involved. If you are close, you pay very little. If you are further out, you pay proportionally more, and you see the number before you book.",
      },
      { type: "h2", text: "Then count what you are not spending" },
      {
        type: "ul",
        items: [
          "The drive to the laundromat and back, twice",
          "The hour or two of sitting there while it runs",
          "Machine and dryer money, and the detergent",
          "The evening you would have spent folding",
        ],
      },
      {
        type: "p",
        text: "Run our calculator with your real address and your real bag weight before you decide. The number is usually smaller than the guess.",
      },
    ],
  },
] as const;

/** Newest first. */
export const SORTED_POSTS = [...POSTS].sort((a, b) =>
  b.date.localeCompare(a.date)
);

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
