"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { useIntro } from "@/components/concept/IntroContext";
import { Bubbles } from "@/components/concept/motion/Bubbles";
import { EASE, gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { BUSINESS } from "@/lib/business";

/**
 * Splash — a washer full of soap. Bubbles are phase-shifted so the field is
 * already alive on first paint, then the logo flies into its navbar slot.
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
        duration: 2.6,
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
          .add(() => {
            gsap.set(navLogo, { opacity: 1 });
            gsap.set(splashLogo, { autoAlpha: 0 });
          }, 1.0)
          .to(root.current, { autoAlpha: 0, duration: 0.35 }, 1.02);
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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-foam"
      aria-busy="true"
      aria-label="Loading"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[10%] top-[-8%] h-[34rem] w-[34rem] rounded-full bg-aqua/25 blur-[120px]" />
        <div className="absolute right-[-12%] bottom-[-10%] h-[36rem] w-[36rem] rounded-full bg-rich/20 blur-[130px]" />
      </div>

      <div ref={foam} className="absolute inset-0">
        <Bubbles rise="-115vh" speed={0.55} />
      </div>

      <div ref={logo} className="relative z-10 will-change-transform">
        <Image
          src="/images/logo-knockout.png"
          alt={BUSINESS.name}
          width={958}
          height={326}
          priority
          className="h-20 w-auto sm:h-24 md:h-28"
        />
      </div>

      <p ref={label} className="relative z-10 mt-6 font-mono-meta text-ink/45">
        Laundry, handled right.
      </p>

      <div className="splash-load relative z-10 mt-10 flex w-[min(240px,60vw)] flex-col items-center gap-2">
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-ink/10">
          <div ref={bar} className="h-full w-0 rounded-full bg-royal" />
        </div>
        <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-ink/40 tabular">
          {pct}%
        </p>
      </div>
    </div>
  );
}
