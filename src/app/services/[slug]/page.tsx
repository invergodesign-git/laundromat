import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { BubbleAccent } from "@/components/concept/motion/Bubbles";
import { CtaRow } from "@/components/site/CtaRow";
import { Highlight, PageHero } from "@/components/site/PageHero";
import { PageShell } from "@/components/site/PageShell";
import { PROCESS } from "@/lib/business";
import { ACCENTS, getService, SERVICES } from "@/lib/services";

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata(
  props: PageProps<"/services/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) return { title: "Service not found" };

  return {
    title: `${service.name} — California Laundromat`,
    description: service.summary,
  };
}

export default async function ServiceDetailPage(
  props: PageProps<"/services/[slug]">
) {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) notFound();

  const accent = ACCENTS[service.accent];
  const Icon = service.icon;
  const others = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <PageShell>
      <PageHero
        eyebrow={service.priceLabel}
        accent={service.accent}
        title={
          <>
            {service.short}
            {". "}
            <Highlight accent={service.accent}>Sorted.</Highlight>
          </>
        }
        lead={service.tagline}
        image={{ src: service.image, alt: service.imageAlt }}
      >
        <CtaRow bookLabel="Book this service" bookHref="/book" />
      </PageHero>

      {/* What it is */}
      <section className="bg-foam-deep">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-12 lg:gap-16 lg:px-10">
          <div className="lg:col-span-7">
            <span
              className={`grid h-16 w-16 place-items-center rounded-3xl ${accent.chip} shadow-[0_18px_36px_-18px_rgba(20,18,41,0.7)]`}
            >
              <Icon className="h-8 w-8" strokeWidth={1.7} />
            </span>
            <h2 className="mt-7 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1] tracking-[-0.025em] text-ink">
              {service.name}
            </h2>
            {service.intro.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="mt-6 text-[1.125rem] leading-relaxed text-ink/70"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[32px] bg-white p-8 shadow-[0_30px_70px_-45px_rgba(20,18,41,0.5)] sm:p-9">
              <p className="font-mono-meta text-ink/45">Always included</p>
              <ul className="mt-6 grid gap-4">
                {service.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[1.0625rem] leading-snug text-ink/75"
                  >
                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${accent.chip}`}
                    >
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Price table */}
      <section className="relative isolate overflow-hidden bg-foam">
        <BubbleAccent size={110} className="right-[7%] top-16 opacity-60" />
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="max-w-3xl">
            <p className="font-mono-meta text-royal">What it costs</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-[-0.025em] text-ink">
              No guessing, no surprise line at the end.
            </h2>
          </div>

          <div className="mt-12 overflow-hidden rounded-[32px] bg-white ring-2 ring-inset ring-ink/8">
            {service.rows.map((row, i) => (
              <div
                key={row.label}
                className={`flex flex-col gap-3 p-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-9 ${
                  i > 0 ? "border-t border-ink/8" : ""
                }`}
              >
                <div className="max-w-2xl">
                  <p className="font-display text-[1.5rem] leading-tight tracking-tight text-ink">
                    {row.label}
                  </p>
                  {row.detail && (
                    <p className="mt-2 text-[1rem] leading-relaxed text-ink/60">
                      {row.detail}
                    </p>
                  )}
                </div>
                <p
                  className={`tabular shrink-0 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-none tracking-tight ${accent.text}`}
                >
                  {row.price}
                </p>
              </div>
            ))}
          </div>

          {service.note && (
            <p className="mt-6 max-w-3xl text-[1rem] leading-relaxed text-ink/55">
              {service.note}
            </p>
          )}

          <div className="mt-12 rounded-[32px] bg-royal/8 p-8 ring-2 ring-inset ring-royal/25 sm:p-10">
            <p className="font-mono-meta text-royal">How we wash it</p>
            <p className="mt-4 max-w-4xl text-[1.0625rem] leading-relaxed text-ink/70">
              {PROCESS.body}
            </p>
          </div>
        </div>
      </section>

      {/* Keep browsing */}
      <section className="bg-foam-deep">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1] tracking-[-0.025em] text-ink">
              We also do these.
            </h2>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-royal"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All services
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other) => {
              const otherAccent = ACCENTS[other.accent];
              const OtherIcon = other.icon;
              return (
                <Link
                  key={other.slug}
                  href={`/services/${other.slug}`}
                  className={`group flex flex-col rounded-[28px] bg-white p-7 ring-2 ring-inset ${otherAccent.ring} transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_36px_70px_-40px_rgba(20,18,41,0.45)]`}
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${otherAccent.chip}`}
                  >
                    <OtherIcon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 font-display text-[1.5rem] leading-tight tracking-tight text-ink">
                    {other.short}
                  </h3>
                  <p className="mt-3 flex-1 text-[1rem] leading-relaxed text-ink/65">
                    {other.tagline}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-royal">
                    {other.priceLabel}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
