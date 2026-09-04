/** Client-side stash of the booking draft while Stripe Checkout runs. */

export const BOOKING_DRAFT_KEY = "cl-booking-draft";

export interface BookingDraft {
  contact: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  address: {
    label: string;
    context: string;
    lat: number;
    lon: number;
    notes: string;
  };
  service: {
    tierId: string;
    addOnIds: string[];
    estimatedWeightLbs: number;
  };
  pickup: {
    date: string;
    windowId: string;
  };
  instructions: string;
  acceptedCancellationPolicy: true;
}

export function saveBookingDraft(draft: BookingDraft): void {
  sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
}

export function readBookingDraft(): BookingDraft | null {
  try {
    const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingDraft;
  } catch {
    return null;
  }
}

export function clearBookingDraft(): void {
  sessionStorage.removeItem(BOOKING_DRAFT_KEY);
}
