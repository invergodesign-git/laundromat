import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/motion";
import { BUSINESS } from "@/lib/business";
import { PRICING_CONFIG } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

const SERVICE = [
  {
    label: "Wash & fold",
    value: `${formatCurrency(PRICING_CONFIG.washFoldRatePerLb)} per pound`,
  },
  {
    label: "Pickup & delivery",
    value: `${formatCurrency(PRICING_CONFIG.pickup.minFee)} – ${formatCurrency(
      PRICING_CONFIG.pickup.maxFee
    )}, by distance`,
  },
  { label: "Service area", value: `${BUSINESS.servingArea} and nearby` },
];

export function Footer() {
  return (
    <footer className="bg-white">
      {/* Closing call to action */}
      <div className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <Reveal>
          <div className="rounded-[36px] bg-brand-deep px-6 py-14 text-center text-white sm:px-12 sm:py-16">
            <h2 className="mx-auto max-w-2xl text-[2.25rem] sm:text-[2.75rem]">
              Ready to get your weekend back?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-white/70">
              Get your price in a few seconds, then call {BUSINESS.ownerFirstName} to set up
              the pickup.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="#pricing" variant="accent" size="lg" arrow>
                Get my price
              </ButtonLink>
              <ButtonLink href={BUSINESS.phoneHref} variant="white" size="lg">
                <Phone className="h-4 w-4 text-sun" />
                {BUSINESS.phoneDisplay}
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Details */}
      <div className="border-t border-line">
        <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <Image
                src="/images/logo-lockup.png"
                alt={BUSINESS.name}
                width={966}
                height={340}
                className="h-14 w-auto sm:h-16"
              />
              <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-ink-soft">
                Veteran owned wash &amp; fold, serving {BUSINESS.servingArea} with honest
                pricing and work you don&apos;t have to check.
              </p>
            </div>

            <div className="lg:col-span-3">
              <h3 className="text-[0.9375rem] font-extrabold">Visit or call</h3>
              <address className="mt-4 flex flex-col gap-3 not-italic text-[0.9375rem] text-ink-soft">
                <span className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  2575 Old Quarry Road
                  <br />
                  San Diego, CA
                </span>
                <a
                  href={BUSINESS.phoneHref}
                  className="flex items-center gap-2.5 font-bold text-ink transition-colors hover:text-brand"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand" />
                  {BUSINESS.phoneDisplay}
                </a>
              </address>
              <p className="mt-4 text-[0.8125rem] text-ink-soft">
                Opening hours to be confirmed by {BUSINESS.ownerFirstName}.
              </p>
            </div>

            <div className="lg:col-span-4">
              <h3 className="text-[0.9375rem] font-extrabold">Service &amp; pricing</h3>
              <dl className="mt-4 flex flex-col gap-3">
                {SERVICE.map((item) => (
                  <div key={item.label} className="flex justify-between gap-6 text-[0.9375rem]">
                    <dt className="text-ink-soft">{item.label}</dt>
                    <dd className="font-bold tabular">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.8125rem] text-ink-soft">
              © {new Date().getFullYear()} {BUSINESS.name} · Veteran owned · {BUSINESS.city}
            </p>
            <p className="max-w-xl text-[0.8125rem] leading-relaxed text-ink-soft sm:text-right">
              Prices shown are estimates. Pickup distances come from a demo estimator rather
              than a live mapping service, and no payment is collected on this site.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
