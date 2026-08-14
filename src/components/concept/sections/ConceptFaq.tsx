"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { BUSINESS } from "@/lib/business";
import { PRICING_CONFIG } from "@/lib/pricing";
import { cn, formatCurrency } from "@/lib/utils";

const { minFee, maxFee, minDistanceMiles, maxDistanceMiles } = PRICING_CONFIG.pickup;

const FAQS = [
  {
    q: "What does it cost?",
    a: `Wash & fold is ${formatCurrency(
      PRICING_CONFIG.washFoldRatePerLb
    )} per pound, billed on the real weight of your order. Pickup and delivery runs from ${formatCurrency(
      minFee
    )} to ${formatCurrency(maxFee)} based on how far you are from the shop.`,
  },
  {
    q: "How is the pickup fee worked out?",
    a: `Within ${minDistanceMiles} miles of the shop, pickup is a flat ${formatCurrency(
      minFee
    )}. Past that it climbs evenly with distance and tops out at ${formatCurrency(
      maxFee
    )} at ${maxDistanceMiles} miles — so it never runs away from you.`,
  },
  {
    q: "How long does it take?",
    a: `Orders are sorted, washed, dried, and folded by hand — not rushed. ${BUSINESS.ownerFirstName} confirms turnaround when you book, so you're never guessing.`,
  },
  {
    q: "Which areas do you cover?",
    a: `We're based at ${BUSINESS.address}, serving ${BUSINESS.servingArea} and nearby neighborhoods. Not sure you're in range? Call — it's a quick answer.`,
  },
  {
    q: "How do I book?",
    a: `Check your price with the calculator, then call ${BUSINESS.ownerFirstName} to arrange pickup. Nothing is charged on this website, and you're not signing up to anything.`,
  },
  {
    q: "Is this veteran owned?",
    a: `Yes. ${BUSINESS.name} is owned and run by ${BUSINESS.ownerFirstName} — a local shop, not a franchise.`,
  },
] as const;

/**
 * Client-ready FAQ — honest answers only, concept visual language.
 */
export function ConceptFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden bg-foam py-20 sm:py-24 lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[10%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-rich/15 blur-[130px]"
      />
      <div className="relative mx-auto max-w-[900px] px-5 sm:px-8 lg:px-10">
        <p className="font-mono-meta text-royal">FAQ</p>
        <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.98] tracking-[-0.02em] text-ink">
          Straight answers.
        </h2>
        <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-ink/60">
          No fine print games — just what you need before you book.
        </p>

        <div className="mt-10 flex flex-col gap-2">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.q}
                className={cn(
                  "rounded-2xl px-5 transition-colors duration-300 sm:px-6",
                  isOpen ? "glass" : "border border-transparent hover:bg-white/45"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-[1.0625rem] font-medium tracking-tight text-ink sm:text-lg">
                    {faq.q}
                  </span>
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink ring-1 ring-inset ring-ink/15 transition-transform duration-300",
                      isOpen && "rotate-45 bg-royal text-white ring-royal"
                    )}
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 pr-12 text-[0.9375rem] leading-relaxed text-ink/65">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
