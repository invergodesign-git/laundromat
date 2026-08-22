import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { BubbleAccent } from "@/components/concept/motion/Bubbles";
import { CtaRow } from "@/components/site/CtaRow";
import { Highlight, PageHero } from "@/components/site/PageHero";
import { PageShell } from "@/components/site/PageShell";
import { PROCESS } from "@/lib/business";
import { MIN_ORDER_LBS, MIN_ORDER_POLICY } from "@/lib/pricing";
import { ACCENTS, SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services — California Laundromat",
  description:
    "Wash & fold delivery, shoes and equipment, comforters and bedding, pet items, contaminated workwear, white towel service and concierge dry cleaning.",
};

export default function ServicesPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Everything we do"
        accent="royal"
        title={
          <>
            Eight ways to never
            <br />
            do <Highlight accent="ember">laundry</Highlight> again.
          </>
        }
        lead="From a weekly bag of clothes to a garage full of oily overalls, it all gets picked up from your door and brought back clean. Pick the one you need — each has its own page with the full price list."
      >
        <CtaRow />
      </PageHero>

      {/* The catalogue */}
      <section className="bg-foam-deep">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => {
              const accent = ACCENTS[service.accent];
              const Icon = service.icon;

              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className={`group relative isolate flex flex-col overflow-hidden rounded-[32px] bg-white ring-2 ring-inset ${accent.ring} transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-40px_rgba(20,18,41,0.45)]`}
                >
                  <div className="relative aspect-[5/4] overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority={i < 3}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/30 to-transparent"
                    />
                    <span
                      className={`absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-2xl ${accent.chip} shadow-[0_12px_26px_-12px_rgba(20,18,41,0.7)]`}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <span className="absolute right-5 top-5 rounded-full bg-white/95 px-3.5 py-1.5 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-ink">
                      {service.priceLabel}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <h2 className="font-display text-[1.75rem] leading-tight tracking-tight text-ink">
                      {service.short}
                    </h2>
                    <p className={`mt-1.5 text-[0.9375rem] font-semibold ${accent.text}`}>
                      {service.tagline}
                    </p>
                    <p className="mt-4 flex-1 text-[1.0625rem] leading-relaxed text-ink/65">
                      {service.summary}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-royal">
                      See prices
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How every order is washed */}
      <section className="relative isolate overflow-hidden bg-foam">
        <BubbleAccent size={90} className="right-[8%] top-14 opacity-60" />
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-12 lg:gap-16 lg:px-10">
          <div className="lg:col-span-5">
            <p className="font-mono-meta text-royal">Our process</p>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1] tracking-[-0.025em] text-ink">
              {PROCESS.headline}
            </h2>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink/65">
              {PROCESS.body}
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[32px] bg-white p-8 ring-2 ring-inset ring-aqua/40 sm:p-10">
              <p className="font-mono-meta text-ink/45">Please note</p>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/70">
                {PROCESS.notice}
              </p>
            </div>

            <div className="mt-6 rounded-[32px] bg-royal/8 p-8 ring-2 ring-inset ring-royal/25 sm:p-10">
              <p className="font-mono-meta text-royal">
                {MIN_ORDER_LBS} lb minimum
              </p>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/70">
                {MIN_ORDER_POLICY}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is always true, whatever you send */}
      <section className="bg-foam-deep">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <h2 className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1] tracking-[-0.025em] text-ink">
            Whatever you send us, this part never changes.
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Picked up and returned to your door",
              "Sorted before anything goes in a machine",
              "Priced before you commit, never after",
              "Handled by the same small local team",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-3xl bg-white p-6 text-[1.0625rem] leading-snug text-ink/75"
              >
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mint text-ink">
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
