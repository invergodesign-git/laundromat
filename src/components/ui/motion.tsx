"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Distance travelled on entry. Kept small — this should be felt, not watched. */
  y?: number;
  /** Stagger direct children instead of animating the wrapper as one block. */
  stagger?: number;
}

/**
 * The site's only entrance animation: a short fade and rise, fired once when
 * the element first reaches the viewport. An IntersectionObserver is used
 * rather than ScrollTrigger because this never needs to be scroll-linked, and
 * an observer is immune to layout recalculation as images load in.
 */
export function Reveal({ children, className, delay = 0, y = 18, stagger }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger ? Array.from(el.children) : [el];
    if (!targets.length) return;

    if (prefersReducedMotion()) {
      gsap.set(targets, { autoAlpha: 1, y: 0 });
      return;
    }

    gsap.set(targets, { autoAlpha: 0, y });

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        gsap.to(targets, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          delay,
          stagger: stagger ?? 0,
          ease: "power2.out",
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      gsap.killTweensOf(targets);
    };
  }, [delay, y, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
