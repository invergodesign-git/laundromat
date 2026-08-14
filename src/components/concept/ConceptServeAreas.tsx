import { BUSINESS } from "@/lib/business";

/**
 * Locations We Serve — verified area + directions CTA.
 */
export function ConceptServeAreas() {
  return (
    <section
      aria-labelledby="serve-heading"
      className="border-y border-cream/10 bg-plum-deep"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-14 sm:px-8 sm:py-16 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div className="max-w-2xl">
          <p className="font-mono-meta text-lavender/70">Locations We Serve</p>
          <h2
            id="serve-heading"
            className="mt-3 font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] tracking-[-0.02em] text-cream"
          >
            Based in {BUSINESS.servingArea}.
          </h2>
          <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-cream/55">
            Pickup and delivery are priced by how far you are from our door at{" "}
            {BUSINESS.address}. Enter your address on Pricing to see the exact fee.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#pricing"
            className="inline-flex h-12 items-center justify-center rounded-full bg-ember px-6 font-mono text-[0.75rem] font-medium tracking-[0.14em] text-plum uppercase transition hover:brightness-105"
          >
            Check my price
          </a>
          <a
            href={BUSINESS.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-full px-6 font-mono text-[0.75rem] font-medium tracking-[0.14em] text-cream uppercase ring-1 ring-inset ring-cream/25 transition-colors hover:ring-cream/50"
          >
            Get directions
          </a>
        </div>
      </div>
    </section>
  );
}
