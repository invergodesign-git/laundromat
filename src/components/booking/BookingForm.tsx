"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  Loader2,
  Phone,
  Sparkles,
} from "lucide-react";
import { AddressAutocomplete } from "@/components/concept/AddressAutocomplete";
import {
  BUSINESS,
  businessDatePlus,
  firstBookableDate,
  pickupWindowsForDate,
} from "@/lib/business";
import { fetchDistanceMiles } from "@/lib/geo/client";
import { GeoError, type AddressSuggestion } from "@/lib/geo/types";
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
}

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

  const [name, setName] = useState("");
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

  const [errors, setErrors] = useState<OrderFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [success, setSuccess] = useState<Success | null>(null);

  const windows = useMemo(() => pickupWindowsForDate(pickupDate), [pickupDate]);

  const outOfArea =
    distanceStatus === "done" &&
    distanceMiles !== null &&
    !isWithinServiceArea(distanceMiles);
  const hasDistance =
    distanceStatus === "done" && distanceMiles !== null && !outOfArea;

  const estimate = calculateEstimate({
    weightLbs,
    distanceMiles: hasDistance ? distanceMiles : 0,
    tierId,
    addOnIds,
  });
  const capped = hasDistance && isDeliveryCapped(distanceMiles);

  const clearError = (field: string) =>
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setFormError(null);
    setErrors({});

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: { name, phone, email },
          address: {
            label: address?.label ?? "",
            context: address?.context ?? "",
            lat: address?.lat,
            lon: address?.lon,
            notes: addressNotes,
          },
          service: { tierId, addOnIds, estimatedWeightLbs: weightLbs },
          pickup: { date: pickupDate, windowId },
          instructions,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(payload.fields ?? {});
        setFormError(
          payload.error ?? "We could not submit that booking. Please try again."
        );
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
          Nothing has been charged. We weigh your bag when we collect it, and
          that weight is what you pay for.
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

  // ---- Form ----------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-12">
      <div className="grid gap-8 lg:col-span-7">
        {/* Where */}
        <fieldset className="glass rounded-[28px] p-7 sm:p-9">
          <legend className="px-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-royal">
            Where we collect
          </legend>

          <div className="mt-4 grid gap-5">
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
              <div className="rounded-2xl bg-ember/8 px-4 py-4">
                <p className="text-[0.9375rem] font-semibold text-ink">
                  That address is about {distanceMiles} miles out.
                </p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink/65">
                  We book pickups within {MAX_SERVICE_RADIUS_MILES} miles. Give
                  us a call — longer runs are often still possible, we just
                  price them by hand.
                </p>
                <a
                  href={BUSINESS.phoneHref}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-royal hover:text-ember"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call {BUSINESS.phoneDisplay}
                </a>
              </div>
            )}

            {distanceStatus === "error" && distanceError && (
              <p role="alert" className="text-[0.875rem] text-ember">
                {distanceError}
              </p>
            )}

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
          </div>
        </fieldset>

        {/* When */}
        <fieldset className="glass rounded-[28px] p-7 sm:p-9">
          <legend className="px-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-royal">
            When
          </legend>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
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
                className={inputClass}
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
              <div className="grid gap-2">
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
              </div>
            </Field>
          </div>
        </fieldset>

        {/* What */}
        <fieldset className="glass rounded-[28px] p-7 sm:p-9">
          <legend className="px-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-royal">
            What you need
          </legend>

          <div className="mt-4 grid gap-6">
            <Field label="How fast do you need it back?" error={errors["service.tierId"]}>
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
                          tierId === tier.id ? "text-white/70" : "text-ink/55"
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
                          tierId === tier.id ? "text-white/60" : "text-ink/45"
                        )}
                      >
                        /lb
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </Field>

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
          </div>
        </fieldset>

        {/* Who */}
        <fieldset className="glass rounded-[28px] p-7 sm:p-9">
          <legend className="px-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-royal">
            Who we&rsquo;re collecting from
          </legend>

          <div className="mt-4 grid gap-5">
            <Field label="Name" htmlFor="booking-name" error={errors["contact.name"]}>
              <input
                id="booking-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError("contact.name");
                }}
                autoComplete="name"
                className={inputClass}
              />
            </Field>

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
          </div>
        </fieldset>
      </div>

      {/* Running estimate */}
      <div className="lg:col-span-5">
        <div className="glass sticky top-28 rounded-[28px] p-7 sm:p-9">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-royal">
            Your estimate
          </p>

          <dl className="mt-5 divide-y divide-ink/10">
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

          <div className="mt-4 flex items-baseline justify-between gap-4 border-t-2 border-ink pt-5">
            <span className="text-[1.0625rem] font-semibold text-ink">
              Estimated total
            </span>
            <span className="tabular font-display text-[2rem] leading-none tracking-tight text-ink">
              {formatCurrency(estimate.total)}
            </span>
          </div>

          {estimate.minimumApplied && (
            <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-royal/8 px-4 py-3 text-[0.8125rem] leading-relaxed text-ink/70">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-royal" />
              Billed at our {MIN_ORDER_LBS} lb minimum. If your bag comes in
              lighter, we may credit the difference to your next order.
            </p>
          )}

          {formError && (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-2xl bg-ember/10 px-4 py-3 text-[0.875rem] leading-relaxed text-ink"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting" || outOfArea}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ember font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending&hellip;
              </>
            ) : (
              "Book this pickup"
            )}
          </button>

          <p className="mt-4 text-[0.75rem] leading-relaxed text-ink/45">
            No payment is taken now. We weigh your bag at pickup and that weight
            is what you pay for — this is an estimate based on the weight you
            gave us.
          </p>
        </div>
      </div>
    </form>
  );
}
