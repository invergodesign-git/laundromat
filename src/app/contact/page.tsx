import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Truck } from "lucide-react";
import { BubbleAccent } from "@/components/concept/motion/Bubbles";
import { Highlight, PageHero } from "@/components/site/PageHero";
import { PageShell } from "@/components/site/PageShell";
import { BOOKING } from "@/lib/booking";
import { BUSINESS, SERVICE_PROMISE } from "@/lib/business";
import { DELIVERY_RATE_PER_MILE, MIN_ORDER_LBS } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us — California Laundromat",
  description: `Call ${BUSINESS.phoneDisplay} to set up laundry pickup and delivery across ${BUSINESS.servingArea}.`,
};

const BEFORE_YOU_CALL = [
  {
    title: "Roughly what it weighs",
    body: `A full tall hamper is usually around the ${MIN_ORDER_LBS} lb minimum. An estimate is fine — we weigh it properly when we collect.`,
  },
  {
    title: "When you need it back",
    body: "12 hours, one day, two days or three. The faster you need it, the higher the per-pound rate, so it is worth deciding before you call.",
  },
  {
    title: "Anything unusual in the bag",
    body: "Special care labels, heavy grease, biological contamination or delicate items. Telling us up front means it gets handled correctly from the start.",
  },
  {
    title: "Where we are collecting from",
    body: "Your pickup address, so we can work out the delivery charge before you commit to anything.",
  },
];

export default function ContactPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Contact us"
        accent="ember"
        title={
          <>
            One call and the
            <br />
            laundry is <Highlight accent="ember">handled.</Highlight>
          </>
        }
        lead="No account, no app, no subscription. Tell us what you have and when you need it back, and we will book the pickup on the spot."
      />

      {/* Contact cards */}
      <section className="relative isolate overflow-hidden bg-foam-deep">
        <BubbleAccent size={110} className="right-[8%] top-16 opacity-60" />
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-12">
            <a
              href={BUSINESS.phoneHref}
              className="group flex flex-col justify-between rounded-[32px] bg-ember p-9 text-white shadow-[0_30px_70px_-40px_rgba(255,106,43,0.9)] transition-transform duration-500 hover:-translate-y-1.5 sm:p-11 lg:col-span-7"
            >
              <div>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20">
                  <Phone className="h-7 w-7" strokeWidth={1.8} />
                </span>
                <p className="mt-6 font-mono-meta text-white/75">
                  Call now — fastest way to book
                </p>
              </div>
              <p className="mt-8 font-display text-[clamp(2.25rem,6vw,4.25rem)] leading-none tracking-tight">
                {BUSINESS.phoneDisplay}
              </p>
            </a>

            <div className="grid gap-6 lg:col-span-5">
              <a
                href={BUSINESS.emailHref}
                className="group rounded-[32px] bg-white p-8 ring-2 ring-inset ring-royal/25 transition-transform duration-500 hover:-translate-y-1.5"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-royal text-white">
                  <Mail className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <p className="mt-5 font-mono-meta text-ink/45">Email</p>
                <p className="mt-2 text-[1.25rem] font-semibold tracking-tight text-ink">
                  {BUSINESS.email}
                </p>
              </a>

              <div className="rounded-[32px] bg-white p-8 ring-2 ring-inset ring-aqua/45">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-aqua text-ink">
                  <Clock className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <p className="mt-5 font-mono-meta text-ink/45">Hours</p>
                <p className="mt-2 text-[1.25rem] font-semibold tracking-tight text-ink">
                  {BUSINESS.hoursLabel}
                </p>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-8 ring-2 ring-inset ring-mint/50 lg:col-span-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-ink">
                <MapPin className="h-6 w-6" strokeWidth={1.8} />
              </span>
              <p className="mt-5 font-mono-meta text-ink/45">Where we collect</p>
              <p className="mt-2 text-[1.25rem] font-semibold tracking-tight text-ink">
                {BUSINESS.servingArea}
              </p>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink/65">
                Plus the surrounding neighbourhoods. Not sure you are in range?
                Call and it is a quick answer.
              </p>
            </div>

            <div className="rounded-[32px] bg-white p-8 ring-2 ring-inset ring-blush/50 lg:col-span-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-ink">
                <Truck className="h-6 w-6" strokeWidth={1.8} />
              </span>
              <p className="mt-5 font-mono-meta text-ink/45">Delivery charge</p>
              <p className="mt-2 text-[1.25rem] font-semibold tracking-tight text-ink">
                {formatCurrency(DELIVERY_RATE_PER_MILE)} per mile
              </p>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink/65">
                Work out your exact number on the{" "}
                <Link href="/pricing" className="font-semibold text-royal underline-offset-4 hover:underline">
                  pricing page
                </Link>{" "}
                before you call.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Before you call */}
      <section className="bg-foam">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="max-w-3xl">
            <p className="font-mono-meta text-royal">Before you call</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-[-0.025em] text-ink">
              Four things worth having ready.
            </h2>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink/65">
              None of it is essential — we can work it out on the phone. It just
              makes the call about a minute long instead of five.
            </p>
          </div>

          <dl className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:gap-y-12">
            {BEFORE_YOU_CALL.map((item, i) => (
              <div key={item.title} className="flex gap-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white font-display text-xl text-royal shadow-[0_10px_24px_-14px_rgba(20,18,41,0.6)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <dt className="font-display text-[1.5rem] leading-tight tracking-tight text-ink">
                    {item.title}
                  </dt>
                  <dd className="mt-3 max-w-md text-[1.0625rem] leading-relaxed text-ink/65">
                    {item.body}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          {!BOOKING.isLive && (
            <p className="mt-14 max-w-3xl rounded-[28px] bg-white p-7 text-[1.0625rem] leading-relaxed text-ink/65 ring-2 ring-inset ring-ink/8 sm:p-9">
              Online booking and card payment are coming soon. Until then every
              order is arranged by phone, and nothing is ever charged through
              this website. {SERVICE_PROMISE}
            </p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
