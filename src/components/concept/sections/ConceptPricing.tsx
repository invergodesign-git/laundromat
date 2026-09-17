"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Navigation, Phone, Plus } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { AddressAutocomplete } from "@/components/concept/AddressAutocomplete";
import { Bubbles } from "@/components/concept/motion/Bubbles";
import { MaskLines } from "@/components/concept/motion/MaskLines";
import { DrawSVGPlugin, EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import { fetchDistanceMiles } from "@/lib/geo/client";
import { GeoError, type AddressSuggestion } from "@/lib/geo/types";
import {
  ADD_ONS,
  calculateEstimate,
  DEFAULT_TIER_ID,
  DELIVERY_FEE_CAP,
  DELIVERY_RATE_PER_MILE,
  isAddOnId,
  isDeliveryCapped,
  isTurnaroundTierId,
  isWithinServiceArea,
  LOWEST_RATE_PER_LB,
  MAX_SERVICE_RADIUS_MILES,
  MIN_ORDER_LBS,
  TURNAROUND_TIERS,
  type AddOnId,
  type TurnaroundTierId,
} from "@/lib/pricing";
import { BUSINESS } from "@/lib/business";
import { BOOKING } from "@/lib/booking";
import { saveEstimateDraft } from "@/lib/orders/estimate-draft";
import { cn, formatCurrency } from "@/lib/utils";

type Status = "idle" | "loading" | "done" | "error";

const WEIGHTS = [24, 32, 40, 60] as const;

/**
 * Interactive delivery pricing.
 *
 * Every number rendered here comes from `lib/pricing.ts` — the tier rates, the
 * 24 lb minimum and the per-mile delivery rate. The mileage itself is a real
 * driving distance measured server-side from a picked address; if that lookup
 * is unavailable the calculator says so and points people at the phone rather
 * than showing a price built on a guess.
 */
export function ConceptPricing() {
  const root = useRef<HTMLElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const lookup = useRef<AbortController | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weightLbs, setWeightLbs] = useState<number>(MIN_ORDER_LBS);
  const [tierId, setTierId] = useState<string>(DEFAULT_TIER_ID);
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] =
    useState<AddressSuggestion | null>(null);

  const outOfArea =
    status === "done" &&
    distanceMiles !== null &&
    !isWithinServiceArea(distanceMiles);
  const hasDistance =
    status === "done" && distanceMiles !== null && !outOfArea;

  const capped = hasDistance && isDeliveryCapped(distanceMiles);

  const estimate = calculateEstimate({
    weightLbs,
    distanceMiles: hasDistance ? distanceMiles : 0,
    tierId,
    addOnIds,
  });

  const toggleAddOn = (id: string) =>
    setAddOnIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );

  const handleSelect = useCallback(async (suggestion: AddressSuggestion) => {
    lookup.current?.abort();
    const controller = new AbortController();
    lookup.current = controller;

    setSelectedAddress(suggestion);
    setStatus("loading");
    setError(null);
    setDistanceMiles(null);

    try {
      const miles = await fetchDistanceMiles(suggestion, controller.signal);
      if (controller.signal.aborted) return;
      setDistanceMiles(miles);
      setStatus("done");
    } catch (err) {
      if (controller.signal.aborted) return;
      setStatus("error");
      setError(
        err instanceof GeoError
          ? err.message
          : "We could not measure that address."
      );
    }
  }, []);

  const handleClear = useCallback(() => {
    lookup.current?.abort();
    setSelectedAddress(null);
    setStatus("idle");
    setDistanceMiles(null);
    setError(null);
  }, []);

  const goToBooking = () => {
    const safeTier = isTurnaroundTierId(tierId) ? tierId : DEFAULT_TIER_ID;
    const safeAddOns = addOnIds.filter(isAddOnId) as AddOnId[];
    saveEstimateDraft({
      tierId: safeTier as TurnaroundTierId,
      weightLbs,
      addOnIds: safeAddOns,
      address: selectedAddress,
      distanceMiles: hasDistance ? distanceMiles : null,
    });
    window.location.href = BOOKING.href;
  };

  const handleUnavailable = useCallback((message: string) => {
    setStatus("error");
    setError(message);
  }, []);

  useGSAP(
    () => {
      void DrawSVGPlugin;
      if (!routeRef.current) return;

      if (!hasDistance || prefersReducedMotion()) {
        gsap.set(routeRef.current, { drawSVG: hasDistance ? "100%" : "0%" });
        return;
      }

      gsap.fromTo(
        routeRef.current,
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 1.35, ease: EASE.softInOut }
      );
    },
    { dependencies: [hasDistance, distanceMiles], scope: root }
  );

  return (
    <section
      id="pricing"
      ref={root}
      className="relative overflow-hidden bg-foam py-20 sm:py-24 lg:py-28"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-[12%] top-[12%] h-[36rem] w-[36rem] rounded-full bg-rich/20 blur-[130px]" />
        <div className="absolute -left-[10%] bottom-[4%] h-[30rem] w-[30rem] rounded-full bg-aqua/22 blur-[120px]" />
      </div>
      <Bubbles count={6} rise="-90vh" speed={1.8} className="opacity-40" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-meta text-royal">Pricing</p>
            <MaskLines className="mt-3 max-w-3xl">
              <h2 className="font-display text-[clamp(2rem,5vw,3.75rem)] leading-[0.98] tracking-[-0.02em] text-ink">
                Pick your speed.
                <br />
                See your price.
                <br />
                Then book.
              </h2>
            </MaskLines>
          </div>
          <p className="max-w-xs font-mono-meta text-ink/45 lg:text-right">
            from {formatCurrency(LOWEST_RATE_PER_LB)} / lb ·{" "}
            {formatCurrency(DELIVERY_RATE_PER_MILE)} per mile ·{" "}
            {formatCurrency(DELIVERY_FEE_CAP)} delivery max
          </p>
        </div>

        <div className="glass mt-10 rounded-[28px]">
          <div className="grid lg:grid-cols-12">
            {/* Controls */}
            <div className="border-b border-white/70 p-6 sm:p-9 lg:col-span-6 lg:border-b-0 lg:border-r lg:p-11">
              <div>
                <p className="font-mono-meta text-ink/45">
                  1 — How fast do you need it?
                </p>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {TURNAROUND_TIERS.map((tier) => {
                    const selected = tier.id === tierId;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setTierId(tier.id)}
                        aria-pressed={selected}
                        className={cn(
                          "rounded-2xl px-4 py-3.5 text-left transition-all duration-300",
                          tier.isSubscription && "sm:col-span-2",
                          selected
                            ? "bg-royal text-white shadow-[0_16px_34px_-16px_rgba(69,54,214,0.9)]"
                            : "bg-white/70 text-ink ring-1 ring-inset ring-ink/10 hover:bg-white"
                        )}
                      >
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="text-[0.9375rem] font-semibold tracking-tight">
                            {tier.label}
                          </span>
                          <span
                            className={cn(
                              "tabular font-display text-[1.25rem] leading-none",
                              selected ? "text-white" : "text-ember"
                            )}
                          >
                            {formatCurrency(tier.ratePerLb)}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "mt-1 block text-[0.8125rem] leading-snug",
                            selected ? "text-white/75" : "text-ink/55"
                          )}
                        >
                          {tier.summary}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <p className="font-mono-meta text-ink/45">
                  2 — Roughly how heavy?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {WEIGHTS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeightLbs(w)}
                      className={cn(
                        "h-11 rounded-full px-5 font-mono text-[0.8125rem] font-medium tracking-wide transition-colors",
                        weightLbs === w
                          ? "bg-royal text-white"
                          : "bg-white/70 text-ink/65 ring-1 ring-inset ring-ink/10 hover:bg-white hover:text-ink"
                      )}
                    >
                      {w} lb
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink/50">
                  {MIN_ORDER_LBS} lb is our minimum — a full tall hamper is
                  usually around there.
                </p>
              </div>

              <div className="mt-8">
                <p className="font-mono-meta text-ink/45">
                  3 — Anything extra?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ADD_ONS.map((addOn) => {
                    const on = addOnIds.includes(addOn.id);
                    return (
                      <button
                        key={addOn.id}
                        type="button"
                        onClick={() => toggleAddOn(addOn.id)}
                        aria-pressed={on}
                        className={cn(
                          "inline-flex h-11 items-center gap-2 rounded-full px-4 text-[0.8125rem] font-medium transition-colors",
                          on
                            ? "bg-mint text-ink"
                            : "bg-white/70 text-ink/65 ring-1 ring-inset ring-ink/10 hover:bg-white"
                        )}
                      >
                        <Plus
                          className={cn(
                            "h-3.5 w-3.5 transition-transform duration-300",
                            on && "rotate-45"
                          )}
                        />
                        {addOn.label}
                        <span className="font-mono text-[0.6875rem] text-ink/50">
                          {addOn.rateLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <label
                  htmlFor="concept-address"
                  className="font-mono-meta text-ink/45"
                >
                  4 — Where should we pick up?
                </label>
                <div className="mt-3">
                  <AddressAutocomplete
                    id="concept-address"
                    onSelect={handleSelect}
                    onClear={handleClear}
                    onUnavailable={handleUnavailable}
                  />
                </div>

                {status === "loading" ? (
                  <p className="mt-3 flex items-center gap-2 text-[0.8125rem] text-royal">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Measuring the drive…
                  </p>
                ) : (
                  <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink/50">
                    Pick your address from the list and we&rsquo;ll measure the
                    real driving distance.
                  </p>
                )}

                {status === "error" && error && (
                  <div className="mt-4 rounded-2xl bg-ember/8 px-4 py-3.5">
                    <p className="text-[0.875rem] font-medium text-ember">
                      {error}
                    </p>
                    <a
                      href={BUSINESS.phoneHref}
                      className="mt-1.5 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink/70 transition-colors hover:text-royal"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call {BUSINESS.phoneDisplay} for a quote
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Live estimate */}
            <div className="relative p-6 sm:p-9 lg:col-span-6 lg:p-11">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono-meta text-ink/45">Estimated total</p>
                  <p className="mt-2 font-display text-[clamp(3rem,7vw,5rem)] leading-none tracking-tight text-ember tabular">
                    {hasDistance ? (
                      <AnimatedCounter
                        value={estimate.total}
                        decimals={2}
                        prefix="$"
                      />
                    ) : (
                      <span className="text-ink/15">$—</span>
                    )}
                  </p>
                </div>
                <p className="max-w-[10rem] text-right font-mono-meta text-ink/35">
                  {hasDistance
                    ? "Laundry + delivery"
                    : "Add an address to unlock"}
                </p>
              </div>

              {/* Route visual */}
              <div className="mt-7 rounded-2xl border border-white/70 bg-white/60 px-4 py-5 sm:px-6">
                <svg
                  viewBox="0 0 640 160"
                  className="h-auto w-full text-royal"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 36 120 C 150 110, 220 50, 320 48 C 420 46, 500 70, 604 36"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeOpacity="0.2"
                  />
                  <path
                    ref={routeRef}
                    d="M 36 120 C 150 110, 220 50, 320 48 C 420 46, 500 70, 604 36"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                  />
                  <circle cx="36" cy="120" r="5" fill="currentColor" />
                  <circle
                    cx="604"
                    cy="36"
                    r="5"
                    fill={hasDistance ? "#FF6A2B" : "transparent"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <text
                    x="36"
                    y="148"
                    fill="#141229"
                    fillOpacity="0.45"
                    fontSize="10"
                    fontFamily="monospace"
                    letterSpacing="1.4"
                  >
                    US
                  </text>
                  <text
                    x="604"
                    y="24"
                    fill="#141229"
                    fillOpacity="0.45"
                    fontSize="10"
                    fontFamily="monospace"
                    letterSpacing="1.4"
                    textAnchor="end"
                  >
                    YOU
                  </text>
                </svg>
              </div>

              {/* Itemised breakdown */}
              <dl className="mt-7 divide-y divide-ink/10 border-y border-ink/10">
                {estimate.lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-baseline justify-between gap-4 py-3.5"
                  >
                    <dt className="text-[0.9375rem] text-ink/75">
                      {line.label}
                      {line.note && (
                        <span className="mt-0.5 block font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink/40">
                          {line.note}
                        </span>
                      )}
                    </dt>
                    <dd className="tabular shrink-0 font-display text-xl text-ink">
                      {formatCurrency(line.amount)}
                    </dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-[0.9375rem] text-ink/75">
                    Delivery
                    <span className="mt-0.5 block font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink/40">
                      {!hasDistance
                        ? `${formatCurrency(
                            DELIVERY_RATE_PER_MILE
                          )} per mile · ${formatCurrency(
                            DELIVERY_FEE_CAP
                          )} max`
                        : capped
                          ? `${estimate.distanceMiles} mi · capped at ${formatCurrency(
                              DELIVERY_FEE_CAP
                            )}`
                          : `${estimate.distanceMiles} mi × ${formatCurrency(
                              DELIVERY_RATE_PER_MILE
                            )}`}
                    </span>
                  </dt>
                  <dd className="tabular shrink-0 font-display text-xl text-ink">
                    {hasDistance ? (
                      formatCurrency(estimate.deliveryFee)
                    ) : (
                      <span className="text-ink/20">—</span>
                    )}
                  </dd>
                </div>
              </dl>

              {outOfArea && distanceMiles !== null && (
                <div className="mt-5 rounded-2xl bg-ember/8 px-4 py-4">
                  <p className="text-[0.9375rem] font-semibold text-ink">
                    That address is about {distanceMiles} miles out.
                  </p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink/65">
                    We normally quote pickups within{" "}
                    {MAX_SERVICE_RADIUS_MILES} miles. Give us a call — longer
                    runs are often still possible, we just price them by hand.
                  </p>
                  <a
                    href={BUSINESS.phoneHref}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-royal transition-colors hover:text-ember"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call {BUSINESS.phoneDisplay}
                  </a>
                </div>
              )}

              {capped && (
                <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-mint/15 px-4 py-3 text-[0.8125rem] leading-relaxed text-ink/70">
                  <Navigation className="mt-0.5 h-3.5 w-3.5 shrink-0 text-royal" />
                  You&rsquo;re far enough out that the mileage would come to more
                  than {formatCurrency(DELIVERY_FEE_CAP)}. We cap delivery there,
                  so that&rsquo;s all you pay.
                </p>
              )}

              {estimate.minimumApplied && !outOfArea && (
                <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-royal/8 px-4 py-3 text-[0.8125rem] leading-relaxed text-ink/70">
                  <Navigation className="mt-0.5 h-3.5 w-3.5 shrink-0 text-royal" />
                  Billed at our {MIN_ORDER_LBS} lb minimum. If your bag comes in
                  lighter, we may credit the difference to your next order.
                </p>
              )}

              <div className="mt-7 flex flex-col gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-[0.75rem] leading-relaxed text-ink/45">
                  Delivery is measured as the driving distance to your address.
                  Your choices carry into booking so you do not re-enter them.{" "}
                  <a
                    href="https://www.geoapify.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-ink/20 underline-offset-2 transition-colors hover:text-ink/70"
                  >
                    Address search by Geoapify
                  </a>
                  .
                </p>
                {outOfArea ? (
                  <a
                    href={BUSINESS.phoneHref}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-royal px-6 font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    <Phone className="h-4 w-4" />
                    Call to arrange
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={goToBooking}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ember px-6 font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    Book this pickup →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
