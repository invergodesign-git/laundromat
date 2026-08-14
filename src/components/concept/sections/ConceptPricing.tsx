"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
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
 * Upgraded as a single glass instrument panel (21st-inspired metric cards +
 * live estimate), not a split form/result that felt unfinished.
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
    <section id="pricing" ref={root} className="relative overflow-hidden bg-plum py-20 sm:py-24 lg:py-28">
      {/* Soft ambient field behind the instrument */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-1/4 top-1/4 h-[36rem] w-[36rem] rounded-full bg-royal/20 blur-[120px]"
      />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-meta text-lavender/70">Pricing</p>
            <MaskLines className="mt-3 max-w-3xl">
              <h2 className="font-display text-[clamp(2rem,5vw,3.75rem)] leading-[0.98] tracking-[-0.02em] text-cream">
                Your location.
                <br />
                Your distance.
                <br />
                Your price.
              </h2>
            </MaskLines>
          </div>
          <p className="max-w-xs font-mono-meta text-cream/40 lg:text-right">
            {formatCurrency(PRICING_CONFIG.washFoldRatePerLb)} / lb · pickup by distance
          </p>
        </div>

        {/* Scannable rate cards — competitor-style clarity before the calculator */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-4">
          <div className="rounded-2xl border border-cream/10 bg-cream/[0.04] px-6 py-6 backdrop-blur-sm">
            <p className="font-mono-meta text-cream/40">Wash &amp; Fold</p>
            <p className="mt-3 font-display text-[2.25rem] leading-none tracking-tight text-ember">
              {formatCurrency(PRICING_CONFIG.washFoldRatePerLb)}
              <span className="ml-1 font-mono text-sm tracking-wide text-cream/50">/ lb</span>
            </p>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-cream/50">
              Billed on the real weight of your order.
            </p>
          </div>
          <div className="rounded-2xl border border-cream/10 bg-cream/[0.04] px-6 py-6 backdrop-blur-sm">
            <p className="font-mono-meta text-cream/40">Pickup &amp; Delivery</p>
            <p className="mt-3 font-display text-[2.25rem] leading-none tracking-tight text-cream">
              {formatCurrency(PRICING_CONFIG.pickup.minFee)}
              <span className="mx-1 font-mono text-sm text-cream/40">–</span>
              {formatCurrency(PRICING_CONFIG.pickup.maxFee)}
            </p>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-cream/50">
              {PRICING_CONFIG.pickup.minDistanceMiles}–{PRICING_CONFIG.pickup.maxDistanceMiles} mi from the shop, by distance.
            </p>
          </div>
          <div className="rounded-2xl border border-cream/10 bg-cream/[0.04] px-6 py-6 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
            <p className="font-mono-meta text-cream/40">How to book</p>
            <p className="mt-3 font-display text-[1.75rem] leading-none tracking-tight text-cream">
              Check price → call
            </p>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-cream/50">
              Enter your address below, then call {BUSINESS.ownerFirstName} to schedule.
            </p>
          </div>
        </div>

        {/* Single glass instrument — live estimate */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 overflow-hidden rounded-[28px] border border-cream/10 bg-cream/[0.04] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:mt-8"
        >
          <div className="grid lg:grid-cols-12">
            {/* Controls */}
            <div className="border-b border-cream/10 p-6 sm:p-9 lg:col-span-5 lg:border-b-0 lg:border-r lg:p-11">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember/15 text-ember">
                  <Navigation className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-mono-meta text-cream/40">From our shop</p>
                  <p className="mt-1 font-mono text-[0.8125rem] leading-relaxed tracking-wide text-cream/75">
                    {LAUNDRY_ORIGIN.address}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <label htmlFor="concept-address" className="font-mono-meta text-cream/40">
                  Where should we pick up?
                </label>
                <div className="relative mt-3">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ember" />
                  <input
                    id="concept-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address, San Diego"
                    autoComplete="street-address"
                    className="h-14 w-full rounded-2xl border border-cream/15 bg-plum-deep/50 pl-11 pr-4 font-geist text-base text-cream outline-none transition-colors placeholder:text-cream/30 focus:border-ember/60"
                  />
                </div>
              </div>

              <div className="mt-7">
                <p className="font-mono-meta text-cream/40">Rough weight</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {WEIGHTS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeightLbs(w)}
                      className={cn(
                        "h-11 rounded-full px-5 font-mono text-[0.8125rem] font-medium tracking-wide transition-colors",
                        weightLbs === w
                          ? "bg-ember text-plum"
                          : "bg-cream/5 text-cream/60 ring-1 ring-inset ring-cream/10 hover:bg-cream/10 hover:text-cream"
                      )}
                    >
                      {w} lb
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[0.75rem] text-cream/35">
                  A full kitchen bin is usually around 20 lb.
                </p>
              </div>

              <div className="mt-8">
                <SlideFillButton
                  type="submit"
                  variant="ember"
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
                  <p className="font-mono-meta text-cream/40">Estimated total</p>
                  <p className="mt-2 font-display text-[clamp(3rem,8vw,5.5rem)] leading-none tracking-tight text-ember tabular">
                    {total !== null ? (
                      <AnimatedCounter value={total} decimals={2} prefix="$" />
                    ) : (
                      <span className="text-cream/15">$—</span>
                    )}
                  </p>
                </div>
                <p className="max-w-[10rem] text-right font-mono-meta text-cream/30">
                  {status === "done"
                    ? "Includes wash & fold + pickup"
                    : "Enter an address to unlock"}
                </p>
              </div>

              {/* Route visual */}
              <div className="mt-8 rounded-2xl border border-cream/10 bg-plum-deep/40 px-4 py-5 sm:px-6">
                <svg
                  viewBox="0 0 640 160"
                  className="h-auto w-full text-ember"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 36 120 C 150 110, 220 50, 320 48 C 420 46, 500 70, 604 36"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeOpacity="0.18"
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
                    fill={status === "done" ? "currentColor" : "transparent"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <text
                    x="36"
                    y="148"
                    fill="#FAF7F2"
                    fillOpacity="0.4"
                    fontSize="10"
                    fontFamily="monospace"
                    letterSpacing="1.4"
                  >
                    SHOP
                  </text>
                  <text
                    x="604"
                    y="24"
                    fill="#FAF7F2"
                    fillOpacity="0.4"
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
                        <span className="ml-1 text-base text-cream/45">mi</span>
                      </>
                    ) : (
                      <span className="text-cream/20">—</span>
                    )
                  }
                />
                <Metric
                  label="Pickup & delivery"
                  value={
                    pickupFee !== null ? (
                      <AnimatedCounter value={pickupFee} decimals={2} prefix="$" />
                    ) : (
                      <span className="text-cream/20">—</span>
                    )
                  }
                />
                <Metric
                  label={`Wash & fold · ${weightLbs} lb`}
                  value={<AnimatedCounter value={washFold} decimals={2} prefix="$" />}
                />
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-cream/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-[0.75rem] leading-relaxed text-cream/35">
                  Distances use a demo estimator — not a live map.{" "}
                  {formatCurrency(PRICING_CONFIG.washFoldRatePerLb)} / lb is billed on the real
                  weight. Nothing is charged here.
                </p>
                <a
                  href={BUSINESS.phoneHref}
                  className="font-mono-meta text-cream/70 transition-colors hover:text-ember"
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
    <div className="rounded-2xl border border-cream/10 bg-cream/[0.03] px-4 py-4 sm:px-5">
      <p className="font-mono-meta text-cream/35">{label}</p>
      <p className="mt-2 font-display text-2xl text-cream tabular sm:text-3xl">{value}</p>
    </div>
  );
}
