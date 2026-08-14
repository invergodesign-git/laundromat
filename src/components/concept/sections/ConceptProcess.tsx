"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { useIntro } from "@/components/concept/IntroContext";
import { MaskLines } from "@/components/concept/motion/MaskLines";
import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    n: "01",
    title: "Wash",
    body: "Sorted by fabric. Washed at the right temperature.",
    src: "/images/real/room-bright.jpg",
    alt: "A clean, bright laundry room with a front-load washer mid-cycle",
  },
  {
    n: "02",
    title: "Dry",
    body: "Dried properly — not rushed, not left damp.",
    src: "/images/real/dryers.jpg",
    alt: "A long row of commercial dryers with their doors open",
  },
  {
    n: "03",
    title: "Fold",
    body: "Folded by hand so it goes straight into the drawer.",
    src: "/images/real/whites.jpg",
    alt: "Crisp white shirts hanging in soft daylight",
  },
] as const;

/**
 * Section 03 — Wash / Dry / Fold.
 * Full-viewport pin: plate always fills the visible frame (no below-fold crop).
 */
export function ConceptProcess() {
  const { ready } = useIntro();
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (!ready || !root.current || !pin.current) return;

      const plates = gsap.utils.toArray<HTMLElement>(".process-plate");
      const nums = gsap.utils.toArray<HTMLElement>(".process-num");
      const texts = gsap.utils.toArray<HTMLElement>(".process-text");

      if (prefersReducedMotion()) {
        gsap.set(plates, { autoAlpha: 0 });
        gsap.set(plates[0], { autoAlpha: 1 });
        return;
      }

      gsap.set(plates, { clipPath: "inset(0% 0% 0% 100%)", autoAlpha: 1 });
      gsap.set(plates[0], { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(nums, { opacity: 0.22, scale: 0.94 });
      gsap.set(nums[0], { opacity: 1, scale: 1 });
      gsap.set(texts, { autoAlpha: 0, y: 16 });
      gsap.set(texts[0], { autoAlpha: 1, y: 0 });

      let last = -1;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 4.8)}`,
          pin: pin.current,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.min(2, Math.floor(self.progress * 3));
            if (i !== last) {
              last = i;
              setActive(i);
            }
          },
        },
      });

      tl.to(plates[1], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.28, ease: EASE.softInOut }, 0.28)
        .to(nums[0], { opacity: 0.22, scale: 0.94, duration: 0.18 }, 0.28)
        .to(nums[1], { opacity: 1, scale: 1, duration: 0.18 }, 0.28)
        .to(texts[0], { autoAlpha: 0, y: -12, duration: 0.16 }, 0.28)
        .to(texts[1], { autoAlpha: 1, y: 0, duration: 0.2 }, 0.32);

      tl.to(plates[2], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.28, ease: EASE.softInOut }, 0.62)
        .to(nums[1], { opacity: 0.22, scale: 0.94, duration: 0.18 }, 0.62)
        .to(nums[2], { opacity: 1, scale: 1, duration: 0.18 }, 0.62)
        .to(texts[1], { autoAlpha: 0, y: -12, duration: 0.16 }, 0.62)
        .to(texts[2], { autoAlpha: 1, y: 0, duration: 0.2 }, 0.66);
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true }
  );

  return (
    <section id="services" ref={root} className="relative z-10 bg-white text-ink">
      {/* Soft wave carrying the soap-blue page into the white service band */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 overflow-hidden sm:h-16"
      >
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0,0 L1440,0 L1440,26 C1200,58 960,10 720,34 C480,58 240,20 0,44 Z"
            fill="#F2F6FF"
          />
        </svg>
      </div>

      <div ref={pin} className="relative flex h-[100dvh] flex-col overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col px-5 pt-24 sm:px-8 lg:px-10 lg:pt-28">
          <p className="font-mono-meta shrink-0 text-royal">Services</p>

          <MaskLines className="mt-3 max-w-3xl shrink-0">
            <h2 className="font-display text-[clamp(2rem,5vw,4rem)] leading-[0.98] tracking-[-0.02em] text-ink">
              You drop it off.
              <br />
              We handle the rest.
            </h2>
          </MaskLines>

          {/* Remaining height always hosts the plate — never pushed below fold */}
          <div className="mt-6 grid min-h-0 flex-1 gap-5 pb-10 lg:mt-8 lg:grid-cols-12 lg:gap-10 lg:pb-14">
            <div className="flex shrink-0 gap-5 lg:col-span-2 lg:flex-col lg:justify-center lg:gap-6">
              {STAGES.map((s, i) => (
                <button
                  key={s.n}
                  type="button"
                  className={cn(
                    "process-num text-left font-display text-3xl tracking-tight transition-colors sm:text-4xl lg:text-5xl",
                    i === active ? "text-royal" : "text-ink/20"
                  )}
                  aria-current={i === active}
                >
                  {s.n}
                </button>
              ))}
            </div>

            <div className="relative min-h-[240px] overflow-hidden rounded-[24px] shadow-[0_30px_70px_-40px_rgba(20,18,41,0.5)] lg:col-span-7 lg:min-h-0">
              {STAGES.map((s) => (
                <div key={s.src} className="process-plate absolute inset-0">
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover"
                    priority={s.n === "01"}
                  />
                </div>
              ))}
            </div>

            <div className="relative flex min-h-[5.5rem] items-end lg:col-span-3 lg:items-center">
              {STAGES.map((s) => (
                <div
                  key={s.title}
                  className="process-text absolute inset-x-0 bottom-0 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
                >
                  <p className="font-mono-meta text-ember">{s.title}</p>
                  <p className="mt-2 max-w-sm text-base leading-relaxed text-ink/65 sm:text-lg">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
