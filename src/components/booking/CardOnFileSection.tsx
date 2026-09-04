"use client";

import { useEffect } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { getStripePublishableKey } from "@/lib/stripe/client";

let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise() {
  if (!stripePromise) {
    const key = getStripePublishableKey();
    stripePromise = key ? loadStripe(key) : Promise.resolve(null);
  }
  return stripePromise;
}

export interface SavedCardResult {
  customerId: string;
  paymentMethodId: string;
  setupIntentId: string;
}

export type SaveCardFn = () => Promise<SavedCardResult>;

/**
 * Stripe Payment Element in deferred setup mode — card is collected here,
 * SetupIntent is created + confirmed only when the parent calls `saveCard`.
 */
export function CardOnFileSection({
  firstName,
  lastName,
  email,
  phone,
  saveCardRef,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  saveCardRef: React.MutableRefObject<SaveCardFn | null>;
}) {
  // Must match SetupIntent creation (payment_method_types: ["card"]).
  // Without paymentMethodTypes, Elements defaults to automatic payment
  // methods and confirmSetup fails against a card-only SetupIntent.
  const options = {
    mode: "setup" as const,
    currency: "usd",
    paymentMethodTypes: ["card"] as string[],
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#4536d6",
        colorBackground: "#ffffff",
        colorText: "#141229",
        colorDanger: "#ff6a2b",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "16px",
      },
    },
  };

  if (!getStripePublishableKey()) {
    return (
      <p className="rounded-2xl bg-ember/10 px-4 py-3 text-[0.875rem] text-ink">
        Card saving is not configured on this deployment.
      </p>
    );
  }

  return (
    <Elements stripe={getStripePromise()} options={options}>
      <CardOnFileFields
        firstName={firstName}
        lastName={lastName}
        email={email}
        phone={phone}
        saveCardRef={saveCardRef}
      />
    </Elements>
  );
}

function CardOnFileFields({
  firstName,
  lastName,
  email,
  phone,
  saveCardRef,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  saveCardRef: React.MutableRefObject<SaveCardFn | null>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    saveCardRef.current = async () => {
      if (!stripe || !elements) {
        throw new Error(
          "Card form is still loading. Wait a moment and try again."
        );
      }

      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message ?? "Check the card details.");
      }

      const setupResponse = await fetch("/api/book/setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone }),
      });
      const setupPayload = await setupResponse.json().catch(() => ({}));
      if (!setupResponse.ok) {
        throw new Error(
          setupPayload.error ?? "We could not start saving that card."
        );
      }

      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        clientSecret: setupPayload.clientSecret as string,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: `${firstName} ${lastName}`.trim(),
              email,
              phone: phone || undefined,
            },
          },
          return_url: `${window.location.origin}/book`,
        },
        redirect: "if_required",
      });

      if (error) {
        throw new Error(error.message ?? "That card could not be saved.");
      }

      const paymentMethodId =
        typeof setupIntent?.payment_method === "string"
          ? setupIntent.payment_method
          : setupIntent?.payment_method?.id;

      if (!paymentMethodId || setupIntent?.status !== "succeeded") {
        throw new Error("The card was not saved. Please try again.");
      }

      return {
        customerId: setupPayload.customerId as string,
        paymentMethodId,
        setupIntentId: (setupIntent.id ??
          setupPayload.setupIntentId) as string,
      };
    };

    return () => {
      saveCardRef.current = null;
    };
  }, [stripe, elements, firstName, lastName, email, phone, saveCardRef]);

  return (
    <div className="mt-4">
      <div className="mb-4 flex items-start gap-3 rounded-2xl bg-royal/8 px-4 py-3 text-[0.875rem] leading-relaxed text-ink/70">
        <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
        <p>
          Nothing is charged now. We save the card so we can bill the real
          weight after pickup — or a cancellation fee if the bag is not ready
          when we arrive.
        </p>
      </div>

      {!ready && (
        <p className="mb-3 flex items-center gap-2 text-[0.8125rem] text-ink/45">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading secure card form…
        </p>
      )}

      <PaymentElement
        onReady={() => setReady(true)}
        options={{
          layout: "tabs",
          paymentMethodOrder: ["card"],
        }}
      />
    </div>
  );
}

export function CardError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mt-3 flex items-start gap-1.5 text-[0.8125rem] text-ember"
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}
