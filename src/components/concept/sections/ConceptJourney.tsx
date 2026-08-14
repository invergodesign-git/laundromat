"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { useIntro } from "@/components/concept/IntroContext";
import { DrawSVGPlugin, gsap, MotionPathPlugin, prefersReducedMotion } from "@/lib/gsap";

const STAGES = [
  {
    status: "PICKUP",
    src: "/images/concept/c-journey-01.png",
    alt: "A tote of folded linens waiting on a San Diego doorstep for pickup",
  },
  {
    status: "IN TRANSIT",
    src: "/images/concept/c-journey-02.png",
    alt: "A laundry delivery van on a San Diego street at golden hour",
  },
  {
    status: "WASH",
    src: "/images/concept/c-journey-03.png",
    alt: "Washing machines in soft motion inside the laundromat",
  },
  {
    status: "FOLD",
    src: "/images/concept/c-journey-04.png",
    alt: "Hands carefully folding a crisp white shirt",
  },
  {
    status: "READY",
    src: "/images/concept/c-journey-05.png",
    alt: "Freshly folded linens in a tote, ready to return to the door",
  },
] as const;

const STEPS = ["Customer", "Pickup", "Shop", "Fold", "Door"] as const;
const N = STAGES.length;

function VanMark() {
  return (
    <g transform="translate(-18, -10)">
      <rect x="0" y="4" width="36" height="14" rx="2" fill="#FF8A3D" />
      <rect x="22" y="0" width="12" height="8" rx="1.5" fill="#FF8A3D" />
      <circle cx="8" cy="18" r="3.5" fill="#FAF7F2" />
      <circle cx="28" cy="18" r="3.5" fill="#FAF7F2" />
      <circle cx="8" cy="18" r="1.5" fill="#17131D" />
      <circle cx="28" cy="18" r="1.5" fill="#17131D" />
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
    <section id="journey" ref={root} className="relative z-0 bg-plum">
      <div ref={pin} className="relative h-[100dvh] w-full overflow-hidden bg-plum">
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
              sizes="100vw"
              className="object-cover object-center"
              priority={i <= 1}
            />
            <div aria-hidden="true" className="absolute inset-0 bg-plum/45" />
          </div>
        ))}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(23,19,29,0.7)_100%)]"
        />

        <svg
          className="absolute inset-0 z-20 hidden h-full w-full sm:block"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M 120 720 C 320 620, 420 480, 560 420 C 720 350, 820 300, 980 280 C 1120 265, 1240 220, 1320 160"
            stroke="#FF8A3D"
            strokeWidth="2"
            strokeOpacity="0.15"
            strokeDasharray="6 10"
          />
          <path
            id="journey-route"
            d="M 120 720 C 320 620, 420 480, 560 420 C 720 350, 820 300, 980 280 C 1120 265, 1240 220, 1320 160"
            stroke="#FF8A3D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="120" cy="720" r="5" fill="#FF8A3D" />
          <circle cx="1320" cy="160" r="5" fill="#FF8A3D" />
          <g id="journey-van">
            <VanMark />
          </g>
        </svg>

        <svg
          className="absolute inset-y-0 right-6 z-20 w-8 sm:hidden"
          viewBox="0 0 32 900"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path d="M 16 80 L 16 820" stroke="#FF8A3D" strokeWidth="2" strokeOpacity="0.35" />
          {STAGES.map((_, i) => (
            <circle
              key={i}
              cx="16"
              cy={80 + i * (740 / (N - 1))}
              r={i === status ? 5 : 3}
              fill={i <= status ? "#FF8A3D" : "#FAF7F2"}
              fillOpacity={i <= status ? 1 : 0.25}
            />
          ))}
        </svg>

        <div className="absolute inset-0 z-30 flex flex-col justify-between px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14 lg:px-10">
          <div className="pt-2">
            <p className="font-mono-meta text-lavender/70">How it works</p>
            <div className="relative mt-4 min-h-[clamp(3rem,8vw,6.5rem)]">
              <h2 className="journey-open font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.02em] text-cream">
                We come to you.
              </h2>
              <h2 className="journey-close absolute inset-x-0 top-0 font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.02em] text-cream">
                Back to you.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 items-end gap-5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-6">
            <div className="min-w-0">
              <p className="font-mono-meta text-cream/40">Status</p>
              <p className="mt-1 truncate font-mono text-lg font-medium tracking-[0.12em] text-ember tabular sm:text-xl">
                {STAGES[status].status}
              </p>
            </div>

            <div className="flex gap-1 sm:justify-center" aria-hidden="true">
              {STAGES.map((s, i) => (
                <span
                  key={s.status}
                  className={`h-0.5 w-8 transition-colors duration-150 sm:w-10 ${
                    i <= status ? "bg-ember" : "bg-cream/20"
                  }`}
                />
              ))}
            </div>

            <ol className="flex flex-nowrap items-center justify-start gap-x-1.5 overflow-x-auto font-mono-meta whitespace-nowrap text-cream/45 sm:justify-end">
              {STEPS.map((step, i) => (
                <li key={step} className="inline-flex shrink-0 items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true">→</span>}
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
