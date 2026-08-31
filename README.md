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
  and pricing decides what that costs. Distance is measured one way, outbound
  from the home office, and charged at `DELIVERY_RATE_PER_MILE` up to
  `DELIVERY_FEE_CAP` ($6) — so the fee stops rising at about 7.8 miles. Past
  `MAX_SERVICE_RADIUS_MILES` (18) the calculator stops quoting altogether and
  asks the customer to call.

Geoapify's free plan requires visible attribution, which is rendered under the
calculator. Keep it if the site stays on the free tier.

## Where the content lives

All copy, pricing and business facts are data, not markup. Editing these files
updates every page that references them.

| File | Owns |
| --- | --- |
| `src/lib/business.ts` | Phone, email, pickup windows, timezone, service area, service promise, detergent process |
| `src/lib/pricing.ts` | Turnaround tiers and rates, 24 lb minimum, per-mile delivery, add-ons |
| `src/lib/services.ts` | The eight services — copy, price tables, imagery, accent colours |
| `src/lib/blog.ts` | Blog posts |
| `src/lib/reviews.ts` | Customer reviews |
| `src/lib/nav.ts` | Header, mobile sheet and footer navigation |
| `src/lib/booking.ts` | Where "Book now" points |

## Routes

`/` · `/services` · `/services/[slug]` · `/pricing` · `/about` · `/blog` ·
`/blog/[slug]` · `/reviews` · `/contact` · `/book`

Service and blog pages are generated from their data files via
`generateStaticParams`, so adding an entry adds a page. `/book` is rendered per
request because the earliest bookable pickup depends on the current time.

## Booking

`/book` is the site's own intake form, and the reason it exists is to ask the
customer for everything exactly once — address, timing, service and contact
details — so nothing has to be repeated on a phone call afterwards.

- `src/lib/orders/` holds the order shape, its validation, and the two emails
  an order produces. `src/lib/email/` sends them, behind the same kind of
  provider interface the geo layer uses.
- `src/app/api/book` is the only way an order enters the business. It
  **recomputes the distance and the price on the server** rather than trusting
  the browser, because a calculator on a page can be edited by anyone with dev
  tools open.
- Orders are emailed rather than stored. That keeps the deployment free of a
  database and keeps customer details out of a datastore, and the owner works
  from an inbox anyway. When volume justifies it, the same validated order
  object can be written to a database or pushed to a POS or routing tool
  without the form changing.
- No payment is taken at booking. The price depends on weight, which is not
  known until the bag is collected, so the site quotes an estimate and the
  business charges the real weight afterwards.
- Booking requires ticking the cancellation agreement. The terms and the
  free-cancellation cutoff are in `CANCELLATION_POLICY` in
  `src/lib/business.ts`; the acceptance is recorded on the order.

Pickup windows and the business timezone live in `src/lib/business.ts`. All
date logic is pinned to `America/Los_Angeles`, so a server running UTC still
judges "today" the way the shop does.

### Out-of-area enquiries

An address beyond `MAX_SERVICE_RADIUS_MILES` cannot be booked, but the form
does not dead-end. It drops the timing and service questions, keeps the name,
contact and address, and posts to `src/app/api/waitlist` instead — which
re-measures the distance server-side and emails the lead separately from real
orders, so a pickup that needs driving to is never buried among enquiries.

Set `NEXT_PUBLIC_BOOKING_URL` to hand booking over to Square instead; every
"Book now" button switches automatically.

## Icons

`npm run icons` regenerates `favicon.ico`, `icon.png` and `apple-icon.png` from
`public/images/logo-knockout.png`. Run it if the logo ever changes.

## Maintenance scripts

Both read `.env.local` directly and are meant to be run by hand, not in CI.

- `node scripts/decode-pluscode.mjs` turns a Google Plus Code into the
  `LAUNDRY_ORIGIN_*` pair and reverse-geocodes the result so you can confirm
  the point before trusting it.
- `node scripts/check-delivery.mjs` routes from the configured origin to a
  handful of real San Diego landmarks and prints the resulting delivery
  quotes. Run it after changing the origin, the rate or the cap.
- `node scripts/check-booking.mjs [baseUrl]` posts good and bad orders at a
  running server and prints what came back. Run it after touching the intake
  rules. Defaults to `http://localhost:3005`.
