"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
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
 * Stronger editorial presence: oversized seal, full-bleed plate, fact rail.
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
    <section id="about" ref={root} className="relative overflow-hidden bg-plum">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-12">
        {/* Copy column */}
        <div className="flex flex-col justify-center px-5 py-24 sm:px-8 sm:py-28 lg:col-span-6 lg:px-10 lg:py-36">
          <p className="font-mono-meta text-lavender/70">About Us</p>

          <MaskLines className="mt-4">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.96] tracking-[-0.02em] text-cream">
              Service is built into
              <br />
              who we are.
            </h2>
          </MaskLines>

          {/* Oversized typographic seal */}
          <div
            ref={seal}
            className="mt-12 inline-flex max-w-md flex-col border border-cream/20 bg-cream/[0.03] px-6 py-6 sm:px-8 sm:py-7"
          >
            <span className="font-mono-meta text-ember">Verified</span>
            <span className="mt-2 font-display text-[clamp(2rem,4vw,3.25rem)] leading-none tracking-tight text-cream">
              Veteran Owned
            </span>
            <span className="mt-4 h-px w-16 bg-ember" aria-hidden="true" />
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-cream/60">
              Owned and run by {BUSINESS.ownerFirstName} — a local shop, not a franchise.
            </p>
          </div>

          <div className="mt-10 grid gap-5 border-t border-cream/10 pt-8 sm:grid-cols-3">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <p className="font-mono-meta text-cream/35">{fact.label}</p>
                <p className="mt-1.5 text-[0.9375rem] font-medium leading-snug text-cream/85">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SlideFill href="#pricing" variant="ember" size="lg" arrow>
              Book now
            </SlideFill>
            <SlideFill href={BUSINESS.phoneHref} variant="outline" size="lg" magnetic={false}>
              Contact Us
            </SlideFill>
          </div>
        </div>

        {/* Full-height plate */}
        <div className="relative min-h-[420px] lg:col-span-6 lg:min-h-full">
          <div className="absolute inset-0 overflow-hidden">
            <div ref={plate} className="relative h-[120%] w-full will-change-transform">
              <Image
                src="/images/concept/c-veteran.png"
                alt="Soft light across a stack of folded white linens"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-plum via-plum/20 to-transparent lg:from-plum/40"
            />
          </div>
          <p className="absolute bottom-6 left-5 right-5 font-mono-meta text-cream/50 sm:left-8 lg:left-10">
            {BUSINESS.city} · Wash &amp; fold · Distance-based pickup
          </p>
        </div>
      </div>
    </section>
  );
}
