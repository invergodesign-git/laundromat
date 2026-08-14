"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { SlideFill } from "@/components/concept/motion/SlideFill";
import { EASE, gsap, prefersReducedMotion, SplitText } from "@/lib/gsap";
import { PRICING_CONFIG } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

const META = [
  "Professional Wash & Fold",
  "San Diego, CA",
  `${formatCurrency(PRICING_CONFIG.washFoldRatePerLb)} / lb`,
  "Verified Veteran Owned",
];

/**
 * Section 01 — Cinematic asymmetric hero.
 * Photograph as off-centre vertical plate; headline crosses its edge.
 */
export function ConceptHero() {
  const root = useRef<HTMLElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const type = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current || !plate.current || !type.current) return;

      if (prefersReducedMotion()) {
        gsap.set([plate.current, type.current, ".hero-meta", ".hero-cta"], {
          autoAlpha: 1,
          clearProps: "clipPath",
        });
        return;
      }

      gsap.set(plate.current, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".hero-meta", { autoAlpha: 0, y: 16 });
      gsap.set(".hero-cta", { autoAlpha: 0, y: 20 });

      const headline = root.current.querySelector(".hero-headline");
      let split: ReturnType<typeof SplitText.create> | null = null;
      if (headline) {
        split = SplitText.create(headline, {
          type: "lines",
          linesClass: "hero-line",
          mask: "lines",
        });
        gsap.set(split.lines, { yPercent: 110 });
      }

      const tl = gsap.timeline({ delay: 0.15 });
      tl.to(plate.current, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.4,
        ease: EASE.premium,
      })
        .to(
          split?.lines ?? [],
          { yPercent: 0, duration: 1.1, stagger: 0.1, ease: EASE.premium },
          "-=0.9"
        )
        .to(
          ".hero-meta",
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: EASE.soft },
          "-=0.5"
        )
        .to(
          ".hero-cta",
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: EASE.soft },
          "-=0.4"
        );

      // Scroll: plate scales, type rises faster.
      gsap.to(plate.current, {
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(type.current, {
        y: -80,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Pointer parallax — subtle depth between plate and type.
      const onMove = (e: MouseEvent) => {
        if (prefersReducedMotion()) return;
        const rect = root.current!.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(plate.current, {
          x: nx * -12,
          y: ny * -8,
          duration: 1.2,
          ease: "power3.out",
        });
        gsap.to(type.current, {
          x: nx * 8,
          y: ny * 6,
          duration: 1.2,
          ease: "power3.out",
        });
      };
      root.current.addEventListener("mousemove", onMove);

      return () => {
        split?.revert();
        root.current?.removeEventListener("mousemove", onMove);
      };
    },
    { scope: root }
  );

  return (
    <section
      id="home"
      ref={root}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-plum pt-[calc(2.25rem+4rem)] sm:pt-[calc(2.25rem+4.5rem)]"
    >
      {/* Off-centre vertical plate — muted on small screens so type stays primary */}
      <div
        ref={plate}
        className="absolute inset-x-0 top-0 h-[42%] opacity-50 will-change-transform sm:opacity-100 sm:-right-[4%] sm:left-auto sm:top-[6%] sm:h-[78%] sm:w-[62%] sm:max-w-[780px] lg:right-[6%] lg:w-[48%]"
      >
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src="/images/concept/c-hero.png"
            alt="Freshly folded white towels and linens in deep plum light"
            fill
            priority
            sizes="(min-width: 1024px) 46vw, 70vw"
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-plum via-plum/20 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-plum/80 via-transparent to-plum/10"
          />
        </div>
      </div>

      <div
        ref={type}
        className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-0 lg:px-10 lg:pb-16"
      >
        <div className="max-w-3xl">
          <p className="hero-meta mb-6 font-mono-meta text-lavender/80">
            Veteran owned · San Diego
          </p>

          <h1 className="hero-headline font-display text-[3.75rem] font-normal leading-[0.94] tracking-[-0.02em] text-cream sm:text-[clamp(3.5rem,8.5vw,6.75rem)]">
            Laundry,
            <br />
            handled right.
          </h1>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 sm:mt-10 sm:gap-x-8">
            {META.map((item) => (
              <li key={item} className="hero-meta font-mono-meta text-cream/55">
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:items-center">
            <div className="hero-cta">
              <SlideFill href="#pricing" variant="ember" size="lg" arrow>
                Book now
              </SlideFill>
            </div>
            <div className="hero-cta">
              <SlideFill href="#journey" variant="ghost" size="lg" arrow magnetic={false}>
                Discover more
              </SlideFill>
            </div>
          </div>
        </div>
      </div>

      {/* Baseline rule */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-cream/10"
      />
    </section>
  );
}
