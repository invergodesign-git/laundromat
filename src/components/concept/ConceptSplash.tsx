"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { useIntro } from "@/components/concept/IntroContext";
import { EASE, gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { BUSINESS } from "@/lib/business";

type BubbleSpec = {
  left: string;
  size: number;
  /** Full rise duration (seconds) */
  duration: number;
  drift: number;
  opacity: number;
  /**
   * Negative delay (as fraction of duration) so the bubble is already
   * mid-rise when the splash opens — never an empty foam field.
   */
  phase: number;
};

const BUBBLES: BubbleSpec[] = [
  { left: "4%", size: 44, duration: 12, drift: 20, opacity: 0.92, phase: 0.35 },
  { left: "11%", size: 82, duration: 15, drift: -16, opacity: 0.95, phase: 0.55 },
  { left: "18%", size: 26, duration: 10, drift: 24, opacity: 0.85, phase: 0.2 },
  { left: "26%", size: 118, duration: 17, drift: -12, opacity: 0.93, phase: 0.4 },
  { left: "36%", size: 54, duration: 13, drift: 28, opacity: 0.9, phase: 0.7 },
  { left: "46%", size: 136, duration: 18, drift: -20, opacity: 0.96, phase: 0.25 },
  { left: "56%", size: 32, duration: 11, drift: 14, opacity: 0.84, phase: 0.5 },
  { left: "64%", size: 70, duration: 14, drift: -24, opacity: 0.92, phase: 0.15 },
  { left: "72%", size: 92, duration: 16, drift: 18, opacity: 0.94, phase: 0.45 },
  { left: "80%", size: 38, duration: 12, drift: -14, opacity: 0.88, phase: 0.65 },
  { left: "88%", size: 58, duration: 13, drift: 12, opacity: 0.9, phase: 0.3 },
  { left: "94%", size: 30, duration: 10, drift: -8, opacity: 0.82, phase: 0.55 },
  { left: "8%", size: 22, duration: 9, drift: 16, opacity: 0.78, phase: 0.8 },
  { left: "42%", size: 40, duration: 11, drift: -18, opacity: 0.86, phase: 0.1 },
  { left: "68%", size: 50, duration: 12, drift: 22, opacity: 0.9, phase: 0.75 },
  { left: "32%", size: 20, duration: 8, drift: 18, opacity: 0.75, phase: 0.6 },
  { left: "52%", size: 100, duration: 16, drift: -26, opacity: 0.94, phase: 0.05 },
  { left: "14%", size: 64, duration: 14, drift: 15, opacity: 0.9, phase: 0.85 },
];

/**
 * Splash — CSS soap bubbles stay visible for the whole load (phase-shifted
 * so the screen is never empty), then logo flies into the navbar slot.
 */
export function ConceptSplash() {
  const { ready, markReady } = useIntro();
  const root = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLParagraphElement>(null);
  const foam = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);

  useGSAP(
    () => {
      if (!root.current || ready) return;

      if (prefersReducedMotion()) {
        markReady();
        return;
      }

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      gsap.fromTo(
        logo.current,
        { autoAlpha: 0, scale: 0.92, y: 18 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.9, ease: EASE.premium, delay: 0.1 }
      );
      gsap.fromTo(
        label.current,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE.soft, delay: 0.28 }
      );

      const progress = { v: 0 };
      gsap.to(progress, {
        v: 100,
        duration: 2.8,
        delay: 0.3,
        ease: "power2.inOut",
        onUpdate: () => {
          setPct(Math.round(progress.v));
          if (bar.current) bar.current.style.width = `${progress.v}%`;
        },
        onComplete: () => handoff(),
      });

      function handoff() {
        const splashLogo = logo.current;
        const navLogo = document.getElementById("nav-logo");
        if (!splashLogo || !navLogo || !root.current) {
          finish();
          return;
        }

        const from = splashLogo.getBoundingClientRect();
        const to = navLogo.getBoundingClientRect();
        const dx = to.left + to.width / 2 - (from.left + from.width / 2);
        const dy = to.top + to.height / 2 - (from.top + from.height / 2);
        const scale = to.width / from.width;

        const tl = gsap.timeline({ onComplete: finish });

        tl.to(foam.current, { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, 0)
          .to(label.current, { autoAlpha: 0, y: -8, duration: 0.3 }, 0)
          .to(".splash-load", { autoAlpha: 0, y: 8, duration: 0.3 }, 0)
          .to(
            splashLogo,
            { x: dx, y: dy, scale, duration: 1.05, ease: "power3.inOut" },
            0.1
          )
          .to(root.current, { backgroundColor: "rgba(23,19,29,0)", duration: 0.5 }, 0.65)
          .add(() => {
            gsap.set(navLogo, { opacity: 1 });
            gsap.set(splashLogo, { autoAlpha: 0 });
          }, 1.0)
          .to(root.current, { autoAlpha: 0, duration: 0.28 }, 1.05);
      }

      function finish() {
        document.body.style.overflow = prevOverflow;
        markReady();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }

      return () => {
        document.body.style.overflow = prevOverflow;
      };
    },
    { scope: root }
  );

  if (ready) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-plum"
      aria-busy="true"
      aria-label="Loading"
    >
      <style>{`
        @keyframes splash-rise {
          0% {
            transform: translate3d(0, 0, 0) scale(0.9);
            opacity: 0;
          }
          6% {
            opacity: 1;
          }
          88% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--drift, 0px), calc(-100vh - 140px), 0) scale(1);
            opacity: 0;
          }
        }
      `}</style>

      <div
        ref={foam}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {BUBBLES.map((b, i) => {
          const style = {
            left: b.left,
            bottom: `-${Math.round(b.size * 0.3)}px`,
            width: b.size,
            height: b.size,
            opacity: b.opacity,
            ["--drift" as string]: `${b.drift}px`,
            animationName: "splash-rise",
            animationDuration: `${b.duration}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            // Negative delay = already mid-rise on first paint
            animationDelay: `${-(b.phase * b.duration)}s`,
            animationFillMode: "both",
          } as CSSProperties;

          return (
            <span key={i} className="absolute will-change-transform" style={style}>
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: `
                    radial-gradient(circle at 30% 28%,
                      rgba(255,255,255,0.98) 0%,
                      rgba(255,255,255,0.5) 12%,
                      rgba(190,230,255,0.22) 36%,
                      rgba(255,170,210,0.14) 54%,
                      rgba(160,210,255,0.28) 70%,
                      rgba(255,255,255,0.55) 88%,
                      rgba(255,255,255,0.25) 100%)
                  `,
                  boxShadow: `
                    inset 0 0 ${b.size * 0.22}px rgba(255,255,255,0.7),
                    inset ${-b.size * 0.1}px ${-b.size * 0.12}px ${b.size * 0.28}px rgba(100,170,255,0.4),
                    0 0 ${b.size * 0.22}px rgba(255,255,255,0.3),
                    0 ${b.size * 0.04}px ${b.size * 0.16}px rgba(0,0,0,0.18)
                  `,
                  border: "1px solid rgba(255,255,255,0.5)",
                }}
              />
              <span
                className="absolute rounded-full bg-white/95"
                style={{
                  width: `${Math.max(5, b.size * 0.2)}px`,
                  height: `${Math.max(4, b.size * 0.13)}px`,
                  top: `${b.size * 0.16}px`,
                  left: `${b.size * 0.2}px`,
                  filter: "blur(0.4px)",
                }}
              />
              <span
                className="absolute rounded-full bg-white/45"
                style={{
                  width: `${Math.max(3, b.size * 0.1)}px`,
                  height: `${Math.max(3, b.size * 0.1)}px`,
                  top: `${b.size * 0.32}px`,
                  left: `${b.size * 0.16}px`,
                }}
              />
            </span>
          );
        })}
      </div>

      <div ref={logo} className="relative z-10 will-change-transform">
        <Image
          src="/images/logo-knockout.png"
          alt={BUSINESS.name}
          width={958}
          height={326}
          priority
          className="h-16 w-auto sm:h-20 md:h-24"
        />
      </div>

      <p ref={label} className="relative z-10 mt-6 font-mono-meta text-cream/45">
        Laundry, handled right.
      </p>

      <div className="splash-load relative z-10 mt-10 flex w-[min(240px,60vw)] flex-col items-center gap-2">
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-cream/15">
          <div ref={bar} className="h-full w-0 rounded-full bg-ember" />
        </div>
        <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-cream/40 tabular">
          {pct}%
        </p>
      </div>
    </div>
  );
}
