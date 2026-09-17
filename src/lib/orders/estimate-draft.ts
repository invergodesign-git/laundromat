/**
 * Carries pricing-calculator choices into /book so the customer does not
 * re-enter tier, weight, add-ons, or address.
 */

import type { AddressSuggestion } from "@/lib/geo/types";
import {
  isAddOnId,
  isTurnaroundTierId,
  type AddOnId,
  type TurnaroundTierId,
} from "@/lib/pricing";

export const ESTIMATE_DRAFT_KEY = "cl-estimate-draft";

export interface EstimateDraft {
  tierId: TurnaroundTierId;
  weightLbs: number;
  addOnIds: AddOnId[];
  address: AddressSuggestion | null;
  distanceMiles: number | null;
}

export function saveEstimateDraft(draft: EstimateDraft): void {
  sessionStorage.setItem(ESTIMATE_DRAFT_KEY, JSON.stringify(draft));
}

export function readEstimateDraft(): EstimateDraft | null {
  try {
    const raw = sessionStorage.getItem(ESTIMATE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EstimateDraft>;
    if (!isTurnaroundTierId(parsed.tierId)) return null;
    const weightLbs = Number(parsed.weightLbs);
    if (!Number.isFinite(weightLbs) || weightLbs <= 0) return null;
    const addOnIds = Array.isArray(parsed.addOnIds)
      ? parsed.addOnIds.filter(isAddOnId)
      : [];
    const address =
      parsed.address &&
      typeof parsed.address.label === "string" &&
      typeof parsed.address.lat === "number" &&
      typeof parsed.address.lon === "number"
        ? (parsed.address as AddressSuggestion)
        : null;
    const distanceMiles =
      typeof parsed.distanceMiles === "number" ? parsed.distanceMiles : null;
    return {
      tierId: parsed.tierId,
      weightLbs: Math.round(weightLbs),
      addOnIds,
      address,
      distanceMiles,
    };
  } catch {
    return null;
  }
}

export function clearEstimateDraft(): void {
  sessionStorage.removeItem(ESTIMATE_DRAFT_KEY);
}
