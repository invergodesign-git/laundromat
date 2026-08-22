import { MessageSquareHeart, PenLine, Star } from "lucide-react";
import { BubbleAccent } from "@/components/concept/motion/Bubbles";
import { BUSINESS, SERVICE_PROMISE } from "@/lib/business";
import { AVERAGE_RATING, HAS_REVIEWS, LEAVE_REVIEW, REVIEWS } from "@/lib/reviews";
import { cn } from "@/lib/utils";

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      className={cn("flex gap-0.5", className)}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={cn(
            "h-4 w-4",
            n <= Math.round(rating)
              ? "fill-ember text-ember"
              : "fill-ink/10 text-ink/10"
          )}
        />
      ))}
    </span>
  );
}

/**
 * Reviews block. Shows the review wall once real reviews exist, and an honest
 * invitation while the list is still empty — no invented testimonials.
 */
export function ConceptReviews({ heading }: { heading?: string }) {
  return (
    <section
      id="reviews"
      className="relative isolate overflow-hidden bg-foam py-20 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[8%] top-[15%] h-[28rem] w-[28rem] rounded-full bg-blush/20 blur-[130px]"
      />
      <BubbleAccent size={96} className="right-[7%] top-16 opacity-60" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-mono-meta text-royal">Reviews</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-[-0.025em] text-ink">
              {heading ?? "What our customers say."}
            </h2>
          </div>
          {AVERAGE_RATING !== null && (
            <div className="rounded-3xl bg-white px-7 py-5 shadow-[0_20px_50px_-30px_rgba(20,18,41,0.5)]">
              <p className="tabular font-display text-[2.5rem] leading-none text-ink">
                {AVERAGE_RATING.toFixed(1)}
              </p>
              <Stars rating={AVERAGE_RATING} className="mt-2" />
              <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink/45">
                {REVIEWS.length} review{REVIEWS.length === 1 ? "" : "s"}
              </p>
            </div>
          )}
        </div>

        {HAS_REVIEWS ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.map((review) => (
              <figure
                key={`${review.name}-${review.date}`}
                className="flex flex-col rounded-[28px] bg-white p-7 ring-2 ring-inset ring-ink/8"
              >
                <Stars rating={review.rating} />
                <blockquote className="mt-5 flex-1 text-[1.0625rem] leading-relaxed text-ink/75">
                  {review.body}
                </blockquote>
                <figcaption className="mt-6 border-t border-ink/10 pt-5">
                  <p className="font-display text-[1.25rem] tracking-tight text-ink">
                    {review.name}
                  </p>
                  <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink/40">
                    {[review.location, review.source]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 lg:grid-cols-12">
            <div className="rounded-[32px] bg-white p-9 ring-2 ring-inset ring-aqua/45 sm:p-11 lg:col-span-7">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-aqua text-ink">
                <MessageSquareHeart className="h-7 w-7" strokeWidth={1.8} />
              </span>
              <h3 className="mt-6 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight tracking-tight text-ink">
                No reviews up here yet — and we would rather leave it honest
                than fill it with made-up ones.
              </h3>
              <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink/65">
                If we have washed for you, tell us how it went. Good or bad, it
                gets published here as you wrote it, and anything that went
                wrong gets put right first.
              </p>
              <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink/65">
                {SERVICE_PROMISE}
              </p>
            </div>

            <div className="flex flex-col justify-between rounded-[32px] bg-royal p-9 text-white sm:p-11 lg:col-span-5">
              <div>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
                  <PenLine className="h-7 w-7" strokeWidth={1.8} />
                </span>
                <h3 className="mt-6 font-display text-[1.75rem] leading-tight tracking-tight">
                  Be the first to review us.
                </h3>
                <p className="mt-4 text-[1.0625rem] leading-relaxed text-white/75">
                  {LEAVE_REVIEW.helper}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <a
                  href={LEAVE_REVIEW.href}
                  target={LEAVE_REVIEW.isExternal ? "_blank" : undefined}
                  rel={LEAVE_REVIEW.isExternal ? "noopener noreferrer" : undefined}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-7 font-mono text-[0.75rem] font-medium uppercase tracking-[0.14em] text-royal transition-colors hover:bg-foam"
                >
                  {LEAVE_REVIEW.label}
                </a>
                <a
                  href={BUSINESS.phoneHref}
                  className="inline-flex h-14 items-center justify-center rounded-full px-7 font-mono text-[0.75rem] font-medium uppercase tracking-[0.14em] text-white ring-1 ring-inset ring-white/35 transition-colors hover:ring-white/70"
                >
                  Or tell us by phone
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
