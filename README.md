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

Every variable is optional and every one has a working fallback, so a missing
value degrades gracefully rather than breaking a feature. See `.env.example`.

Public — compiled into the browser bundle:

| Variable | Controls | Fallback when unset |
| --- | --- | --- |
| `NEXT_PUBLIC_BOOKING_URL` | Every "Book now" button | Links to `/pricing` |
| `NEXT_PUBLIC_REVIEW_URL` | Every "Leave a review" button | Opens an email to the business |

Server only — never sent to the browser:

| Variable | Controls | Fallback when unset |
| --- | --- | --- |
| `GEOAPIFY_API_KEY` | Address autocomplete and driving-distance lookup | Calculator asks people to call for a quote |
| `LAUNDRY_ORIGIN_LAT` / `LAUNDRY_ORIGIN_LON` | Start point of every route | As above |
| `GEO_SEARCH_RADIUS_MILES` | How far out addresses are suggested | 45 miles |

The pickup coordinates are server-only on purpose: the business does not
publish its street address, and the browser only ever receives a mile count.

## Distance and pricing

The calculator measures a real driving distance rather than estimating one.

- `src/lib/geo/` is the mapping layer. `types.ts` defines the `GeoProvider`
  interface; `geoapify.ts` implements it. Switching to Google or Mapbox means
  adding one module and changing one line in `index.ts` — no route handler and
  no component needs to change.
- `src/app/api/address/suggest` and `src/app/api/address/distance` are thin
  server proxies. They exist so the API key stays on the server, and they add
  caching and per-IP throttling to protect the free-tier quota.
- Business rules stay in `src/lib/pricing.ts`. The geo layer answers "how far",
  and pricing decides what that costs and whether it is inside
  `MAX_SERVICE_RADIUS_MILES` (25). Beyond that the calculator stops quoting and
  asks the customer to call.

Geoapify's free plan requires visible attribution, which is rendered under the
calculator. Keep it if the site stays on the free tier.

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

## Routes

`/` · `/services` · `/services/[slug]` · `/pricing` · `/about` · `/blog` ·
`/blog/[slug]` · `/reviews` · `/contact`

Service and blog pages are generated from their data files via
`generateStaticParams`, so adding an entry adds a page.

## Icons

`npm run icons` regenerates `favicon.ico`, `icon.png` and `apple-icon.png` from
`public/images/logo-knockout.png`. Run it if the logo ever changes.
