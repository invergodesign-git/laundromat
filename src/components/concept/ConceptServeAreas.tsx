import { BUSINESS } from "@/lib/business";

/**
 * Locations We Serve — verified area + directions CTA.
 */
export function ConceptServeAreas() {
  return (
    <section
      aria-labelledby="serve-heading"
      className="border-y border-white/70 bg-foam-deep"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-14 sm:px-8 sm:py-16 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div className="max-w-2xl">
          <p className="font-mono-meta text-royal">Locations We Serve</p>
          <h2
            id="serve-heading"
            className="mt-3 font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] tracking-[-0.02em] text-ink"
          >
            Based in {BUSINESS.servingArea}.
          </h2>
          <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-ink/60">
            We come to you — no trip to the shop, ever. Pickup and delivery are
            priced by how far you are from us, so enter your address on Pricing
            and you will see the exact fee before you book.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#pricing"
            className="inline-flex h-12 items-center justify-center rounded-full bg-royal px-6 font-mono text-[0.75rem] font-medium uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_-14px_rgba(69,54,214,0.75)] transition hover:bg-rich"
          >
            Check my price
          </a>
          <a
            href={BUSINESS.phoneHref}
            className="inline-flex h-12 items-center justify-center rounded-full bg-white/70 px-6 font-mono text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink ring-1 ring-inset ring-ink/10 transition-colors hover:bg-white"
          >
            Call {BUSINESS.ownerFirstName}
          </a>
        </div>
      </div>
    </section>
  );
}
