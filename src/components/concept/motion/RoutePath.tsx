"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin, EASE, gsap, MotionPathPlugin, prefersReducedMotion } from "@/lib/gsap";

interface RoutePathProps {
  /** Unique id for the path element. */
  pathId: string;
  /** SVG path `d` attribute. */
  d: string;
  /** Whether to start drawing immediately (or wait for a trigger from outside). */
  active?: boolean;
  /** Optional traveller element rendered at the path start and moved along it. */
  traveller?: ReactNode;
  className?: string;
  stroke?: string;
  strokeWidth?: number;
  viewBox?: string;
  duration?: number;
}

/**
 * Draws an SVG route with DrawSVGPlugin and optionally moves a traveller
 * along the same path with MotionPathPlugin.
 */
export function RoutePath({
  pathId,
  d,
  active = true,
  traveller,
  className,
  stroke = "currentColor",
  strokeWidth = 2,
  viewBox = "0 0 800 400",
  duration = 1.6,
}: RoutePathProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const travellerRef = useRef<SVGGElement>(null);

  useGSAP(
    () => {
      const path = svgRef.current?.querySelector(`#${pathId}`) as SVGPathElement | null;
      if (!path) return;

      if (prefersReducedMotion()) {
        gsap.set(path, { drawSVG: "100%" });
        return;
      }

      gsap.set(path, { drawSVG: "0%" });

      if (!active) return;

      const tl = gsap.timeline();
      tl.to(path, { drawSVG: "100%", duration, ease: EASE.softInOut });

      if (travellerRef.current) {
        tl.to(
          travellerRef.current,
          {
            motionPath: {
              path,
              align: path,
              alignOrigin: [0.5, 0.5],
              autoRotate: true,
            },
            duration,
            ease: EASE.softInOut,
          },
          0
        );
      }
    },
    { dependencies: [active, pathId, d, duration], scope: svgRef }
  );

  // Ensure plugins are referenced so the tree-shaker keeps them.
  void DrawSVGPlugin;
  void MotionPathPlugin;

  return (
    <svg ref={svgRef} viewBox={viewBox} className={className} fill="none" aria-hidden="true">
      <path d={d} stroke={stroke} strokeWidth={strokeWidth} strokeOpacity={0.18} />
      <path id={pathId} d={d} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      {traveller && (
        <g ref={travellerRef}>
          {traveller}
        </g>
      )}
    </svg>
  );
}
