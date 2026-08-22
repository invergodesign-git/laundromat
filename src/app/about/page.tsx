import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { ConceptWhyUs } from "@/components/concept/sections/ConceptWhyUs";
import { CtaRow } from "@/components/site/CtaRow";
import { Highlight, PageHero } from "@/components/site/PageHero";
import { PageShell } from "@/components/site/PageShell";
import { BUSINESS, PROCESS, SERVICE_PROMISE } from "@/lib/business";
import { MIN_ORDER_LBS, MIN_ORDER_POLICY } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "About Us — California Laundromat",
  description: `Veteran owned wash & fold pickup and delivery in ${BUSINESS.servingArea}. Low-scent hypoallergenic detergents, fair pricing, and a promise to put things right.`,
};

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About us"
        accent="mint"
        title={
          <>
            A local shop.
            <br />
            Not a <Highlight accent="mint">call centre.</Highlight>
          </>
        }
        lead={`Veteran owned, run by the same small team that washes your laundry, serving ${BUSINESS.servingArea} door to door.`}
        image={{
          src: "/images/real/shirts-rack.jpg",
          alt: "Freshly pressed shirts hanging on a rack",
        }}
      >
        <CtaRow />
      </PageHero>

      {/* The promise, verbatim */}
      <section className="bg-royal text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-white/15">
              <ShieldCheck className="h-10 w-10" strokeWidth={1.7} />
            </span>
            <div>
              <p className="font-mono-meta text-white/60">
                Our laundry service promise
              </p>
              <p className="mt-4 max-w-4xl font-display text-[clamp(1.5rem,3.5vw,2.75rem)] leading-[1.15] tracking-tight">
                {SERVICE_PROMISE}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our process */}
      <section className="bg-foam">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-12 lg:gap-16 lg:px-10">
          <div className="lg:col-span-6">
            <p className="font-mono-meta text-royal">Our process</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1] tracking-[-0.025em] text-ink">
              {PROCESS.headline}
            </h2>
            <p className="mt-6 text-[1.125rem] leading-relaxed text-ink/70">
              {PROCESS.body}
            </p>

            <div className="mt-8 rounded-[28px] bg-white p-7 ring-2 ring-inset ring-ember/40 sm:p-9">
              <p className="font-mono-meta text-ember">Notice</p>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink/70">
                {PROCESS.notice}
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="glass overflow-hidden rounded-[32px] p-2.5 sm:p-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
                <Image
                  src="/images/real/room-bright.jpg"
                  alt="A bright, clean laundry room with front-load machines running"
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="mt-6 rounded-[28px] bg-royal/8 p-7 ring-2 ring-inset ring-royal/25 sm:p-9">
              <p className="font-mono-meta text-royal">
                {MIN_ORDER_LBS} lb minimum
              </p>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink/70">
                {MIN_ORDER_POLICY}
              </p>
            </div>
          </div>
        </div>
      </section>

      <ConceptWhyUs />
    </PageShell>
  );
}
