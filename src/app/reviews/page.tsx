import type { Metadata } from "next";
import { Check } from "lucide-react";
import { ConceptReviews } from "@/components/concept/sections/ConceptReviews";
import { Highlight, PageHero } from "@/components/site/PageHero";
import { PageShell } from "@/components/site/PageShell";
import { SERVICE_PROMISE } from "@/lib/business";
import { LEAVE_REVIEW } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Reviews — California Laundromat",
  description:
    "Read what customers say about our wash & fold pickup and delivery, and leave a review of your own.",
};

const WHAT_HELPS = [
  "Which service you used — wash & fold, bedding, shoes, towels",
  "How the turnaround compared to what we promised",
  "Whether anything went wrong, and how we handled it",
  "Anything you would want a first-time customer to know",
];

export default function ReviewsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Reviews"
        accent="blush"
        title={
          <>
            Tell us how we
            <br />
            actually <Highlight accent="blush">did.</Highlight>
          </>
        }
        lead={SERVICE_PROMISE}
      >
        <a
          href={LEAVE_REVIEW.href}
          target={LEAVE_REVIEW.isExternal ? "_blank" : undefined}
          rel={LEAVE_REVIEW.isExternal ? "noopener noreferrer" : undefined}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-royal px-8 font-mono text-[0.75rem] font-medium uppercase tracking-[0.14em] text-white shadow-[0_18px_40px_-16px_rgba(69,54,214,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich"
        >
          {LEAVE_REVIEW.label}
        </a>
      </PageHero>

      <ConceptReviews heading="Straight from customers." />

      <section className="bg-foam-deep">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-12 lg:gap-16 lg:px-10">
          <div className="lg:col-span-5">
            <p className="font-mono-meta text-royal">Writing one</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1] tracking-[-0.025em] text-ink">
              What makes a review genuinely useful.
            </h2>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink/65">
              A star rating on its own does not tell the next person much. If
              you have thirty seconds, these are the details that actually help
              somebody decide.
            </p>
          </div>

          <div className="lg:col-span-7">
            <ul className="grid gap-4 sm:grid-cols-2">
              {WHAT_HELPS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-3xl bg-white p-6 text-[1.0625rem] leading-snug text-ink/75"
                >
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mint text-ink">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
