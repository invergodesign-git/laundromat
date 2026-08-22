"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { MaskLines } from "@/components/concept/motion/MaskLines";
import { SlideFill } from "@/components/concept/motion/SlideFill";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { BUSINESS } from "@/lib/business";

/**
 * Section 05 — Veteran owned close.
 * Editorial presence: large type against a full-bleed parallax plate.
 */
export function ConceptVeteran() {
  const root = useRef<HTMLElement>(null);
  const plate = useRef<HTMLDivElement>(null);

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

          <p className="mt-8 max-w-md text-[1.0625rem] leading-relaxed text-ink/65">
            Veteran owned, and run by the people who wash your laundry — a local
            shop, not a franchise. Every bag is handled by the same small team, the
            way we would want our own laundry handled.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                src="/images/real/shirts-rack.jpg"
                alt="Freshly laundered shirts hanging in a row, pressed and ready"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            {/* Scrim so the caption holds up over the lighter frames of the photo */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/70 to-transparent"
            />
            <p className="absolute bottom-5 left-5 right-5 font-mono-meta text-white/90">
              {BUSINESS.city} · Wash &amp; fold · Distance-based pickup
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
