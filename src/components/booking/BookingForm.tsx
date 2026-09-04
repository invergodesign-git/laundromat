"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  Phone,
  Sparkles,
} from "lucide-react";
import { AddressAutocomplete } from "@/components/concept/AddressAutocomplete";
import {
  BUSINESS,
  businessDatePlus,
  CANCELLATION_POLICY,
  firstBookableDate,
  pickupWindowsForDate,
} from "@/lib/business";
import { fetchDistanceMiles } from "@/lib/geo/client";
import { GeoError, type AddressSuggestion } from "@/lib/geo/types";
import { saveBookingDraft } from "@/lib/orders/draft";
import type { OrderFieldErrors } from "@/lib/orders/types";
import {
  ADD_ONS,
  calculateEstimate,
  DEFAULT_TIER_ID,
  DELIVERY_FEE_CAP,
  isDeliveryCapped,
  isWithinServiceArea,
  MAX_SERVICE_RADIUS_MILES,
  MIN_ORDER_LBS,
  TURNAROUND_TIERS,
  type AddOnId,
  type TurnaroundTierId,
} from "@/lib/pricing";
import { isStripePublishableConfigured } from "@/lib/stripe/client";
import { cn, formatCurrency } from "@/lib/utils";

const MAX_DAYS_AHEAD = 30;
const DEFAULT_WEIGHT_LBS = 24;

type DistanceStatus = "idle" | "loading" | "done" | "error";
type SubmitStatus = "idle" | "submitting" | "done";

interface Success {
  reference: string;
  total: number;
  deliveryFee: number;
  distanceMiles: number;
  card?: { brand: string; last4: string };
}

/**
 * Which of the two things the form is doing. An address beyond the delivery
 * radius cannot be booked, but the person is still worth keeping in touch
 * with, so the form becomes a short "tell me when you reach me" instead of a
 * dead end.
 */
type Mode = "booking" | "waitlist";

const BOOKING_STEPS = [
  { id: 1, label: "Where" },
  { id: 2, label: "When" },
  { id: 3, label: "Speed" },
  { id: 4, label: "Bag" },
  { id: 5, label: "You" },
  { id: 6, label: "Confirm" },
] as const;

const WAITLIST_STEPS = [
  { id: 1, label: "Where" },
  { id: 2, label: "Contact" },
] as const;

/**
 * All three are pinned to the shop's timezone, so the server rendering this
 * and the browser hydrating it always agree — regardless of where either one
 * physically is.
 */
function dateBounds() {
  return {
    min: firstBookableDate(),
    max: businessDatePlus(MAX_DAYS_AHEAD),
  };
}

function stepForFieldErrors(
  fields: OrderFieldErrors,
  mode: Mode
): number | null {
  const keys = Object.keys(fields);
  if (keys.some((k) => k.startsWith("address."))) return 1;
  if (mode === "booking") {
    if (keys.some((k) => k.startsWith("pickup."))) return 2;
    if (keys.some((k) => k === "service.tierId")) return 3;
    if (keys.some((k) => k.startsWith("service."))) return 4;
    if (keys.some((k) => k.startsWith("contact."))) return 5;
    if (
      keys.some((k) => k === "acceptedCancellationPolicy" || k === "payment")
    ) {
      return 6;
    }
  } else if (keys.some((k) => k.startsWith("contact."))) {
    return 2;
  }
  return null;
}

/** Shared field shell: label, optional hint, and an error slot underneath. */
function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink/50"
      >
        {label}
      </label>
      {hint && (
        <p className="mt-1 text-[0.8125rem] leading-snug text-ink/50">{hint}</p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-[0.8125rem] leading-snug text-ember"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "h-14 w-full rounded-2xl border border-ink/10 bg-white/85 px-4 font-geist text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-royal/60";

export function BookingForm() {
  const bounds = useMemo(dateBounds, []);
  const stripeEnabled = isStripePublishableConfigured();
  const panelRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [address, setAddress] = useState<AddressSuggestion | null>(null);
  const [addressNotes, setAddressNotes] = useState("");
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null);
  const [distanceStatus, setDistanceStatus] = useState<DistanceStatus>("idle");
  const [distanceError, setDistanceError] = useState<string | null>(null);

  const [tierId, setTierId] = useState<TurnaroundTierId>(DEFAULT_TIER_ID);
  const [addOnIds, setAddOnIds] = useState<AddOnId[]>([]);
  const [weightLbs, setWeightLbs] = useState(DEFAULT_WEIGHT_LBS);

  const [pickupDate, setPickupDate] = useState(bounds.min);
  const [windowId, setWindowId] = useState("");
  const [instructions, setInstructions] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const [errors, setErrors] = useState<OrderFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [success, setSuccess] = useState<Success | null>(null);
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  const windows = useMemo(() => pickupWindowsForDate(pickupDate), [pickupDate]);

  const outOfArea =
    distanceStatus === "done" &&
    distanceMiles !== null &&
    !isWithinServiceArea(distanceMiles);
  const hasDistance =
    distanceStatus === "done" && distanceMiles !== null && !outOfArea;
  const mode: Mode = outOfArea ? "waitlist" : "booking";

  const steps = mode === "waitlist" ? WAITLIST_STEPS : BOOKING_STEPS;
  const totalSteps = steps.length;
  const isLastStep = step >= totalSteps;

  const estimate = calculateEstimate({
    weightLbs,
    distanceMiles: hasDistance ? distanceMiles : 0,
    tierId,
    addOnIds,
  });
  const capped = hasDistance && isDeliveryCapped(distanceMiles);

  // If the address flips into / out of range, keep the person on a valid step.
  useEffect(() => {
    setStep((current) => Math.min(current, totalSteps));
  }, [totalSteps]);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "cancelled") {
      setFormError(
        "Card checkout was cancelled. Your details are still here — continue when you are ready."
      );
      setStep(6);
      window.history.replaceState({}, "", "/book");
    }
  }, []);

  const clearError = (field: string) =>
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

  const goToStep = (next: number) => {
    setFormError(null);
    setErrors({});
    setStep(Math.max(1, Math.min(next, totalSteps)));
  };

  const handleAddressSelect = useCallback(async (suggestion: AddressSuggestion) => {
    setAddress(suggestion);
    setDistanceStatus("loading");
    setDistanceError(null);
    setErrors((current) => {
      const next = { ...current };
      delete next["address.label"];
      return next;
    });

    try {
      const miles = await fetchDistanceMiles({
        lat: suggestion.lat,
        lon: suggestion.lon,
      });
      setDistanceMiles(miles);
      setDistanceStatus("done");
    } catch (error) {
      setDistanceMiles(null);
      setDistanceStatus("error");
      setDistanceError(
        error instanceof GeoError
          ? error.message
          : "We could not measure the distance to that address."
      );
    }
  }, []);

  const handleAddressClear = useCallback(() => {
    setAddress(null);
    setDistanceMiles(null);
    setDistanceStatus("idle");
    setDistanceError(null);
  }, []);

  const toggleAddOn = (id: AddOnId) =>
    setAddOnIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );

  const handleDateChange = (value: string) => {
    setPickupDate(value);
    clearError("pickup.date");

    // A window that does not run on the newly chosen day would silently stay
    // selected, so it is dropped as soon as the day changes under it.
    const available = pickupWindowsForDate(value);
    if (!available.some((w) => w.id === windowId)) setWindowId("");
  };

  function validateStep(current: number): OrderFieldErrors {
    const next: OrderFieldErrors = {};

    if (current === 1) {
      if (!address) {
        next["address.label"] = "Pick your address from the list.";
      } else if (distanceStatus === "loading") {
        next["address.label"] = "Hang on — we are still measuring the drive.";
      } else if (distanceStatus === "error") {
        next["address.label"] =
          distanceError ?? "We could not measure that address.";
      } else if (distanceStatus !== "done" || distanceMiles === null) {
        next["address.label"] = "Pick your address from the list.";
      }
    }

    if (mode === "booking" && current === 2) {
      if (!pickupDate) next["pickup.date"] = "Pick a pickup day.";
      if (!windowId) next["pickup.windowId"] = "Pick a pickup window.";
    }

    if (mode === "booking" && current === 5) {
      if (!firstName.trim())
        next["contact.firstName"] = "We need a first name.";
      if (!lastName.trim()) next["contact.lastName"] = "We need a last name.";
      if (!phone.trim())
        next["contact.phone"] = "We need a number to confirm pickup.";
      else if (phone.replace(/\D/g, "").length < 10)
        next["contact.phone"] = "That does not look like a full phone number.";
      if (!email.trim())
        next["contact.email"] = "We send your confirmation here.";
      else if (!email.includes("@"))
        next["contact.email"] = "Check that email address.";
    }

    if (mode === "booking" && current === 6) {
      if (!acceptedPolicy)
        next["acceptedCancellationPolicy"] =
          "Please accept the cancellation terms to continue.";
    }

    if (mode === "waitlist" && current === 2) {
      if (!firstName.trim())
        next["contact.firstName"] = "We need a first name.";
      if (!lastName.trim()) next["contact.lastName"] = "We need a last name.";
      if (!phone.trim())
        next["contact.phone"] = "We need a number to reach you.";
      else if (phone.replace(/\D/g, "").length < 10)
        next["contact.phone"] = "That does not look like a full phone number.";
      if (!email.trim())
        next["contact.email"] = "We email you when we reach your area.";
      else if (!email.includes("@"))
        next["contact.email"] = "Check that email address.";
    }

    return next;
  }

  function handleNext() {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setFormError("A couple of details still need a look.");
      return;
    }
    setErrors({});
    setFormError(null);
    goToStep(step + 1);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "submitting") return;

    // Enter on early steps should advance, not submit.
    if (!isLastStep) {
      handleNext();
      return;
    }

    // Final submit: re-check contact + policy so a back-edit cannot slip through.
    const stepErrors =
      mode === "booking"
        ? { ...validateStep(5), ...validateStep(6) }
        : validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setFormError("A couple of details still need a look.");
      if (mode === "booking") {
        if (
          stepErrors["contact.firstName"] ||
          stepErrors["contact.lastName"] ||
          stepErrors["contact.phone"] ||
          stepErrors["contact.email"]
        ) {
          setStep(5);
        } else {
          setStep(6);
        }
      }
      setStatus("idle");
      return;
    }

    setStatus("submitting");
    setFormError(null);
    setErrors({});

    const contact = { firstName, lastName, phone, email };
    const addressPayload = {
      label: address?.label ?? "",
      context: address?.context ?? "",
      lat: address?.lat ?? 0,
      lon: address?.lon ?? 0,
      notes: addressNotes,
    };

    try {
      if (mode === "waitlist") {
        const response = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact, address: addressPayload }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          setErrors(payload.fields ?? {});
          setFormError(
            payload.error ?? "We could not submit that. Please try again."
          );
          setStatus("idle");
          return;
        }
        setJoinedWaitlist(true);
        setStatus("done");
        return;
      }

      const draft = {
        contact,
        address: addressPayload,
        service: { tierId, addOnIds, estimatedWeightLbs: weightLbs },
        pickup: { date: pickupDate, windowId },
        instructions,
        acceptedCancellationPolicy: true as const,
      };

      // Stripe-hosted Checkout (setup mode) — no charge, just card on file.
      if (stripeEnabled) {
        saveBookingDraft(draft);
        const checkoutResponse = await fetch("/api/book/checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        const checkoutPayload = await checkoutResponse.json().catch(() => ({}));
        if (!checkoutResponse.ok) {
          setErrors(checkoutPayload.fields ?? {});
          setFormError(
            checkoutPayload.error ??
              "We could not open card checkout. Please try again."
          );
          const jump = stepForFieldErrors(
            (checkoutPayload.fields ?? {}) as OrderFieldErrors,
            mode
          );
          if (jump) setStep(jump);
          setStatus("idle");
          return;
        }
        window.location.href = checkoutPayload.url as string;
        return;
      }

      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const fields = (payload.fields ?? {}) as OrderFieldErrors;
        setErrors(fields);
        setFormError(
          payload.error ?? "We could not submit that. Please try again."
        );
        const jump = stepForFieldErrors(fields, mode);
        if (jump) setStep(jump);
        setStatus("idle");
        return;
      }

      setSuccess(payload as Success);
      setStatus("done");
    } catch {
      setFormError(
        `We could not reach the server. Please call ${BUSINESS.phoneDisplay} and we will take your order over the phone.`
      );
      setStatus("idle");
    }
  }

  // ---- Confirmation --------------------------------------------------------
  if (status === "done" && joinedWaitlist) {
    return (
      <div className="glass mx-auto max-w-2xl rounded-[32px] p-9 text-center sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-aqua text-ink">
          <Check className="h-8 w-8" strokeWidth={2.2} />
        </span>
        <h2 className="mt-7 font-display text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-tight text-ink">
          We&rsquo;ve got you on the list.
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/70">
          You&rsquo;re a little further out than we currently drive, so we
          can&rsquo;t book a pickup yet. We&rsquo;ll email{" "}
          <span className="font-semibold text-ink">{email}</span> the moment we
          reach your area.
        </p>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink/60">
          If it&rsquo;s urgent, give us a call — longer runs are sometimes
          possible, we just price them by hand.
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

  if (status === "done" && success) {
    return (
      <div className="glass mx-auto max-w-2xl rounded-[32px] p-9 text-center sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-mint text-ink">
          <Check className="h-8 w-8" strokeWidth={2.2} />
        </span>
        <h2 className="mt-7 font-display text-[clamp(2rem,5vw,3rem)] leading-[1.05] tracking-tight text-ink">
          That&rsquo;s booked.
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/70">
          We&rsquo;ve sent a confirmation to{" "}
          <span className="font-semibold text-ink">{email}</span>. Your
          reference is{" "}
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
          Nothing has been charged
          {success.card
            ? ` — we saved your ${success.card.brand} ending in ${success.card.last4}`
            : ""}
          . We weigh your bag when we collect it, and that weight is what you
          pay for.
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

  const stepTitle =
    mode === "waitlist"
      ? step === 1
        ? "Where we collect"
        : "Who should we tell"
      : (
          {
            1: "Where we collect",
            2: "When should we come",
            3: "How fast do you need it",
            4: "About the bag",
            5: "Your details",
            6: "Confirm & card",
          } as Record<number, string>
        )[step] ?? "Book a pickup";

  // ---- Form ----------------------------------------------------------------
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-12"
    >
      <div className="lg:col-span-8">
        <div
          ref={panelRef}
          className="glass scroll-mt-28 rounded-[28px] p-7 sm:p-10"
        >
          {/* Number rail — full width, evenly spaced on the x-axis. */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute top-1/2 right-4 left-4 h-px -translate-y-1/2 bg-ink/12 sm:right-5 sm:left-5"
            />
            <ol className="relative flex w-full flex-nowrap items-center justify-between">
              {steps.map((item) => {
                const done = step > item.id;
                const active = step === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={item.id > step}
                      onClick={() => item.id < step && goToStep(item.id)}
                      aria-label={`Step ${item.id}: ${item.label}`}
                      aria-current={active ? "step" : undefined}
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-full font-mono text-[0.8125rem] font-semibold transition-colors sm:h-10 sm:w-10",
                        active && "bg-royal text-white",
                        done && "bg-mint/40 text-ink hover:bg-mint/55",
                        !active && !done && "bg-foam text-ink/35 ring-1 ring-inset ring-ink/10"
                      )}
                    >
                      {done ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      ) : (
                        item.id
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <p className="mt-6 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-royal">
            Step {step} of {totalSteps}
          </p>
          <h2 className="mt-2 font-display text-[1.75rem] leading-tight tracking-tight text-ink sm:text-[2rem]">
            {stepTitle}
          </h2>

          <div className="mt-6 grid gap-5">
            {/* 1 — Where */}
            {step === 1 && (
              <>
                <Field
                  label="Pickup address"
                  htmlFor="booking-address"
                  hint="Pick from the list so we can measure the delivery."
                  error={errors["address.label"]}
                >
                  <AddressAutocomplete
                    id="booking-address"
                    onSelect={handleAddressSelect}
                    onClear={handleAddressClear}
                    onUnavailable={setDistanceError}
                  />
                </Field>

                {distanceStatus === "loading" && (
                  <p className="flex items-center gap-2 text-[0.875rem] text-ink/55">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-royal" />
                    Measuring the drive&hellip;
                  </p>
                )}

                {distanceStatus === "done" && !outOfArea && (
                  <p className="flex items-center gap-2 text-[0.875rem] text-ink/60">
                    <Check className="h-3.5 w-3.5 text-royal" />
                    {distanceMiles} miles out — delivery{" "}
                    {formatCurrency(estimate.deliveryFee)}
                    {capped && " (capped)"}
                  </p>
                )}

                {outOfArea && distanceMiles !== null && (
                  <div className="rounded-2xl bg-aqua/15 px-4 py-4">
                    <p className="text-[0.9375rem] font-semibold text-ink">
                      That address is about {distanceMiles} miles out.
                    </p>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink/70">
                      We book pickups within {MAX_SERVICE_RADIUS_MILES} miles, so
                      we can&rsquo;t quote you yet. Next step is just your
                      contact details — we&rsquo;ll tell you when we reach your
                      area.
                    </p>
                    <a
                      href={BUSINESS.phoneHref}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-royal hover:text-ember"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Or call {BUSINESS.phoneDisplay}
                    </a>
                  </div>
                )}

                {distanceStatus === "error" && distanceError && (
                  <p role="alert" className="text-[0.875rem] text-ember">
                    {distanceError}
                  </p>
                )}

                {!outOfArea && (
                  <Field
                    label="Access notes"
                    htmlFor="booking-access"
                    hint="Apartment number, gate code, where to leave the bag. Optional."
                  >
                    <input
                      id="booking-access"
                      type="text"
                      value={addressNotes}
                      onChange={(e) => setAddressNotes(e.target.value)}
                      placeholder="Apt 4B, gate code 1234, leave by the door"
                      className={inputClass}
                    />
                  </Field>
                )}
              </>
            )}

            {/* 2 — When (booking) / Contact (waitlist) */}
            {mode === "booking" && step === 2 && (
              <>
                <Field
                  label="Pickup day"
                  htmlFor="booking-date"
                  error={errors["pickup.date"]}
                >
                  <input
                    id="booking-date"
                    type="date"
                    value={pickupDate}
                    min={bounds.min}
                    max={bounds.max}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className={cn(inputClass, "sm:max-w-xs")}
                  />
                </Field>

                <Field
                  label="Pickup window"
                  error={errors["pickup.windowId"]}
                  hint={
                    windows.length > 1
                      ? "We run a day and a night shift on weekdays."
                      : undefined
                  }
                >
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {windows.map((window) => (
                      <button
                        key={window.id}
                        type="button"
                        onClick={() => {
                          setWindowId(window.id);
                          clearError("pickup.windowId");
                        }}
                        aria-pressed={windowId === window.id}
                        className={cn(
                          "rounded-2xl px-4 py-3 text-left font-mono text-[0.875rem] tracking-wide transition-colors",
                          windowId === window.id
                            ? "bg-royal text-white"
                            : "bg-white/85 text-ink/70 ring-1 ring-inset ring-ink/10 hover:ring-royal/40"
                        )}
                      >
                        {window.label}
                      </button>
                    ))}
                    {windows.length === 0 && (
                      <p className="text-[0.875rem] leading-relaxed text-ink/55">
                        No windows left on that day. Try the next one.
                      </p>
                    )}
                  </div>
                </Field>
              </>
            )}

            {/* 3 — Speed (turnaround only) */}
            {mode === "booking" && step === 3 && (
              <Field
                label="How fast do you need it back?"
                error={errors["service.tierId"]}
              >
                <div className="grid gap-2.5">
                  {TURNAROUND_TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setTierId(tier.id)}
                      aria-pressed={tierId === tier.id}
                      className={cn(
                        "flex items-baseline justify-between gap-4 rounded-2xl px-5 py-4 text-left transition-colors",
                        tierId === tier.id
                          ? "bg-royal text-white"
                          : "bg-white/85 ring-1 ring-inset ring-ink/10 hover:ring-royal/40"
                      )}
                    >
                      <span>
                        <span className="block text-[1.0625rem] font-semibold tracking-tight">
                          {tier.label}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block text-[0.875rem]",
                            tierId === tier.id
                              ? "text-white/70"
                              : "text-ink/55"
                          )}
                        >
                          {tier.summary}
                        </span>
                      </span>
                      <span className="tabular shrink-0 font-display text-xl">
                        {formatCurrency(tier.ratePerLb)}
                        <span
                          className={cn(
                            "ml-1 font-mono text-[0.75rem]",
                            tierId === tier.id
                              ? "text-white/60"
                              : "text-ink/45"
                          )}
                        >
                          /lb
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
            )}

            {/* 4 — Bag weight, add-ons, notes */}
            {mode === "booking" && step === 4 && (
              <>
                <Field
                  label={`Roughly how heavy? — ${weightLbs} lbs`}
                  htmlFor="booking-weight"
                  hint={`Just an estimate so we can quote. We weigh it at pickup. Orders are billed at a ${MIN_ORDER_LBS} lb minimum.`}
                  error={errors["service.estimatedWeightLbs"]}
                >
                  <input
                    id="booking-weight"
                    type="range"
                    min={4}
                    max={80}
                    step={2}
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink/10 accent-royal"
                  />
                  <div className="mt-1.5 flex justify-between font-mono text-[0.6875rem] text-ink/40">
                    <span>4 lbs</span>
                    <span>80 lbs</span>
                  </div>
                </Field>

                <Field label="Anything to add?" error={errors["service.addOnIds"]}>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {ADD_ONS.map((addOn) => (
                      <button
                        key={addOn.id}
                        type="button"
                        onClick={() => toggleAddOn(addOn.id)}
                        aria-pressed={addOnIds.includes(addOn.id)}
                        className={cn(
                          "rounded-2xl px-5 py-4 text-left transition-colors",
                          addOnIds.includes(addOn.id)
                            ? "bg-mint ring-2 ring-inset ring-mint"
                            : "bg-white/85 ring-1 ring-inset ring-ink/10 hover:ring-mint"
                        )}
                      >
                        <span className="flex items-center gap-2 text-[1rem] font-semibold tracking-tight text-ink">
                          {addOnIds.includes(addOn.id) && (
                            <Check className="h-4 w-4" strokeWidth={2.5} />
                          )}
                          {addOn.label}
                        </span>
                        <span className="mt-0.5 block font-mono text-[0.75rem] tracking-wide text-ink/55">
                          {addOn.rateLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                </Field>

                <Field
                  label="Special instructions"
                  htmlFor="booking-instructions"
                  hint="Delicates, heavy stains, anything that needs different handling. Optional."
                >
                  <textarea
                    id="booking-instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                    placeholder="The grey blanket is delicate, please air dry"
                    className="w-full rounded-2xl border border-ink/10 bg-white/85 px-4 py-3.5 font-geist text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-royal/60"
                  />
                </Field>
              </>
            )}

            {/* Contact — booking step 5 or waitlist step 2 */}
            {((mode === "booking" && step === 5) ||
              (mode === "waitlist" && step === 2)) && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="First name"
                    htmlFor="booking-first-name"
                    error={errors["contact.firstName"]}
                  >
                    <input
                      id="booking-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        clearError("contact.firstName");
                      }}
                      autoComplete="given-name"
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Last name"
                    htmlFor="booking-last-name"
                    error={errors["contact.lastName"]}
                  >
                    <input
                      id="booking-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        clearError("contact.lastName");
                      }}
                      autoComplete="family-name"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Phone"
                    htmlFor="booking-phone"
                    error={errors["contact.phone"]}
                  >
                    <input
                      id="booking-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        clearError("contact.phone");
                      }}
                      autoComplete="tel"
                      placeholder="(619) 555 0142"
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Email"
                    htmlFor="booking-email"
                    error={errors["contact.email"]}
                  >
                    <input
                      id="booking-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("contact.email");
                      }}
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </>
            )}

            {/* Policy + Stripe note — booking confirm only */}
            {mode === "booking" && step === 6 && (
              <>
                <div className="rounded-2xl bg-white/70 px-5 py-5 ring-1 ring-inset ring-ink/8">
                  <p className="text-[1.0625rem] font-semibold tracking-tight text-ink">
                    {CANCELLATION_POLICY.headline}
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {CANCELLATION_POLICY.terms.map((term) => (
                      <li
                        key={term}
                        className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-ink/70"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-royal"
                        />
                        {term}
                      </li>
                    ))}
                  </ul>

                  <label
                    htmlFor="booking-policy"
                    className={cn(
                      "mt-5 flex cursor-pointer items-start gap-3 rounded-2xl px-4 py-4 transition-colors",
                      acceptedPolicy
                        ? "bg-mint/25"
                        : "bg-white/85 ring-1 ring-inset ring-ink/10"
                    )}
                  >
                    <input
                      id="booking-policy"
                      type="checkbox"
                      checked={acceptedPolicy}
                      onChange={(e) => {
                        setAcceptedPolicy(e.target.checked);
                        clearError("acceptedCancellationPolicy");
                      }}
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-royal"
                    />
                    <span className="text-[0.9375rem] leading-relaxed text-ink/80">
                      {CANCELLATION_POLICY.agreement}
                    </span>
                  </label>

                  {errors["acceptedCancellationPolicy"] && (
                    <p
                      role="alert"
                      className="mt-2 flex items-start gap-1.5 text-[0.8125rem] text-ember"
                    >
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {errors["acceptedCancellationPolicy"]}
                    </p>
                  )}
                </div>

                {stripeEnabled && (
                  <div className="flex items-start gap-3 rounded-2xl bg-royal/8 px-4 py-4 text-[0.9375rem] leading-relaxed text-ink/75">
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
                    <p>
                      Next you&rsquo;ll save a card on Stripe&rsquo;s secure
                      checkout — nothing is charged now. After that we confirm
                      the pickup automatically.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {formError && (
            <p
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-2xl bg-ember/10 px-4 py-3 text-[0.875rem] leading-relaxed text-ink"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
              {formError}
            </p>
          )}

          {/* Sticky-feeling footer actions on the left panel */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => goToStep(step - 1)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 font-semibold text-ink ring-1 ring-inset ring-ink/12 transition-colors hover:bg-white/70"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}

            {/*
              Always type="button" + remount with key. If Next becomes a submit
              button in the same click, the browser fires submit on empty
              confirm fields and the next step opens covered in errors.
            */}
            <button
              key={`forward-${step}`}
              type="button"
              disabled={status === "submitting"}
              onClick={() => {
                if (isLastStep) {
                  void handleSubmit({
                    preventDefault() {},
                  } as React.FormEvent);
                } else {
                  handleNext();
                }
              }}
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50",
                isLastStep && mode !== "waitlist" ? "bg-ember" : "bg-royal"
              )}
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending&hellip;
                </>
              ) : !isLastStep ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : mode === "waitlist" ? (
                "Tell me when you reach me"
              ) : stripeEnabled ? (
                "Continue to secure card"
              ) : (
                "Book this pickup"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Running estimate */}
      <div className="lg:col-span-4">
        <div className="glass sticky top-28 rounded-[28px] p-7 sm:p-8">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-royal">
            {mode === "waitlist" ? "Not yet in range" : "Your estimate"}
          </p>

          {mode === "waitlist" && (
            <>
              <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink/75">
                We can&rsquo;t price a pickup {distanceMiles} miles out just
                yet. Leave your details and we&rsquo;ll be in touch the moment
                that changes.
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/55">
                We only use them to tell you when we reach your area.
              </p>
            </>
          )}

          <dl
            className={cn(
              "mt-5 divide-y divide-ink/10",
              mode === "waitlist" && "hidden"
            )}
          >
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
                    ? "Add your address"
                    : capped
                      ? `${distanceMiles} mi · capped at ${formatCurrency(
                          DELIVERY_FEE_CAP
                        )}`
                      : `${distanceMiles} mi`}
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

          {mode === "booking" && (
            <div className="mt-4 flex items-baseline justify-between gap-4 border-t-2 border-ink pt-5">
              <span className="text-[1.0625rem] font-semibold text-ink">
                Estimated total
              </span>
              <span className="tabular font-display text-[2rem] leading-none tracking-tight text-ink">
                {formatCurrency(estimate.total)}
              </span>
            </div>
          )}

          {mode === "booking" && estimate.minimumApplied && (
            <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-royal/8 px-4 py-3 text-[0.8125rem] leading-relaxed text-ink/70">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-royal" />
              Billed at our {MIN_ORDER_LBS} lb minimum. If your bag comes in
              lighter, we may credit the difference to your next order.
            </p>
          )}

          <p className="mt-5 text-[0.8125rem] leading-relaxed text-ink/45">
            {mode === "booking"
              ? isLastStep
                ? stripeEnabled
                  ? "Next step is Stripe Checkout to save a card — no charge. We weigh your bag at pickup."
                  : "No payment is taken now. We weigh your bag at pickup and that weight is what you pay for."
                : `Step ${step} of ${totalSteps} — estimate updates as you go.`
              : "Out of range for booking — join the waitlist on the left."}
          </p>
        </div>
      </div>
    </form>
  );
}
