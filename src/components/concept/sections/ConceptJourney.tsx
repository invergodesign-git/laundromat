"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { useIntro } from "@/components/concept/IntroContext";
import { Bubbles } from "@/components/concept/motion/Bubbles";
import { DrawSVGPlugin, gsap, MotionPathPlugin, prefersReducedMotion } from "@/lib/gsap";

const STAGES = [
  {
    status: "PICKUP",
    src: "/images/real/basket.jpg",
    alt: "A full laundry basket waiting to be collected",
  },
  {
    status: "IN TRANSIT",
    src: "/images/real/van.jpg",
    alt: "A white delivery van on the road under open sky",
  },
  {
    status: "WASH",
    src: "/images/real/shop.jpg",
    alt: "Commercial washing machines running inside the laundromat",
  },
  {
    status: "FOLD",
    src: "/images/real/fold.jpg",
    alt: "Clothes being folded by hand into neat stacks",
  },
  {
    status: "READY",
    src: "/images/real/handoff.jpg",
    alt: "A warm stack of clean folded knitwear carried back to the door",
  },
] as const;

const STEPS = ["Customer", "Pickup", "Shop", "Fold", "Door"] as const;
const N = STAGES.length;

function VanMark() {
  return (
    <g transform="translate(-18, -10)">
      <rect x="0" y="4" width="36" height="14" rx="3" fill="#FF6A2B" />
      <rect x="22" y="0" width="12" height="8" rx="2" fill="#FF6A2B" />
      <rect x="24" y="2" width="8" height="5" rx="1" fill="#FFFFFF" fillOpacity="0.75" />
      <circle cx="8" cy="18" r="3.6" fill="#141229" />
      <circle cx="28" cy="18" r="3.6" fill="#141229" />
      <circle cx="8" cy="18" r="1.4" fill="#FFFFFF" />
      <circle cx="28" cy="18" r="1.4" fill="#FFFFFF" />
    </g>
  );
}

/**
 * How it works — plates are hard-swapped from the *animation* playhead
 * (not raw scroll progress), so status + image never desync under scrub lag.
 */
export function ConceptJourney() {
  const { ready } = useIntro();
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState(0);

  useGSAP(
    () => {
      if (!ready || !root.current || !pin.current) return;

      void DrawSVGPlugin;
      void MotionPathPlugin;

      const path = pin.current.querySelector("#journey-route") as SVGPathElement | null;
      const van = pin.current.querySelector("#journey-van") as SVGGElement | null;
      const plates = gsap.utils.toArray<HTMLElement>(".journey-plate");
      const open = pin.current.querySelector(".journey-open");
      const close = pin.current.querySelector(".journey-close");

      const showPlate = (index: number) => {
        plates.forEach((plate, i) => {
          gsap.set(plate, {
            autoAlpha: i === index ? 1 : 0,
            zIndex: i === index ? 5 : 1,
          });
        });
      };

      if (prefersReducedMotion()) {
        showPlate(N - 1);
        gsap.set(path, { drawSVG: "100%" });
        gsap.set(open, { autoAlpha: 0 });
        gsap.set(close, { autoAlpha: 1 });
        setStatus(N - 1);
        return;
      }

      showPlate(0);
      gsap.set(path, { drawSVG: "0%" });
      gsap.set(close, { autoAlpha: 0, y: 20 });
      gsap.set(open, { autoAlpha: 1, y: 0 });

      if (van && path) {
        gsap.set(van, {
          motionPath: {
            path,
            align: path,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
            start: 0,
            end: 0,
          },
        });
      }

      let last = -1;

      const applyStage = (progress: number) => {
        // Snap to stage from the timeline playhead — locked 1:1 with what you see.
        const i = Math.min(N - 1, Math.floor(progress * N + 1e-6));
        if (i === last) return;
        last = i;
        showPlate(i);
        setStatus(i);
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 6.5)}`,
          pin: pin.current,
          // true = no lag between scroll and playhead (was the desync source)
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.animation ? self.animation.progress() : self.progress;
            applyStage(p);
          },
        },
      });

      // Route + van across the whole journey
      tl.to(open, { autoAlpha: 0, y: -24, duration: 0.08 }, 0);

      if (path) {
        tl.to(path, { drawSVG: "100%", duration: 1 }, 0);
      }
      if (van && path) {
        tl.to(
          van,
          {
            motionPath: {
              path,
              align: path,
              alignOrigin: [0.5, 0.5],
              autoRotate: true,
            },
            duration: 1,
          },
          0
        );
      }

      tl.to(close, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.88);

      // Seed stage 0
      applyStage(0);
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true }
  );

  return (
    <section id="journey" ref={root} className="relative z-0 bg-foam">
      <div ref={pin} className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-foam">
        {/* Colour field + drifting foam, kept well behind the photograph */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-[10%] top-[10%] h-[32rem] w-[32rem] rounded-full bg-aqua/20 blur-[130px]" />
          <div className="absolute -right-[8%] bottom-[6%] h-[34rem] w-[34rem] rounded-full bg-rich/18 blur-[130px]" />
        </div>
        <Bubbles count={7} rise="-100vh" speed={1.6} className="opacity-45" />

        <div className="relative z-30 mx-auto w-full max-w-[1440px] shrink-0 px-5 pt-16 sm:px-8 sm:pt-20 lg:px-10">
          <p className="font-mono-meta text-royal">How it works</p>
          <div className="relative mt-3 min-h-[clamp(2.75rem,7vw,5rem)]">
            <h2 className="journey-open font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-ink">
              We come to you.
            </h2>
            <h2 className="journey-close absolute inset-x-0 top-0 font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-ink">
              Back to you.
            </h2>
          </div>
        </div>

        {/* Stage plate — a framed photograph, not a full-bleed wash */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1100px] min-h-0 flex-1 items-center px-5 py-6 sm:px-8 lg:px-10">
          <div className="glass relative h-full max-h-[46vh] w-full rounded-[28px] p-2.5 sm:max-h-none sm:p-3">
            <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-foam-deep">
              {STAGES.map((stage, i) => (
                <div
                  key={stage.status}
                  className="journey-plate absolute inset-0"
                  style={{ zIndex: i === 0 ? 5 : 1, opacity: i === 0 ? 1 : 0 }}
                >
                  <Image
                    src={stage.src}
                    alt={stage.alt}
                    fill
                    sizes="(min-width: 1100px) 1100px, 100vw"
                    className="object-cover object-center"
                    priority={i <= 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Route — drawn over the whole frame so the van really travels */}
        <svg
          className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full sm:block"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M 90 780 C 300 700, 380 520, 560 440 C 740 360, 860 320, 1010 300 C 1160 280, 1280 210, 1360 130"
            stroke="#4536D6"
            strokeWidth="2"
            strokeOpacity="0.16"
            strokeDasharray="6 10"
          />
          <path
            id="journey-route"
            d="M 90 780 C 300 700, 380 520, 560 440 C 740 360, 860 320, 1010 300 C 1160 280, 1280 210, 1360 130"
            stroke="#4536D6"
            strokeWidth="2.5"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />
          <circle cx="90" cy="780" r="6" fill="#4536D6" />
          <circle cx="1360" cy="130" r="6" fill="#4536D6" />
          <g id="journey-van">
            <VanMark />
          </g>
        </svg>

        {/* Mobile: a simple vertical tracker instead of the driving route */}
        <svg
          className="pointer-events-none absolute inset-y-0 right-4 z-20 w-8 sm:hidden"
          viewBox="0 0 32 900"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path d="M 16 80 L 16 820" stroke="#4536D6" strokeWidth="2" strokeOpacity="0.25" />
          {STAGES.map((_, i) => (
            <circle
              key={i}
              cx="16"
              cy={80 + i * (740 / (N - 1))}
              r={i === status ? 6 : 4}
              fill={i <= status ? "#FF6A2B" : "#4536D6"}
              fillOpacity={i <= status ? 1 : 0.2}
            />
          ))}
        </svg>

        <div className="relative z-30 mx-auto w-full max-w-[1440px] shrink-0 px-5 pb-8 sm:px-8 sm:pb-10 lg:px-10">
          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-6">
            <div className="min-w-0">
              <p className="font-mono-meta text-ink/40">Status</p>
              <p className="mt-1 truncate font-mono text-lg font-medium tracking-[0.12em] text-ember tabular sm:text-xl">
                {STAGES[status].status}
              </p>
            </div>

            <div className="flex gap-1 sm:justify-center" aria-hidden="true">
              {STAGES.map((s, i) => (
                <span
                  key={s.status}
                  className={`h-1 w-8 rounded-full transition-colors duration-150 sm:w-10 ${
                    i <= status ? "bg-ember" : "bg-ink/15"
                  }`}
                />
              ))}
            </div>

            <ol className="flex flex-nowrap items-center justify-start gap-x-1.5 overflow-x-auto font-mono-meta whitespace-nowrap text-ink/45 sm:justify-end">
              {STEPS.map((step, i) => (
                <li key={step} className="inline-flex shrink-0 items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true">→</span>}
                  <span className={i === status ? "text-royal" : undefined}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
