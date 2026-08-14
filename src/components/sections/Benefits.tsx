import { Clock, HandCoins, MapPin, Shirt } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { PRICING_CONFIG } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

const ITEMS = [
  {
    icon: HandCoins,
    title: "One honest rate",
    body: `${formatCurrency(
      PRICING_CONFIG.washFoldRatePerLb
    )} per pound on every order, billed on the real weight. No surprise add-ons.`,
  },
  {
    icon: MapPin,
    title: "Pickup by distance",
    body: `From ${formatCurrency(PRICING_CONFIG.pickup.minFee)} nearby up to ${formatCurrency(
      PRICING_CONFIG.pickup.maxFee
    )} at the edge of our area — you always see how it was worked out.`,
  },
  {
    icon: Clock,
    title: "Folded by hand",
    body: "Your order is washed, dried and folded the day it's ready, not left sitting in a bin.",
  },
  {
    icon: Shirt,
    title: "Sorted properly",
    body: "Separated by fabric and washed at the right temperature, the way you'd do it at home.",
  },
];

export function Benefits() {
  return (
    <section className="bg-mist py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal stagger={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className="rounded-[28px] bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift lg:p-7"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                <item.icon className="h-[22px] w-[22px]" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">{item.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
