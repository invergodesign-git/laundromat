"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { BubbleAccent } from "@/components/concept/motion/Bubbles";
import { MaskLines } from "@/components/concept/motion/MaskLines";
import { SlideFill } from "@/components/concept/motion/SlideFill";
import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import { BUSINESS } from "@/lib/business";

const FACTS = [
  { label: "Owner", value: BUSINESS.ownerFirstName },
  { label: "Shop", value: "2575 Old Quarry Road" },
  { label: "Serves", value: BUSINESS.servingArea },
] as const;

/**
 * Section 05 — Veteran owned close.
 * Editorial presence: oversized seal, full-bleed plate, fact rail.
 */
export function ConceptVeteran() {
  const root = useRef<HTMLElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;

      if (plate.current) {
        gsap.fromTo(
          plate.current,
          { yPercent: 8 },
          {
            yPercent: -8,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      if (seal.current) {
        gsap.from(seal.current, {
          autoAlpha: 0,
          y: 30,
          duration: 1,
          ease: EASE.premium,
          scrollTrigger: {
            trigger: seal.current,
            start: "top 85%",
            once: true,
          },
        });
      }
    },
    { scope: root }
  );

  return (
    <section id="about" ref={root} className="relative overflow-hidden bg-foam">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[8%] top-[20%] h-[30rem] w-[30rem] rounded-full bg-aqua/18 blur-[130px]"
      />

      <div className="relative mx-auto grid max-w-[1440px] lg:grid-cols-12">
        {/* Copy column */}
        <div className="flex flex-col justify-center px-5 py-24 sm:px-8 sm:py-28 lg:col-span-6 lg:px-10 lg:py-36">
          <p className="font-mono-meta text-royal">About Us</p>

          <MaskLines className="mt-4">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.96] tracking-[-0.02em] text-ink">
              Service is built into
              <br />
              who we are.
            </h2>
          </MaskLines>

          {/* Oversized typographic seal */}
          <div ref={seal} className="glass relative mt-12 inline-flex max-w-md flex-col rounded-3xl px-6 py-6 sm:px-8 sm:py-7">
            <BubbleAccent size={34} className="-right-3 -top-4" duration={8} />
            <span className="font-mono-meta text-ember">Verified</span>
            <span className="mt-2 font-display text-[clamp(2rem,4vw,3.25rem)] leading-none tracking-tight text-ink">
              Veteran Owned
            </span>
            <span className="mt-4 h-0.5 w-16 rounded-full bg-ember" aria-hidden="true" />
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink/65">
              Owned and run by {BUSINESS.ownerFirstName} — a local shop, not a franchise.
            </p>
          </div>

          <div className="mt-10 grid gap-5 border-t border-ink/10 pt-8 sm:grid-cols-3">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <p className="font-mono-meta text-ink/40">{fact.label}</p>
                <p className="mt-1.5 text-[0.9375rem] font-medium leading-snug text-ink/85">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SlideFill href="#pricing" variant="primary" size="lg" arrow>
              Book now
            </SlideFill>
            <SlideFill href={BUSINESS.phoneHref} variant="glass" size="lg" magnetic={false}>
              Contact Us
            </SlideFill>
          </div>
        </div>

        {/* Full-height plate */}
        <div className="relative min-h-[420px] lg:col-span-6 lg:min-h-full">
          <div className="absolute inset-4 overflow-hidden rounded-[28px] shadow-[0_40px_90px_-50px_rgba(20,18,41,0.65)] sm:inset-6 lg:inset-8">
            <div ref={plate} className="relative h-[120%] w-full will-change-transform">
              <Image
                src="/images/real/machines.jpg"
                alt="A row of washing machines lit up inside the laundromat"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="absolute bottom-5 left-5 right-5 font-mono-meta text-white/80">
              {BUSINESS.city} · Wash &amp; fold · Distance-based pickup
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
