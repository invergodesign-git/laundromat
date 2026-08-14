import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "white" | "glass";
type Size = "md" | "lg";

interface Spec {
  base: string;
  /** Circular badge that sits inside the pill on the right. */
  badge: string;
}

const VARIANTS: Record<Variant, Spec> = {
  primary: {
    base: "bg-brand text-white hover:bg-brand-dark disabled:bg-brand/40",
    badge: "bg-white text-brand",
  },
  accent: {
    base: "bg-sun text-white hover:brightness-95 disabled:bg-sun/40",
    badge: "bg-white text-sun",
  },
  outline: {
    base: "bg-white text-ink ring-1 ring-inset ring-line hover:ring-brand-line hover:bg-mist",
    badge: "bg-brand text-white",
  },
  white: {
    base: "bg-white text-ink hover:bg-brand-soft disabled:bg-white/60",
    badge: "bg-brand text-white",
  },
  // For use over photography.
  glass: {
    base: "bg-white/12 text-white ring-1 ring-inset ring-white/30 backdrop-blur-md hover:bg-white/20",
    badge: "bg-white text-ink",
  },
};

/** Arrow pills need a tighter right edge so the badge sits flush inside them. */
const SIZES: Record<Size, { plain: string; arrow: string; badge: string }> = {
  md: {
    plain: "h-11 px-5 text-[0.9375rem]",
    arrow: "h-11 pl-5 pr-1.5 text-[0.9375rem]",
    badge: "h-8 w-8",
  },
  lg: {
    plain: "h-14 px-7 text-base",
    arrow: "h-14 pl-7 pr-2 text-base",
    badge: "h-10 w-10",
  },
};

const BASE =
  "group/btn inline-flex select-none items-center justify-center gap-3 rounded-full font-bold shadow-card transition-all duration-200 hover:shadow-lift active:translate-y-px disabled:pointer-events-none disabled:shadow-none";

function content(children: ReactNode, arrow: boolean, variant: Variant, size: Size) {
  if (!arrow) return children;

  return (
    <>
      <span className="flex items-center gap-2">{children}</span>
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover/btn:rotate-45",
          VARIANTS[variant].badge,
          SIZES[size].badge
        )}
      >
        <ArrowUpRight className="h-[18px] w-[18px]" strokeWidth={2.5} />
      </span>
    </>
  );
}

interface Shared {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  /** Renders the circular arrow badge inside the pill. */
  arrow?: boolean;
  className?: string;
}

type ButtonProps = Shared & Omit<ComponentProps<"button">, "className" | "children">;

export function Button({
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        BASE,
        VARIANTS[variant].base,
        arrow ? SIZES[size].arrow : SIZES[size].plain,
        className
      )}
      {...props}
    >
      {content(children, arrow, variant, size)}
    </button>
  );
}

type ButtonLinkProps = Shared & Omit<ComponentProps<"a">, "className" | "children">;

export function ButtonLink({
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={cn(
        BASE,
        VARIANTS[variant].base,
        arrow ? SIZES[size].arrow : SIZES[size].plain,
        className
      )}
      {...props}
    >
      {content(children, arrow, variant, size)}
    </a>
  );
}
