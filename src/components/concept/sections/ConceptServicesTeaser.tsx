import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BubbleAccent } from "@/components/concept/motion/Bubbles";
import { ACCENTS, SERVICES } from "@/lib/services";

/**
 * Compact index of the full catalogue on the homepage. The three big Wash /
 * Dry / Fold cards above it explain the everyday service; this is the "we
 * also do all of this" row that sends people into the service pages.
 */
export function ConceptServicesTeaser() {
  return (
    <section className="relative isolate overflow-hidden bg-foam-deep py-20 sm:py-24 lg:py-28">
      <BubbleAccent size={104} className="left-[5%] top-14 opacity-55" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-mono-meta text-royal">The full list</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-[-0.025em] text-ink">
              We wash a lot more than clothes.
            </h2>
          </div>
          <Link
            href="/services"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-royal px-6 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_-14px_rgba(69,54,214,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich"
          >
            All services
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => {
            const accent = ACCENTS[service.accent];
            const Icon = service.icon;

            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className={`group flex flex-col rounded-[28px] bg-white p-6 ring-2 ring-inset ${accent.ring} transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_36px_70px_-40px_rgba(20,18,41,0.45)]`}
              >
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${accent.chip}`}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 font-display text-[1.375rem] leading-tight tracking-tight text-ink">
                  {service.short}
                </h3>
                <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink/60">
                  {service.tagline}
                </p>
                <span
                  className={`mt-5 inline-flex items-center gap-1.5 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.1em] ${accent.text}`}
                >
                  {service.priceLabel}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
