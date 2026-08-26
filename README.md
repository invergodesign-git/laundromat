# California Laundromat

Marketing site for a veteran-owned wash & fold pickup and delivery business in
San Diego. Next.js App Router, Tailwind CSS v4 and GSAP, statically rendered.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — the site runs without it
npm run dev
```

The dev server prints the port it picked. `npm run build` runs a full type
check and prerenders every route.

## Configuration

Two public URLs are read from the environment. Both are optional and both have
a working fallback, so a missing value degrades gracefully rather than
breaking a button. See `.env.example`.

| Variable | Controls | Fallback when unset |
| --- | --- | --- |
| `NEXT_PUBLIC_BOOKING_URL` | Every "Book now" button | Links to `/pricing` |
| `NEXT_PUBLIC_REVIEW_URL` | Every "Leave a review" button | Opens an email to the business |

## Where the content lives

All copy, pricing and business facts are data, not markup. Editing these files
updates every page that references them.

| File | Owns |
| --- | --- |
| `src/lib/business.ts` | Phone, email, hours, service area, service promise, detergent process |
| `src/lib/pricing.ts` | Turnaround tiers and rates, 24 lb minimum, per-mile delivery, add-ons |
| `src/lib/services.ts` | The eight services — copy, price tables, imagery, accent colours |
| `src/lib/blog.ts` | Blog posts |
| `src/lib/reviews.ts` | Customer reviews |
| `src/lib/nav.ts` | Header, mobile sheet and footer navigation |
| `src/lib/booking.ts` | Where "Book now" points |

`src/lib/distance.ts` is a **demo** distance estimator, not a real geocoder. It
hashes the entered address into a stable pseudo-distance so the calculator has
something to work with. Swap the body of `getDistanceFromLaundry` for a real
provider (Google Distance Matrix, Mapbox) when one is available — the return
shape is designed to stay the same so no UI has to change.

## Routes

`/` · `/services` · `/services/[slug]` · `/pricing` · `/about` · `/blog` ·
`/blog/[slug]` · `/reviews` · `/contact`

Service and blog pages are generated from their data files via
`generateStaticParams`, so adding an entry adds a page.

## Icons

`npm run icons` regenerates `favicon.ico`, `icon.png` and `apple-icon.png` from
`public/images/logo-knockout.png`. Run it if the logo ever changes.
