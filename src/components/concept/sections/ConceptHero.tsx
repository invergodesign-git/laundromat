"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Sparkles, Truck, ShieldCheck } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { Bubbles } from "@/components/concept/motion/Bubbles";
import { SlideFill } from "@/components/concept/motion/SlideFill";
import { DrawSVGPlugin, EASE, gsap, prefersReducedMotion, SplitText } from "@/lib/gsap";
import { BUSINESS } from "@/lib/business";
import { ESTIMATOR } from "@/lib/booking";
import {
  DELIVERY_FEE_CAP,
  DELIVERY_RATE_PER_MILE,
  LOWEST_RATE_PER_LB,
} from "@/lib/pricing";
import { cn, formatCurrency } from "@/lib/utils";

const TRUST = [
  { icon: ShieldCheck, label: "Veteran owned" },
  { icon: Truck, label: "We pick up & deliver" },
  { icon: Sparkles, label: "Folded by hand" },
] as const;

/** Bubbles you can actually pop. Positioned along the bottom of the hero. */
const POPPABLE = [
  { left: 6, bottom: 14, size: 58 },
  { left: 17, bottom: 4, size: 34 },
  { left: 28, bottom: 20, size: 44 },
  { left: 39, bottom: 6, size: 26 },
  { left: 62, bottom: 18, size: 40 },
  { left: 73, bottom: 5, size: 62 },
  { left: 84, bottom: 22, size: 30 },
  { left: 92, bottom: 8, size: 48 },
] as const;

/**
 * Hero — light, glassy and deliberately playful. The photograph sits in a
 * tilted glass frame, soap bubbles rise past it, and the ones along the
 * bottom pop when you touch them.
 */
export function ConceptHero() {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const type = useRef<HTMLDivElement>(null);
  const blobs = useRef<HTMLDivElement>(null);
  const [popped, setPopped] = useState<number[]>([]);

  const pop = useCallback((i: number) => {
    setPopped((prev) => (prev.includes(i) ? prev : [...prev, i]));
    window.setTimeout(() => {
      setPopped((prev) => prev.filter((n) => n !== i));
    }, 1400);
  }, []);

  useGSAP(
    () => {
      if (!root.current || !frame.current || !type.current) return;

      void DrawSVGPlugin;

      const squiggle = root.current.querySelector(".hero-squiggle") as SVGPathElement | null;

      if (prefersReducedMotion()) {
        gsap.set([frame.current, ".hero-meta", ".hero-cta", ".hero-card"], { autoAlpha: 1 });
        if (squiggle) gsap.set(squiggle, { drawSVG: "100%" });
        return;
      }

      gsap.set(frame.current, { autoAlpha: 0, y: 48, rotate: 4, scale: 0.96 });
      gsap.set(".hero-meta", { autoAlpha: 0, y: 16 });
      gsap.set(".hero-cta", { autoAlpha: 0, y: 20 });
      gsap.set(".hero-card", { autoAlpha: 0, y: 24, scale: 0.92 });
      if (squiggle) gsap.set(squiggle, { drawSVG: "0%" });

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

      tl.to(split?.lines ?? [], {
        yPercent: 0,
        duration: 1.05,
        stagger: 0.09,
        ease: EASE.premium,
      })
        .to(
          frame.current,
          { autoAlpha: 1, y: 0, rotate: 2.2, scale: 1, duration: 1.3, ease: EASE.premium },
          "-=0.85"
        )
        .to(
          ".hero-meta",
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: EASE.soft },
          "-=0.9"
        )
        .to(
          ".hero-cta",
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: EASE.soft },
          "-=0.5"
        )
        .to(
          ".hero-card",
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12, ease: "back.out(1.6)" },
          "-=0.45"
        );

      if (squiggle) {
        tl.to(squiggle, { drawSVG: "100%", duration: 0.7, ease: EASE.soft }, "-=0.6");
      }

      // Scroll: the frame drifts up faster than the type, opening depth.
      gsap.to(frame.current, {
        y: -70,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(blobs.current, {
        y: 90,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Pointer parallax — frame leans toward the cursor, colour field away.
      // Deliberately 2D: a preserve-3d frame gets its own composited layer and
      // Chrome then paints it over the backdrop-filtered nav.
      const onMove = (e: MouseEvent) => {
        const rect = root.current!.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        // `y` belongs to the scroll parallax above — only x/rotate here.
        gsap.to(frame.current, {
          rotate: 2.2 + nx * 1.8,
          x: nx * 16,
          duration: 1.1,
          ease: "power3.out",
        });
        gsap.to(blobs.current, {
          x: nx * -34,
          duration: 1.4,
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
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-foam pt-[calc(2.25rem+5rem)] sm:pt-[calc(2.25rem+6rem)]"
    >
      {/* Soft colour field — the only thing keeping a white page from going flat */}
      <div ref={blobs} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-[12%] top-[-10%] h-[38rem] w-[38rem] rounded-full bg-aqua/25 blur-[130px]" />
        <div className="absolute right-[-14%] top-[8%] h-[42rem] w-[42rem] rounded-full bg-rich/20 blur-[140px]" />
        <div className="absolute bottom-[-18%] left-[28%] h-[32rem] w-[32rem] rounded-full bg-blush/20 blur-[120px]" />
      </div>

      {/* Ambient rise — behind everything, never interactive */}
      <Bubbles count={11} rise="-105vh" speed={1.25} className="-z-10 opacity-70" />

      <div className="relative mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 items-center gap-12 px-5 pb-28 pt-10 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-32">
        {/* ---- Type column ---- */}
        <div ref={type} className="relative z-10 lg:col-span-6">
          <p className="hero-meta glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono-meta text-ink/65">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            Veteran owned · {BUSINESS.city}
          </p>

          <h1 className="hero-headline mt-6 font-display text-[clamp(3rem,9vw,5.75rem)] leading-[0.95] tracking-[-0.025em] text-ink">
            Skip laundry day.
            <br />
            Keep the clean part.
          </h1>

          {/* Hand-drawn strike under the promise — draws itself in */}
          <svg
            aria-hidden="true"
            viewBox="0 0 320 22"
            fill="none"
            className="hero-meta mt-1 h-4 w-[min(320px,62%)] text-ember"
          >
            <path
              className="hero-squiggle"
              d="M4 13C46 5 92 17 134 10C176 3 218 15 260 9C284 6 302 11 316 7"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          <p className="hero-meta mt-6 max-w-md text-[1.0625rem] leading-relaxed text-ink/65 sm:text-[1.125rem]">
            Leave the bag at your door. It comes back washed, dried and folded
            by hand — from {formatCurrency(LOWEST_RATE_PER_LB)} a pound, with
            delivery priced honestly at {formatCurrency(DELIVERY_RATE_PER_MILE)}{" "}
            a mile and never over {formatCurrency(DELIVERY_FEE_CAP)}.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="hero-cta">
              <SlideFill href={ESTIMATOR.homeHref} variant="primary" size="lg" arrow>
                Estimator
              </SlideFill>
            </div>
            <div className="hero-cta">
              <SlideFill href="#journey" variant="glass" size="lg" arrow magnetic={false}>
                See how it works
              </SlideFill>
            </div>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {TRUST.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="hero-meta flex items-center gap-2 text-[0.8125rem] font-medium text-ink/55"
              >
                <Icon className="h-4 w-4 text-royal" strokeWidth={2} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* ---- Photograph column ---- */}
        <div className="relative lg:col-span-6 lg:pl-6">
          <div
            ref={frame}
            className="relative mx-auto aspect-[4/5] w-full max-w-[520px] will-change-transform"
          >
            <div className="glass absolute inset-0 rounded-[32px] p-2.5 sm:p-3">
              <div className="relative h-full w-full overflow-hidden rounded-[24px]">
                <Image
                  src="/images/real/hero-stack.jpg"
                  alt="A tall stack of freshly folded, brightly coloured laundry carried in both arms"
                  fill
                  priority
                  sizes="(min-width: 1024px) 44vw, 90vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Price chip — the number people came for */}
            <div className="hero-card glass absolute bottom-10 left-2 rounded-2xl px-5 py-4 sm:-left-12">
              <p className="font-mono-meta text-ink/45">Wash &amp; fold</p>
              <p className="mt-1 font-display text-[2rem] leading-none tracking-tight text-ember tabular">
                <span className="mr-1 font-mono text-sm tracking-wide text-ink/45">
                  from
                </span>
                {formatCurrency(LOWEST_RATE_PER_LB)}
                <span className="ml-1 font-mono text-sm tracking-wide text-ink/45">/ lb</span>
              </p>
            </div>

            {/* Turnaround chip */}
            <div className="hero-card glass absolute -right-2 top-10 flex items-center gap-2.5 rounded-2xl px-4 py-3 sm:-right-6">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-royal/10 text-royal">
                <Truck className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="text-[0.8125rem] font-medium leading-tight text-ink/70">
                Door to door
                <br />
                <span className="text-ink/45">in {BUSINESS.servingArea.split(",")[0]}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Foam line: poppable bubbles sitting on a soft wave ---- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40">
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-full w-full"
        >
          <path
            d="M0,96 C180,52 340,132 540,104 C740,76 860,20 1060,52 C1220,78 1340,60 1440,36 L1440,160 L0,160 Z"
            fill="white"
            fillOpacity="0.5"
          />
          {/* Solid foam — same value as the section that follows, so the two
              never show a seam where they meet. */}
          <path
            d="M0,124 C200,88 380,150 600,128 C820,106 960,64 1180,92 C1300,108 1380,100 1440,88 L1440,160 L0,160 Z"
            fill="var(--color-foam)"
          />
        </svg>

        <div className="pointer-events-auto absolute inset-0">
          {POPPABLE.map((b, i) => {
            const isPopped = popped.includes(i);
            return (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onPointerEnter={() => pop(i)}
                onClick={() => pop(i)}
                className={cn(
                  "bubble absolute cursor-pointer transition-all duration-300 ease-out",
                  isPopped ? "scale-150 opacity-0" : "scale-100 opacity-100"
                )}
                style={{
                  left: `${b.left}%`,
                  bottom: `${b.bottom}px`,
                  width: b.size,
                  height: b.size,
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
