import { Phone } from "lucide-react";
import { BOOKING, ESTIMATOR } from "@/lib/booking";
import { BUSINESS } from "@/lib/business";
import { cn } from "@/lib/utils";

/**
 * Standard action pair: call, plus either the estimator or booking.
 */
export function CtaRow({
  className,
  bookLabel = "Estimator",
  bookHref = ESTIMATOR.href,
}: {
  className?: string;
  bookLabel?: string;
  /** Defaults to the price calculator. Pass BOOKING.href for direct book. */
  bookHref?: string;
}) {
  const isExternalBook = bookHref === BOOKING.href && BOOKING.isExternal;

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
      <a
        href={BUSINESS.phoneHref}
        className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-ember px-7 text-white shadow-[0_18px_40px_-16px_rgba(255,106,43,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-ember/90"
      >
        <Phone className="h-5 w-5 shrink-0" />
        <span className="flex flex-col items-start leading-none">
          <span className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.16em] text-white/80">
            Call now
          </span>
          <span className="mt-1 text-[1.0625rem] font-bold tracking-tight">
            {BUSINESS.phoneDisplay}
          </span>
        </span>
      </a>
      <a
        href={bookHref}
        target={isExternalBook ? BOOKING.target : undefined}
        rel={isExternalBook ? BOOKING.rel : undefined}
        className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-7 font-mono text-[0.75rem] font-medium uppercase tracking-[0.14em] text-ink ring-1 ring-inset ring-ink/10 transition-colors hover:bg-white/70"
      >
        {bookLabel}
      </a>
    </div>
  );
}
