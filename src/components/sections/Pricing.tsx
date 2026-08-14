"use client";

import { useState, type FormEvent } from "react";
import { Loader2, MapPin, Phone } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Reveal } from "@/components/ui/motion";
import { DistanceScale } from "@/components/pricing/DistanceScale";
import { getDistanceFromLaundry } from "@/lib/distance";
import { calculatePickupFee, calculateWashFoldCost, PRICING_CONFIG } from "@/lib/pricing";
import { BUSINESS } from "@/lib/business";
import { cn, formatCurrency, roundToCent } from "@/lib/utils";

const PRESETS = [10, 20, 30, 40];

type Status = "idle" | "loading" | "done" | "error";

export function Pricing() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weightLbs, setWeightLbs] = useState(20);
  const [custom, setCustom] = useState(false);

  const washFold = calculateWashFoldCost(weightLbs);
  const pickupFee = distanceMiles !== null ? calculatePickupFee(distanceMiles) : null;
  const total = pickupFee !== null ? roundToCent(washFold + pickupFee) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!address.trim() || status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      const result = await getDistanceFromLaundry(address);
      setDistanceMiles(result.distanceMiles);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <section id="pricing" className="bg-mist py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <span className="eyebrow text-brand">Pricing</span>
          <h2 className="mt-3 text-[2.25rem] sm:text-5xl">Know your price before you book.</h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Wash &amp; fold is {formatCurrency(PRICING_CONFIG.washFoldRatePerLb)} a pound. Pickup
            starts at {formatCurrency(PRICING_CONFIG.pickup.minFee)} close by and never goes above{" "}
            {formatCurrency(PRICING_CONFIG.pickup.maxFee)}, even at the edge of our area.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-10 grid overflow-hidden rounded-[32px] bg-white shadow-lift lg:mt-12 lg:grid-cols-12">
            {/* ---- Inputs ---- */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-9 lg:col-span-7 lg:p-11">
              <div>
                <label htmlFor="pickup-address" className="block text-[0.9375rem] font-bold">
                  Where are we picking up?
                </label>
                <div className="relative mt-3">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-soft" />
                  <input
                    id="pickup-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address, San Diego"
                    autoComplete="street-address"
                    className="h-14 w-full rounded-2xl border border-line bg-white pl-11 pr-4 text-base outline-none transition-colors placeholder:text-ink-soft/60 focus:border-brand"
                  />
                </div>
              </div>

              <div className="mt-7">
                <span className="block text-[0.9375rem] font-bold">
                  Roughly how much laundry?
                </span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRESETS.map((preset) => {
                    const active = !custom && weightLbs === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setCustom(false);
                          setWeightLbs(preset);
                        }}
                        className={cn(
                          "h-11 rounded-full px-5 text-[0.9375rem] font-bold transition-colors",
                          active
                            ? "bg-brand text-white"
                            : "bg-mist text-ink-soft hover:bg-brand-soft hover:text-brand"
                        )}
                      >
                        {preset} lb
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setCustom(true)}
                    className={cn(
                      "h-11 rounded-full px-5 text-[0.9375rem] font-bold transition-colors",
                      custom
                        ? "bg-brand text-white"
                        : "bg-mist text-ink-soft hover:bg-brand-soft hover:text-brand"
                    )}
                  >
                    Custom
                  </button>
                </div>

                {custom && (
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={weightLbs || ""}
                      onChange={(e) => setWeightLbs(Number(e.target.value))}
                      aria-label="Custom weight in pounds"
                      className="h-12 w-28 rounded-2xl border border-line px-4 text-base outline-none transition-colors focus:border-brand"
                    />
                    <span className="text-[0.9375rem] font-semibold text-ink-soft">pounds</span>
                  </div>
                )}

                <p className="mt-3 text-[0.8125rem] text-ink-soft">
                  A full kitchen bin is usually around 20 lb. We weigh it properly at the shop.
                </p>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="mt-8 w-full sm:w-auto"
                disabled={status === "loading" || !address.trim()}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking distance
                  </>
                ) : (
                  "Calculate my price"
                )}
              </Button>

              {status === "error" && error && (
                <p className="mt-4 text-[0.9375rem] font-semibold text-sun">{error}</p>
              )}

              <div className="mt-9 border-t border-line pt-7">
                <DistanceScale distanceMiles={status === "done" ? distanceMiles : null} />
              </div>
            </form>

            {/* ---- Result ---- */}
            <div className="relative bg-brand-deep p-6 text-white sm:p-9 lg:col-span-5 lg:p-11">
              <span className="text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-white/60">
                Your estimate
              </span>

              <div className="mt-4 flex items-end gap-2">
                <span className="text-[3.25rem] font-extrabold leading-none tracking-tight tabular text-sun sm:text-6xl">
                  {total !== null ? (
                    <AnimatedCounter value={total} decimals={2} prefix="$" />
                  ) : (
                    <span className="text-white/25">$—</span>
                  )}
                </span>
              </div>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/60">
                {total !== null
                  ? "Estimated total for this order, including pickup and delivery."
                  : "Enter your address to see your total, including pickup and delivery."}
              </p>

              <dl className="mt-8 flex flex-col gap-4 border-t border-white/15 pt-6">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[0.9375rem] text-white/70">
                    Wash &amp; fold · {weightLbs || 0} lb
                  </dt>
                  <dd className="text-base font-bold tabular">
                    <AnimatedCounter value={washFold} decimals={2} prefix="$" />
                  </dd>
                </div>

                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[0.9375rem] text-white/70">Pickup &amp; delivery</dt>
                  <dd className="text-base font-bold tabular">
                    {pickupFee !== null ? (
                      <AnimatedCounter value={pickupFee} decimals={2} prefix="$" />
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </dd>
                </div>

                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[0.9375rem] text-white/70">Distance from our shop</dt>
                  <dd className="text-base font-bold tabular">
                    {distanceMiles !== null && status === "done" ? (
                      <>
                        <AnimatedCounter value={distanceMiles} decimals={1} /> mi
                      </>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </dd>
                </div>
              </dl>

              <ButtonLink
                href={BUSINESS.phoneHref}
                variant={total !== null ? "accent" : "white"}
                size="lg"
                arrow
                className="mt-8 w-full justify-between"
              >
                <Phone className="h-4 w-4" />
                Book with {BUSINESS.ownerFirstName}
              </ButtonLink>

              <p className="mt-5 text-[0.8125rem] leading-relaxed text-white/55">
                Distances are worked out by a demo estimator rather than a live mapping service,
                and {formatCurrency(PRICING_CONFIG.washFoldRatePerLb)} per pound is billed on the
                real weight of your order. Nothing is charged on this page.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
