"use client";

import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Magnetic } from "./Magnetic";
import { cn } from "@/lib/utils";

type Variant = "primary" | "glass" | "ghost";
type Size = "md" | "lg";

/**
 * Violet carries the primary action — on a light page it is the only fill
 * with enough contrast for uppercase label text. Citrus stays reserved for
 * prices so the two never compete.
 */
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-royal text-white shadow-[0_14px_34px_-14px_rgba(69,54,214,0.75)] hover:bg-rich hover:shadow-[0_18px_40px_-14px_rgba(69,54,214,0.85)]",
  glass:
    "glass text-ink hover:bg-white/85",
  ghost: "bg-transparent text-ink/70 hover:text-royal",
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
  variant = "primary",
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
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-left scale-x-0 bg-white/20 transition-transform duration-500 ease-out group-hover/sf:scale-x-100"
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
  variant = "primary",
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
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-left scale-x-0 bg-white/20 transition-transform duration-500 ease-out group-hover/sf:scale-x-100"
        />
      )}
    </button>
  );

  if (!magnetic) return inner;
  return <Magnetic strength={10}>{inner}</Magnetic>;
}
