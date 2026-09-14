"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Check, Loader2, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/business";
import {
  clearBookingDraft,
  readBookingDraft,
} from "@/lib/orders/draft";
import { formatCurrency } from "@/lib/utils";

interface Success {
  reference: string;
  total: number;
  deliveryFee: number;
  distanceMiles: number;
  charged?: boolean;
  chargedAmount?: number;
  card?: { brand: string; last4: string };
}

/**
 * Lands here after Stripe-hosted Checkout (setup mode). Finishes the booking
 * with the saved card session id + the draft stashed before redirect.
 */
export function BookCompleteClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [phase, setPhase] = useState<"working" | "done" | "error">("working");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      if (!sessionId?.startsWith("cs_")) {
        setError("Missing card checkout session. Please book again.");
        setPhase("error");
        return;
      }

      const draft = readBookingDraft();
      if (!draft) {
        setError(
          "We lost the booking details for this tab. Please start the form again — your card may already be saved, but we still need the pickup details."
        );
        setPhase("error");
        return;
      }

      setEmail(draft.contact.email);

      try {
        const response = await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...draft,
            checkoutSessionId: sessionId,
          }),
        });
        const payload = await response.json().catch(() => ({}));

        if (cancelled) return;

        if (!response.ok) {
          setError(
            payload.error ??
              `We could not finish that booking. Please call ${BUSINESS.phoneDisplay}.`
          );
          setPhase("error");
          return;
        }

        clearBookingDraft();
        setSuccess(payload as Success);
        setPhase("done");
      } catch {
        if (cancelled) return;
        setError(
          `We could not reach the server. Please call ${BUSINESS.phoneDisplay}.`
        );
        setPhase("error");
      }
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (phase === "working") {
    return (
      <div className="glass mx-auto max-w-xl rounded-[32px] p-10 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-royal" />
        <p className="mt-5 text-[1.0625rem] font-semibold text-ink">
          Confirming your card and charging the estimate&hellip;
        </p>
        <p className="mt-2 text-[0.9375rem] text-ink/60">
          Your pickup is locked in once payment succeeds.
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="glass mx-auto max-w-xl rounded-[32px] p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ember/15 text-ember">
          <AlertCircle className="h-7 w-7" />
        </span>
        <h1 className="mt-6 font-display text-[2rem] tracking-tight text-ink">
          Almost there
        </h1>
        <p className="mt-3 text-[1rem] leading-relaxed text-ink/70">{error}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/book"
            className="inline-flex items-center justify-center rounded-full bg-ember px-7 py-3.5 font-semibold text-white"
          >
            Back to booking
          </Link>
          <a
            href={BUSINESS.phoneHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-ink ring-2 ring-inset ring-ink/10"
          >
            <Phone className="h-4 w-4" />
            {BUSINESS.phoneDisplay}
          </a>
        </div>
      </div>
    );
  }

  if (!success) return null;

  return (
    <div className="glass mx-auto max-w-2xl rounded-[32px] p-9 text-center sm:p-12">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-mint text-ink">
        <Check className="h-8 w-8" strokeWidth={2.2} />
      </span>
      <h1 className="mt-7 font-display text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-tight text-ink">
        That&rsquo;s booked.
      </h1>
      <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/70">
        We&rsquo;ve sent a confirmation to{" "}
        <span className="font-semibold text-ink">{email}</span>. Your reference
        is{" "}
        <span className="font-mono font-semibold text-royal">
          {success.reference}
        </span>
        .
      </p>

      <dl className="mt-8 space-y-3 rounded-2xl bg-white/70 px-6 py-5 text-left">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[0.9375rem] text-ink/70">Delivery</dt>
          <dd className="tabular font-display text-lg text-ink">
            {formatCurrency(success.deliveryFee)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-ink/10 pt-3">
          <dt className="text-[0.9375rem] font-semibold text-ink">
            Estimated total
          </dt>
          <dd className="tabular font-display text-2xl text-ink">
            {formatCurrency(success.total)}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-[0.9375rem] leading-relaxed text-ink/60">
        {success.charged
          ? `We charged ${formatCurrency(
              success.chargedAmount ?? success.total
            )}${
              success.card
                ? ` to your ${success.card.brand} ending in ${success.card.last4}`
                : ""
            }. If the bag weighs differently at pickup, we will settle the difference with you.`
          : "No card charge was taken with this booking."}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={BUSINESS.phoneHref}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ember px-7 py-3.5 font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          <Phone className="h-4 w-4" />
          {BUSINESS.phoneDisplay}
        </a>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 font-semibold text-ink ring-2 ring-inset ring-ink/10 transition-transform hover:-translate-y-0.5"
        >
          Back to the site
        </Link>
      </div>
    </div>
  );
}
