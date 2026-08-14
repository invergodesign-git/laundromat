"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Animates a number counting up/down to `value` by tweening a plain object
 * and writing directly to the DOM node — avoids a React re-render on every
 * animation frame, which keeps this cheap even with several counters
 * animating at once.
 */
export function AnimatedCounter({
  value,
  duration = 1.1,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const currentValue = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      currentValue.current = value;
      el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      return;
    }

    const proxy = { val: currentValue.current };
    const tween = gsap.to(proxy, {
      val: value,
      duration,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = `${prefix}${proxy.val.toFixed(decimals)}${suffix}`;
      },
      onComplete: () => {
        currentValue.current = value;
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, duration, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {(0).toFixed(decimals)}
      {suffix}
    </span>
  );
}
