import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Truck } from "lucide-react";
import { ConceptPricing } from "@/components/concept/sections/ConceptPricing";
import { CtaRow } from "@/components/site/CtaRow";
import { Highlight, PageHero } from "@/components/site/PageHero";
import { PageShell } from "@/components/site/PageShell";
import {
  ADD_ONS,
  DELIVERY_CAP_FROM_MILES,
  DELIVERY_FEE_CAP,
  DELIVERY_RATE_PER_MILE,
  LOWEST_RATE_PER_LB,
  MIN_ORDER_LBS,
  MIN_ORDER_POLICY,
} from "@/lib/pricing";
import { ACCENTS, SERVICES } from "@/lib/services";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing — California Laundromat",
  description: `Wash & fold from ${formatCurrency(
    LOWEST_RATE_PER_LB
  )} per pound with delivery at ${formatCurrency(
    DELIVERY_RATE_PER_MILE
  )} per mile, capped at ${formatCurrency(
    DELIVERY_FEE_CAP
  )}. Full price list for every service, with no hidden fees.`,
};

export default function PricingPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Every price, in one place"
        accent="ember"
        title={
          <>
            The whole price list.
            <br />
            <Highlight accent="aqua" tilt="rotate-1">
              Nothing hidden.
            </Highlight>
          </>
        }
        lead={`Wash & fold starts at ${formatCurrency(
          LOWEST_RATE_PER_LB
        )} per pound and delivery is ${formatCurrency(
          DELIVERY_RATE_PER_MILE
        )} per mile — never more than ${formatCurrency(
          DELIVERY_FEE_CAP
        )}, however far out you are. Work out your own number below, or scroll for the full list.`}
      >
        <CtaRow bookLabel="Book a pickup" />
      </PageHero>

      <ConceptPricing />

      {/* Delivery + minimum, explained */}
      <section className="bg-foam-deep">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-8 lg:px-10">
          <div className="rounded-[32px] bg-white p-9 ring-2 ring-inset ring-ember/40 sm:p-11">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ember text-white">
              <Truck className="h-7 w-7" strokeWidth={1.8} />
            </span>
            <p className="mt-6 font-mono-meta text-ink/45">Delivery base rate</p>
            <p className="tabular mt-3 font-display text-[clamp(2.5rem,6vw,4rem)] leading-none tracking-tight text-ember">
              {formatCurrency(DELIVERY_RATE_PER_MILE)}
              <span className="ml-2 font-mono text-base tracking-wide text-ink/45">
                per mile
              </span>
            </p>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink/70">
              Charged on distance, not on a flat convenience fee. Close by means
              you pay very little, and you always see the number before you
              commit.
            </p>
            <p className="mt-4 inline-flex items-center rounded-full bg-ember/10 px-4 py-2 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-ember">
              Capped at {formatCurrency(DELIVERY_FEE_CAP)}
            </p>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/70">
              Past about {DELIVERY_CAP_FROM_MILES} miles the mileage stops
              adding up. Delivery never costs more than{" "}
              {formatCurrency(DELIVERY_FEE_CAP)}, wherever you are in our
              service area.
            </p>
          </div>

          <div className="rounded-[32px] bg-royal p-9 text-white sm:p-11">
            <p className="font-mono-meta text-white/60">Minimum order</p>
            <p className="tabular mt-3 font-display text-[clamp(2.5rem,6vw,4rem)] leading-none tracking-tight">
              {MIN_ORDER_LBS}
              <span className="ml-2 font-mono text-base tracking-wide text-white/60">
                lbs
              </span>
            </p>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-white/75">
              {MIN_ORDER_POLICY}
            </p>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="bg-foam">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="max-w-3xl">
            <p className="font-mono-meta text-royal">Optional extras</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-[-0.025em] text-ink">
              Two things you can add to any order.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {ADD_ONS.map((addOn) => (
              <div
                key={addOn.id}
                className="rounded-[28px] bg-white p-8 ring-2 ring-inset ring-mint/50"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-[1.75rem] leading-tight tracking-tight text-ink">
                    {addOn.label}
                  </h3>
                  <p className="tabular shrink-0 font-display text-[1.75rem] leading-none text-ember">
                    {addOn.rateLabel}
                  </p>
                </div>
                <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/65">
                  {addOn.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full list, service by service */}
      <section className="bg-foam-deep">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="max-w-3xl">
            <p className="font-mono-meta text-royal">Full price list</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-[-0.025em] text-ink">
              Every service, every rate.
            </h2>
          </div>

          <div className="mt-12 grid gap-6">
            {SERVICES.map((service) => {
              const accent = ACCENTS[service.accent];
              const Icon = service.icon;

              return (
                <div
                  key={service.slug}
                  className="overflow-hidden rounded-[32px] bg-white ring-2 ring-inset ring-ink/8"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/8 p-7 sm:p-9">
                    <div className="flex items-center gap-4">
                      <span
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${accent.chip}`}
                      >
                        <Icon className="h-6 w-6" strokeWidth={1.8} />
                      </span>
                      <div>
                        <h3 className="font-display text-[1.625rem] leading-tight tracking-tight text-ink">
                          {service.name}
                        </h3>
                        <p className={`mt-1 text-[0.9375rem] ${accent.text}`}>
                          {service.tagline}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/services/${service.slug}`}
                      className="group inline-flex items-center gap-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-royal"
                    >
                      Details
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>

                  <dl className="divide-y divide-ink/8">
                    {service.rows.map((row) => (
                      <div
                        key={row.label}
                        className="flex flex-col gap-2 px-7 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-9"
                      >
                        <dt className="max-w-2xl text-[1.0625rem] text-ink/80">
                          {row.label}
                          {row.detail && (
                            <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink/50">
                              {row.detail}
                            </span>
                          )}
                        </dt>
                        <dd
                          className={`tabular shrink-0 font-display text-[1.5rem] leading-none tracking-tight ${accent.text}`}
                        >
                          {row.price}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {service.note && (
                    <p className="border-t border-ink/8 px-7 py-5 text-[0.9375rem] leading-relaxed text-ink/55 sm:px-9">
                      {service.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
