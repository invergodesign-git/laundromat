import { Plus } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { BUSINESS } from "@/lib/business";
import { PRICING_CONFIG } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

const { minFee, maxFee, minDistanceMiles, maxDistanceMiles } = PRICING_CONFIG.pickup;

const FAQS = [
  {
    q: "What does it cost?",
    a: `Wash & fold is ${formatCurrency(
      PRICING_CONFIG.washFoldRatePerLb
    )} per pound, billed on the real weight of your order. If we're collecting, pickup and delivery is between ${formatCurrency(
      minFee
    )} and ${formatCurrency(maxFee)} depending on how far you are from the shop.`,
  },
  {
    q: "How is the pickup fee worked out?",
    a: `Anything within ${minDistanceMiles} miles of the shop is a flat ${formatCurrency(
      minFee
    )}. Past that it climbs evenly with distance and stops at ${formatCurrency(
      maxFee
    )} at ${maxDistanceMiles} miles, so it can never run away from you.`,
  },
  {
    q: "How long does it take?",
    a: `Orders are sorted, washed, dried and folded by hand rather than rushed through. ${BUSINESS.ownerFirstName} will confirm the turnaround for your order when you book, so you're not guessing.`,
  },
  {
    q: "Which areas do you cover?",
    a: `We're based at ${BUSINESS.address}, and serve ${BUSINESS.servingArea} and the surrounding neighbourhoods. If you're not sure whether you're in range, call and ask — it's a quick answer.`,
  },
  {
    q: "How do I book?",
    a: `Use the calculator to see your price, then call ${BUSINESS.ownerFirstName} to arrange the pickup. Nothing is charged on this website, and you're not signing up to anything.`,
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-mist py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <span className="eyebrow text-brand">Questions</span>
          <h2 className="mt-3 text-[2.25rem] sm:text-5xl">Straight answers.</h2>
        </Reveal>

        <Reveal delay={0.08} stagger={0.06} className="mt-10 flex flex-col gap-3">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-[22px] bg-white px-6 py-5 shadow-card transition-shadow duration-300 hover:shadow-lift [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                <span className="text-[1.0625rem] font-extrabold tracking-tight">{faq.q}</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition-transform duration-300 group-open:rotate-45">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
                {faq.a}
              </p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
