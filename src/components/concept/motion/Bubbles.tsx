"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type BubbleSpec = {
  /** Horizontal position, % of container width. */
  left: number;
  size: number;
  /** Seconds for a full rise. */
  duration: number;
  /** Horizontal drift over the rise, px. */
  drift: number;
  opacity: number;
  /**
   * Fraction of the cycle already elapsed on first paint. Applied as a
   * negative animation-delay so the field is never empty when it mounts.
   */
  phase: number;
};

/**
 * Deterministic so server and client render identically — a random field
 * would hydrate-mismatch and flash.
 */
const FIELD: BubbleSpec[] = [
  { left: 3, size: 46, duration: 22, drift: 26, opacity: 0.85, phase: 0.32 },
  { left: 9, size: 88, duration: 28, drift: -18, opacity: 0.8, phase: 0.58 },
  { left: 15, size: 24, duration: 17, drift: 30, opacity: 0.9, phase: 0.12 },
  { left: 22, size: 122, duration: 33, drift: -14, opacity: 0.7, phase: 0.44 },
  { left: 30, size: 56, duration: 24, drift: 34, opacity: 0.85, phase: 0.72 },
  { left: 38, size: 34, duration: 19, drift: -22, opacity: 0.88, phase: 0.05 },
  { left: 45, size: 142, duration: 35, drift: 20, opacity: 0.66, phase: 0.26 },
  { left: 53, size: 30, duration: 18, drift: 16, opacity: 0.9, phase: 0.5 },
  { left: 60, size: 74, duration: 26, drift: -28, opacity: 0.82, phase: 0.16 },
  { left: 67, size: 42, duration: 21, drift: 22, opacity: 0.87, phase: 0.66 },
  { left: 74, size: 104, duration: 30, drift: -16, opacity: 0.74, phase: 0.38 },
  { left: 81, size: 28, duration: 18, drift: 26, opacity: 0.9, phase: 0.82 },
  { left: 87, size: 62, duration: 25, drift: 14, opacity: 0.84, phase: 0.22 },
  { left: 93, size: 36, duration: 20, drift: -20, opacity: 0.88, phase: 0.55 },
  { left: 97, size: 80, duration: 29, drift: -10, opacity: 0.76, phase: 0.9 },
];

interface BubblesProps {
  /** How many of the field to render, from the start. */
  count?: number;
  /** How far a bubble travels before it pops, as a CSS length. */
  rise?: string;
  /** Multiplier on every duration — lower is livelier. */
  speed?: number;
  className?: string;
}

/**
 * Rising soap bubbles. Pure CSS so it keeps drifting while the main thread
 * is busy with GSAP, and costs nothing when the tab is backgrounded.
 */
export function Bubbles({
  count = FIELD.length,
  rise = "-115vh",
  speed = 1,
  className,
}: BubblesProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {FIELD.slice(0, count).map((b, i) => {
        const duration = b.duration * speed;
        const style = {
          left: `${b.left}%`,
          bottom: `-${Math.round(b.size * 0.6)}px`,
          width: b.size,
          height: b.size,
          opacity: b.opacity,
          ["--drift" as string]: `${b.drift}px`,
          ["--rise" as string]: rise,
          animationName: "bubble-rise",
          animationDuration: `${duration}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDelay: `${-(b.phase * duration)}s`,
          animationFillMode: "both",
        } as CSSProperties;

        return <span key={i} className="bubble absolute will-change-transform" style={style} />;
      })}
    </div>
  );
}

/**
 * A single bubble that bobs in place — for decorating a card corner or
 * sitting behind a headline.
 */
export function BubbleAccent({
  size,
  className,
  duration = 7,
  bobX = 8,
  bobY = -16,
  style,
}: {
  size: number;
  className?: string;
  duration?: number;
  bobX?: number;
  bobY?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("bubble pointer-events-none absolute will-change-transform", className)}
      style={{
        width: size,
        height: size,
        ["--bob-x" as string]: `${bobX}px`,
        ["--bob-y" as string]: `${bobY}px`,
        animationName: "bubble-bob",
        animationDuration: `${duration}s`,
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        ...style,
      }}
    />
  );
}
