"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Bubbles } from "@/components/concept/motion/Bubbles";
import { MaskLines } from "@/components/concept/motion/MaskLines";
import { SlideFillButton } from "@/components/concept/motion/SlideFill";
import { DrawSVGPlugin, EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import { getDistanceFromLaundry, LAUNDRY_ORIGIN } from "@/lib/distance";
import {
  calculatePickupFee,
  calculateWashFoldCost,
  PRICING_CONFIG,
} from "@/lib/pricing";
import { BUSINESS } from "@/lib/business";
import { cn, formatCurrency, roundToCent } from "@/lib/utils";

type Status = "idle" | "loading" | "done" | "error";

const WEIGHTS = [10, 20, 30, 40] as const;

/**
 * Section 04 — Interactive pickup pricing.
 * A single glass instrument panel (rate cards + live estimate) rather than a
 * split form/result that read as unfinished.
 */
export function ConceptPricing() {
  const root = useRef<HTMLElement>(null);
  const routeRef = useRef<SVGPathElement>(null);

  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weightLbs, setWeightLbs] = useState(20);

  const washFold = calculateWashFoldCost(weightLbs);
  const pickupFee = distanceMiles !== null ? calculatePickupFee(distanceMiles) : null;
  const total = pickupFee !== null ? roundToCent(washFold + pickupFee) : null;

  useGSAP(
    () => {
      void DrawSVGPlugin;
      if (!routeRef.current) return;

      if (status !== "done" || prefersReducedMotion()) {
        if (status === "done") gsap.set(routeRef.current, { drawSVG: "100%" });
        else gsap.set(routeRef.current, { drawSVG: "0%" });
        return;
      }

      gsap.fromTo(
        routeRef.current,
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 1.35, ease: EASE.softInOut }
      );
    },
    { dependencies: [status, distanceMiles], scope: root }
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!address.trim() || status === "loading") return;

    setStatus("loading");
    setError(null);
    setDistanceMiles(null);

    try {
      const result = await getDistanceFromLaundry(address);
      setDistanceMiles(result.distanceMiles);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <section
      id="pricing"
      ref={root}
      className="relative overflow-hidden bg-foam py-20 sm:py-24 lg:py-28"
    >
      {/* Soft ambient field behind the instrument */}
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
                Your location.
                <br />
                Your distance.
                <br />
                Your price.
              </h2>
            </MaskLines>
          </div>
          <p className="max-w-xs font-mono-meta text-ink/45 lg:text-right">
            {formatCurrency(PRICING_CONFIG.washFoldRatePerLb)} / lb · pickup by distance
          </p>
        </div>

        {/* Scannable rate cards — competitor-style clarity before the calculator */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-4">
          <div className="glass rounded-2xl px-6 py-6">
            <p className="font-mono-meta text-ink/45">Wash &amp; Fold</p>
            <p className="mt-3 font-display text-[2.25rem] leading-none tracking-tight text-ember tabular">
              {formatCurrency(PRICING_CONFIG.washFoldRatePerLb)}
              <span className="ml-1 font-mono text-sm tracking-wide text-ink/45">/ lb</span>
            </p>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-ink/60">
              Billed on the real weight of your order.
            </p>
          </div>
          <div className="glass rounded-2xl px-6 py-6">
            <p className="font-mono-meta text-ink/45">Pickup &amp; Delivery</p>
            <p className="mt-3 font-display text-[2.25rem] leading-none tracking-tight text-ink tabular">
              {formatCurrency(PRICING_CONFIG.pickup.minFee)}
              <span className="mx-1 font-mono text-sm text-ink/40">–</span>
              {formatCurrency(PRICING_CONFIG.pickup.maxFee)}
            </p>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-ink/60">
              {PRICING_CONFIG.pickup.minDistanceMiles}–{PRICING_CONFIG.pickup.maxDistanceMiles} mi
              from the shop, by distance.
            </p>
          </div>
          <div className="glass rounded-2xl px-6 py-6 sm:col-span-2 lg:col-span-1">
            <p className="font-mono-meta text-ink/45">How to book</p>
            <p className="mt-3 font-display text-[1.75rem] leading-none tracking-tight text-ink">
              Check price → call
            </p>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-ink/60">
              Enter your address below, then call {BUSINESS.ownerFirstName} to schedule.
            </p>
          </div>
        </div>

        {/* Single glass instrument — live estimate */}
        <form
          onSubmit={handleSubmit}
          className="glass mt-6 overflow-hidden rounded-[28px] lg:mt-8"
        >
          <div className="grid lg:grid-cols-12">
            {/* Controls */}
            <div className="border-b border-white/70 p-6 sm:p-9 lg:col-span-5 lg:border-b-0 lg:border-r lg:p-11">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-royal/10 text-royal">
                  <Navigation className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-mono-meta text-ink/45">From our shop</p>
                  <p className="mt-1 font-mono text-[0.8125rem] leading-relaxed tracking-wide text-ink/75">
                    {LAUNDRY_ORIGIN.address}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <label htmlFor="concept-address" className="font-mono-meta text-ink/45">
                  Where should we pick up?
                </label>
                <div className="relative mt-3">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-royal" />
                  <input
                    id="concept-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address, San Diego"
                    autoComplete="street-address"
                    className="h-14 w-full rounded-2xl border border-ink/10 bg-white/85 pl-11 pr-4 font-geist text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-royal/60"
                  />
                </div>
              </div>

              <div className="mt-7">
                <p className="font-mono-meta text-ink/45">Rough weight</p>
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
                <p className="mt-3 text-[0.75rem] text-ink/45">
                  A full kitchen bin is usually around 20 lb.
                </p>
              </div>

              <div className="mt-8">
                <SlideFillButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  arrow
                  disabled={status === "loading" || !address.trim()}
                  magnetic={false}
                  className="w-full sm:w-auto"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Measuring
                    </>
                  ) : (
                    "Calculate my price"
                  )}
                </SlideFillButton>
              </div>

              {status === "error" && error && (
                <p className="mt-4 text-sm font-medium text-ember">{error}</p>
              )}
            </div>

            {/* Live estimate */}
            <div className="relative p-6 sm:p-9 lg:col-span-7 lg:p-11">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono-meta text-ink/45">Estimated total</p>
                  <p className="mt-2 font-display text-[clamp(3rem,8vw,5.5rem)] leading-none tracking-tight text-ember tabular">
                    {total !== null ? (
                      <AnimatedCounter value={total} decimals={2} prefix="$" />
                    ) : (
                      <span className="text-ink/15">$—</span>
                    )}
                  </p>
                </div>
                <p className="max-w-[10rem] text-right font-mono-meta text-ink/35">
                  {status === "done"
                    ? "Includes wash & fold + pickup"
                    : "Enter an address to unlock"}
                </p>
              </div>

              {/* Route visual */}
              <div className="mt-8 rounded-2xl border border-white/70 bg-white/60 px-4 py-5 sm:px-6">
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
                    fill={status === "done" ? "#FF6A2B" : "transparent"}
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
                    SHOP
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

              {/* Glass metric tiles */}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Metric
                  label="Distance"
                  value={
                    distanceMiles !== null && status === "done" ? (
                      <>
                        <AnimatedCounter value={distanceMiles} decimals={1} />
                        <span className="ml-1 text-base text-ink/45">mi</span>
                      </>
                    ) : (
                      <span className="text-ink/20">—</span>
                    )
                  }
                />
                <Metric
                  label="Pickup & delivery"
                  value={
                    pickupFee !== null ? (
                      <AnimatedCounter value={pickupFee} decimals={2} prefix="$" />
                    ) : (
                      <span className="text-ink/20">—</span>
                    )
                  }
                />
                <Metric
                  label={`Wash & fold · ${weightLbs} lb`}
                  value={<AnimatedCounter value={washFold} decimals={2} prefix="$" />}
                />
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-[0.75rem] leading-relaxed text-ink/45">
                  Distances use a demo estimator — not a live map.{" "}
                  {formatCurrency(PRICING_CONFIG.washFoldRatePerLb)} / lb is billed on the real
                  weight. Nothing is charged here.
                </p>
                <a
                  href={BUSINESS.phoneHref}
                  className="font-mono-meta text-ink/70 transition-colors hover:text-royal"
                >
                  Book with {BUSINESS.ownerFirstName} →
                </a>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/55 px-4 py-4 sm:px-5">
      <p className="font-mono-meta text-ink/40">{label}</p>
      <p className="mt-2 font-display text-2xl text-ink tabular sm:text-3xl">{value}</p>
    </div>
  );
}
