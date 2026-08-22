import type { ReactNode } from "react";
import Image from "next/image";
import { BubbleAccent, Bubbles } from "@/components/concept/motion/Bubbles";
import { ACCENTS, type AccentName } from "@/lib/services";
import { cn } from "@/lib/utils";

/**
 * Highlighter swipe behind a word. Sits under the text on its own layer so
 * the marker reads as ink on paper rather than a background colour.
 */
export function Highlight({
  children,
  accent = "ember",
  tilt = "-rotate-1",
}: {
  children: ReactNode;
  accent?: AccentName;
  tilt?: string;
}) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 bottom-1 z-0 h-[0.35em] rounded-full",
          ACCENTS[accent].marker,
          tilt
        )}
      />
    </span>
  );
}

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  accent?: AccentName;
  image?: { src: string; alt: string };
  /** CTA row or chips, rendered under the lead. */
  children?: ReactNode;
}

/**
 * Shared page header. Every route above the fold looks like the homepage:
 * soap-blue paper, drifting bubbles, oversized serif headline.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  accent = "royal",
  image,
  children,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-foam">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_0%,rgba(108,92,255,0.14),transparent_62%)]"
      />
      <Bubbles count={6} rise="-60vh" speed={1.8} className="opacity-40" />
      <BubbleAccent
        size={120}
        className="right-[6%] top-10 hidden opacity-70 lg:block"
      />

      <div
        className={cn(
          "relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-16 lg:gap-14 lg:px-10 lg:pb-24 lg:pt-20",
          image && "lg:grid-cols-12"
        )}
      >
        <div className={cn(image ? "lg:col-span-7" : "max-w-4xl")}>
          <p
            className={cn(
              "inline-flex items-center rounded-full px-3.5 py-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em]",
              ACCENTS[accent].wash,
              ACCENTS[accent].text
            )}
          >
            {eyebrow}
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.5rem,6.5vw,5rem)] leading-[0.96] tracking-[-0.025em] text-ink">
            {title}
          </h1>
          {lead && (
            <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ink/65 sm:text-[1.1875rem]">
              {lead}
            </p>
          )}
          {children && <div className="mt-9">{children}</div>}
        </div>

        {image && (
          <div className="lg:col-span-5">
            <div className="glass relative aspect-[4/3] overflow-hidden rounded-[32px] p-2.5 sm:p-3">
              <div className="relative h-full w-full overflow-hidden rounded-[24px]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
