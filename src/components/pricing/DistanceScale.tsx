import { PRICING_CONFIG } from "@/lib/pricing";
import { calculatePickupFee } from "@/lib/pricing";
import { clamp, formatCurrency } from "@/lib/utils";

const { minDistanceMiles, maxDistanceMiles, minFee, maxFee } = PRICING_CONFIG.pickup;

function positionFor(miles: number): number {
  return clamp(miles / maxDistanceMiles, 0, 1) * 100;
}

interface DistanceScaleProps {
  /** Null until an address has been resolved. */
  distanceMiles: number | null;
}

/**
 * Shows the pickup fee curve as a plain scale rather than an abstract map:
 * a flat rate close to the shop, an even climb after that, and a hard cap.
 * The customer can see exactly where their address lands on it.
 */
export function DistanceScale({ distanceMiles }: DistanceScaleProps) {
  const flatEnd = positionFor(minDistanceMiles);
  const marker = distanceMiles !== null ? positionFor(distanceMiles) : null;
  const fee = distanceMiles !== null ? calculatePickupFee(distanceMiles) : null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[0.9375rem] font-bold">How pickup is priced</span>
        <span className="text-[0.8125rem] font-semibold text-ink-soft tabular">
          {formatCurrency(minFee)} – {formatCurrency(maxFee)}
        </span>
      </div>

      {/* Clearance for the marker's callout, which sits above the track. */}
      <div className="relative mt-12 h-2">
        <div className="absolute inset-0 rounded-full bg-mist" />
        {/* Flat-rate zone: everything inside this distance is the same price. */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brand-line"
          style={{ width: `${flatEnd}%` }}
        />
        <div
          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-brand-line to-brand transition-[width] duration-700 ease-out"
          style={{ left: 0, width: `${marker ?? 0}%` }}
        />

        {marker !== null && (
          <div
            className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-700 ease-out"
            style={{ left: `${marker}%` }}
          >
            <span className="block h-5 w-5 rounded-full border-[3px] border-white bg-sun shadow-card" />
            <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-[0.75rem] font-bold text-white tabular">
              {distanceMiles?.toFixed(1)} mi · {fee !== null ? formatCurrency(fee) : ""}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-between text-[0.75rem] font-semibold text-ink-soft tabular">
        <span>
          {minDistanceMiles} mi · {formatCurrency(minFee)} flat
        </span>
        <span>
          {maxDistanceMiles} mi · {formatCurrency(maxFee)} max
        </span>
      </div>
    </div>
  );
}
