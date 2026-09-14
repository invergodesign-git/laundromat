import type { Metadata } from "next";
import { Clock, ShieldCheck, Truck } from "lucide-react";
import { BookingForm } from "@/components/booking/BookingForm";
import { Highlight, PageHero } from "@/components/site/PageHero";
import { PageShell } from "@/components/site/PageShell";
import { HOURS } from "@/lib/business";
import {
  DELIVERY_FEE_CAP,
  DELIVERY_RATE_PER_MILE,
  MIN_ORDER_LBS,
} from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

/**
 * Rendered per request rather than at build time: the form's earliest
 * selectable pickup depends on the current time in the shop's timezone, and a
 * statically baked page would offer a day that has already gone.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a pickup — California Laundromat",
  description: `Book a laundry pickup in one go. Real delivery pricing at ${formatCurrency(
    DELIVERY_RATE_PER_MILE
  )} per mile, capped at ${formatCurrency(
    DELIVERY_FEE_CAP
  )}, and no payment taken until we have weighed your bag.`,
};

const REASSURANCE = [
  {
    icon: Clock,
    title: "Book any hour",
    body: `${HOURS.booking.value}. Pick the window that suits you and we will be there.`,
  },
  {
    icon: Truck,
    title: "Delivery you can check",
    body: `${formatCurrency(
      DELIVERY_RATE_PER_MILE
    )} a mile on the real driving distance, never more than ${formatCurrency(
      DELIVERY_FEE_CAP
    )}.`,
  },
  {
    icon: ShieldCheck,
    title: "Pay when you book",
    body: `Your card is charged the estimated total at booking. If the bag weighs differently at pickup, we settle the difference. Orders start at the ${MIN_ORDER_LBS} lb minimum.`,
  },
];

export default function BookPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Book a pickup"
        accent="aqua"
        title={
          <>
            Tell us once.
            <br />
            We&rsquo;ll take it <Highlight accent="aqua">from there.</Highlight>
          </>
        }
        lead="Six short steps — address, timing, speed, bag, your details, then pay securely. Your estimate is charged when the booking is confirmed."
      />

      <section className="bg-foam-deep">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-10">
          <div className="grid gap-5 sm:grid-cols-3">
            {REASSURANCE.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-[24px] bg-white p-6 ring-1 ring-inset ring-ink/8"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-royal/10 text-royal">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <p className="mt-4 text-[1.0625rem] font-semibold tracking-tight text-ink">
                  {title}
                </p>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink/65">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foam">
        <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8 lg:px-10">
          <BookingForm />
        </div>
      </section>
    </PageShell>
  );
}
