"use client";

import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Magnetic } from "./Magnetic";
import { cn } from "@/lib/utils";

type Variant = "ember" | "outline" | "ghost";
type Size = "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  ember: "bg-ember text-plum hover:brightness-105",
  outline: "bg-transparent text-cream ring-1 ring-inset ring-cream/30 hover:ring-cream/60",
  ghost: "bg-transparent text-cream hover:text-ember",
};

const SIZES: Record<Size, string> = {
  md: "h-11 px-5 text-[0.8125rem]",
  lg: "h-14 px-7 text-[0.875rem]",
};

interface SlideFillProps extends Omit<ComponentProps<"a">, "className" | "children"> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  magnetic?: boolean;
}

/**
 * Concept CTA: mono label, optional arrow travel on hover, optional magnetic wrap.
 */
export function SlideFill({
  children,
  variant = "ember",
  size = "md",
  arrow = false,
  magnetic = true,
  className,
  ...props
}: SlideFillProps) {
  const inner = (
    <a
      className={cn(
        "group/sf relative inline-flex select-none items-center justify-center gap-3 overflow-hidden rounded-full font-mono font-medium uppercase tracking-[0.14em] transition-all duration-300",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {arrow && (
        <ArrowUpRight
          className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover/sf:translate-x-0.5 group-hover/sf:-translate-y-0.5"
          strokeWidth={2}
        />
      )}
      {variant === "ember" && (
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-left scale-x-0 bg-white/15 transition-transform duration-500 ease-out group-hover/sf:scale-x-100"
        />
      )}
    </a>
  );

  if (!magnetic) return inner;
  return <Magnetic strength={10}>{inner}</Magnetic>;
}

interface SlideFillButtonProps extends Omit<ComponentProps<"button">, "className" | "children"> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  magnetic?: boolean;
}

export function SlideFillButton({
  children,
  variant = "ember",
  size = "md",
  arrow = false,
  magnetic = true,
  className,
  ...props
}: SlideFillButtonProps) {
  const inner = (
    <button
      className={cn(
        "group/sf relative inline-flex select-none items-center justify-center gap-3 overflow-hidden rounded-full font-mono font-medium uppercase tracking-[0.14em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-40",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {arrow && (
        <ArrowUpRight
          className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover/sf:translate-x-0.5 group-hover/sf:-translate-y-0.5"
          strokeWidth={2}
        />
      )}
      {variant === "ember" && (
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-left scale-x-0 bg-white/15 transition-transform duration-500 ease-out group-hover/sf:scale-x-100"
        />
      )}
    </button>
  );

  if (!magnetic) return inner;
  return <Magnetic strength={10}>{inner}</Magnetic>;
}
