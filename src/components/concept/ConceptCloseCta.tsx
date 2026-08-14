import { Phone } from "lucide-react";
import { SlideFill } from "@/components/concept/motion/SlideFill";
import { BUSINESS } from "@/lib/business";

/**
 * Closing CTA — schedule pickup / call.
 */
export function ConceptCloseCta() {
  return (
    <section className="relative overflow-hidden bg-cream text-plum">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-24">
        <div className="max-w-2xl">
          <p className="font-mono-meta text-royal/70">Schedule a pickup</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[0.98] tracking-[-0.02em]">
            Let us handle the load.
          </h2>
          <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-plum/60">
            Check your price, then call {BUSINESS.ownerFirstName} — veteran owned wash
            &amp; fold with honest, distance-based pickup.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <SlideFill href="#pricing" variant="ember" size="lg" arrow>
            Book now
          </SlideFill>
          <a
            href={BUSINESS.phoneHref}
            className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full px-7 font-mono text-[0.875rem] font-medium tracking-[0.14em] text-plum uppercase ring-1 ring-inset ring-plum/20 transition-colors hover:ring-plum/45"
          >
            <Phone className="h-4 w-4 text-ember" />
            Call Us
          </a>
        </div>
      </div>
    </section>
  );
}
