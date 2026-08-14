"use client";

import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** Max pixel travel toward the pointer. Keep small — this should be felt. */
  strength?: number;
}

/**
 * Gentle magnetic pull toward the pointer. Disabled under reduced-motion.
 */
export function Magnetic({ children, className, strength = 14 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, {
      x: (x / rect.width) * strength,
      y: (y / rect.height) * strength,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <div ref={ref} className={cn("inline-flex will-change-transform", className)} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}
