import { Phone } from "lucide-react";
import { Bubbles } from "@/components/concept/motion/Bubbles";
import { BUSINESS } from "@/lib/business";

/**
 * Closing CTA — schedule pickup / call. The one saturated band on the page,
 * so the final ask reads as a change of gear rather than another section.
 */
export function ConceptCloseCta() {
  return (
    <section className="relative isolate overflow-hidden bg-royal text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(108,92,255,0.65),transparent_60%)]"
      />
      <Bubbles count={7} rise="-70vh" speed={1.6} className="opacity-[0.16]" />

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-start gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-24">
        <div className="max-w-2xl">
          <p className="font-mono-meta text-white/60">Schedule a pickup</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[0.98] tracking-[-0.02em]">
            Let us handle the load.
          </h2>
          <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-white/70">
            Check your price, then call {BUSINESS.ownerFirstName} — veteran owned wash
            &amp; fold with honest, distance-based pickup.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <a
            href="#pricing"
            className="group/cta inline-flex h-14 items-center justify-center gap-3 rounded-full bg-white px-7 font-mono text-[0.875rem] font-medium uppercase tracking-[0.14em] text-royal transition hover:bg-foam"
          >
            Book now
            <span className="transition-transform duration-300 group-hover/cta:translate-x-0.5">
              →
            </span>
          </a>
          <a
            href={BUSINESS.phoneHref}
            className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full px-7 font-mono text-[0.875rem] font-medium uppercase tracking-[0.14em] text-white ring-1 ring-inset ring-white/35 transition-colors hover:ring-white/70"
          >
            <Phone className="h-4 w-4" />
            Call Us
          </a>
        </div>
      </div>
    </section>
  );
}
