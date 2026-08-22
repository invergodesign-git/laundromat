"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { BUSINESS, PROCESS } from "@/lib/business";
import {
  DELIVERY_RATE_PER_MILE,
  LOWEST_RATE_PER_LB,
  MIN_ORDER_LBS,
  TURNAROUND_TIERS,
} from "@/lib/pricing";
import { cn, formatCurrency } from "@/lib/utils";

const fastest = TURNAROUND_TIERS[0];

const FAQS = [
  {
    q: "What does it cost?",
    a: `Wash & fold starts at ${formatCurrency(
      LOWEST_RATE_PER_LB
    )} per pound and the rate rises the faster you need it back. Delivery is a flat ${formatCurrency(
      DELIVERY_RATE_PER_MILE
    )} per mile, so you can check the number yourself before you book.`,
  },
  {
    q: "Is there a minimum order?",
    a: `Yes — ${MIN_ORDER_LBS} lbs. If your bag comes in under that we may issue a store credit for the difference against your next order, so you are not paying for pounds you never used.`,
  },
  {
    q: "How fast can I get it back?",
    a: `${fastest.label} returns your laundry within 12 hours at ${formatCurrency(
      fastest.ratePerLb
    )} per pound. One, two and three day options cost progressively less, and a monthly subscription is cheaper again if you are happy with a fixed weekly slot.`,
  },
  {
    q: "What detergent do you use?",
    a: PROCESS.body,
  },
  {
    q: "Which areas do you cover?",
    a: `We pick up and deliver across ${BUSINESS.servingArea} and the nearby neighborhoods. Not sure you're in range? Call — it's a quick answer.`,
  },
  {
    q: "How do I book?",
    a: "Check your price with the calculator, then call us to arrange pickup. Nothing is charged on this website, and you're not signing up to anything.",
  },
  {
    q: "Is this veteran owned?",
    a: `Yes. ${BUSINESS.name} is a veteran owned local business — not a franchise with a call centre.`,
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
                  isOpen
                    ? "glass"
                    : "border border-transparent border-b-ink/10 hover:bg-white/45"
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
