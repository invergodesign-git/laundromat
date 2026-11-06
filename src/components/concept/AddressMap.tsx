"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import type { AddressSuggestion } from "@/lib/geo/types";
import { cn } from "@/lib/utils";

interface AddressMapProps {
  address: AddressSuggestion;
  className?: string;
}

/**
 * Map preview of the address the customer picked, so they can confirm the pin
 * is on the right building before booking. The image comes from our own
 * `/api/address/map` route, which keeps the Geoapify key on the server.
 */
export function AddressMap({ address, className }: AddressMapProps) {
  const src = `/api/address/map?lat=${address.lat.toFixed(5)}&lon=${address.lon.toFixed(5)}`;
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) return null;
  const loaded = loadedSrc === src;
  const fullAddress = [address.label, address.context].filter(Boolean).join(", ");

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-2xl border border-ink/10 bg-white/85",
        className
      )}
    >
      <div className="relative aspect-[16/7] w-full bg-ink/5">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-[0.8125rem] text-ink/50">
            <Loader2 className="h-4 w-4 animate-spin text-royal" aria-hidden="true" />
            Loading map…
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element -- proxied dynamic image */}
        <img
          key={src}
          src={src}
          alt={`Map showing ${fullAddress}`}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
      <figcaption className="flex items-start gap-2 px-4 py-3 text-[0.8125rem] leading-snug text-ink/70">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-royal" aria-hidden="true" />
        <span>
          <span className="font-medium text-ink">{address.label}</span>
          {address.context && <span className="text-ink/55">, {address.context}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
