"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { EASE, gsap, prefersReducedMotion, SplitText } from "@/lib/gsap";

interface MaskLinesProps {
  children: ReactNode;
  className?: string;
  /** Delay before the reveal starts. */
  delay?: number;
  /** Stagger between lines. */
  stagger?: number;
  /** Trigger on mount rather than scroll. */
  immediate?: boolean;
}

/**
 * Reveals text line-by-line behind a mask using SplitText.
 * Falls back to an opacity fade when reduced-motion is preferred.
 */
export function MaskLines({
  children,
  className,
  delay = 0,
  stagger = 0.08,
  immediate = false,
}: MaskLinesProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }

      const split = SplitText.create(el, {
        type: "lines",
        linesClass: "mask-line",
        mask: "lines",
      });

      gsap.set(split.lines, { yPercent: 110 });

      const tween = {
        yPercent: 0,
        duration: 1.1,
        stagger,
        delay,
        ease: EASE.premium,
      };

      if (immediate) {
        gsap.to(split.lines, tween);
      } else {
        gsap.to(split.lines, {
          ...tween,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        });
      }

      return () => {
        split.revert();
      };
    },
    { scope: ref, dependencies: [delay, stagger, immediate] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
