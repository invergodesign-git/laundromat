"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPickupWindow } from "@/lib/business";
import { ADD_ONS, getTier } from "@/lib/pricing";
import { useOpsStore } from "@/lib/ops/store";
import {
  OPS_STATUS_LABEL,
  OPS_STATUS_NEXT,
  type OpsStatus,
} from "@/lib/ops/types";
import { StatusPill } from "@/components/ops/OpsUi";
import { cn, formatCurrency } from "@/lib/utils";

export default function OpsOrderDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);
  const { getOrder, setStatus, setActualWeight, charge } = useOpsStore();
  const order = getOrder(decodeURIComponent(reference));
  const [weightDraft, setWeightDraft] = useState("");

  if (!order) {
    return (
      <div className="rounded-[28px] bg-white p-8 ring-1 ring-inset ring-ink/8">
        <p className="text-ink/60">No order with that reference in the demo.</p>
        <Link href="/ops/orders" className="mt-4 inline-block font-semibold text-royal">
          Back to orders
        </Link>
      </div>
    );
  }

  const tier = getTier(order.service.tierId);
  const window = getPickupWindow(order.pickup.windowId);
  const next = OPS_STATUS_NEXT[order.status];
  const addOnLabels = ADD_ONS.filter((a) =>
    order.service.addOnIds.includes(a.id)
  ).map((a) => a.label);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/ops/orders"
        className="inline-flex items-center gap-2 text-[0.875rem] font-medium text-ink/55 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All orders
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-royal">
            {order.reference}
          </p>
          <h1 className="mt-2 font-display text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-tight text-ink">
            {order.contact.firstName} {order.contact.lastName}
          </h1>
          <p className="mt-2 text-ink/55">
            {order.neighbourhood} · {order.pickup.date}
          </p>
        </div>
        <StatusPill status={order.status} className="text-[0.6875rem]" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Section title="Contact">
          <Row label="Phone" value={order.contact.phone} />
          <Row label="Email" value={order.contact.email} />
        </Section>

        <Section title="Pickup">
          <Row label="Window" value={window?.label ?? order.pickup.windowId} />
          <Row label="Address" value={order.address.label} />
          <Row label="Area" value={order.address.context} />
          {order.address.notes && (
            <Row label="Notes" value={order.address.notes} />
          )}
        </Section>

        <Section title="Service">
          <Row label="Tier" value={tier.label} />
          <Row
            label="Est. weight"
            value={`${order.service.estimatedWeightLbs} lb`}
          />
          <Row
            label="Actual weight"
            value={
              order.actualWeightLbs != null
                ? `${order.actualWeightLbs} lb`
                : "Not weighed yet"
            }
          />
          {addOnLabels.length > 0 && (
            <Row label="Add-ons" value={addOnLabels.join(", ")} />
          )}
          {order.instructions && (
            <Row label="Instructions" value={order.instructions} />
          )}
        </Section>

        <Section title="Money">
          <Row label="Delivery" value={formatCurrency(order.deliveryFee)} />
          <Row label="Charge" value={formatCurrency(order.chargeAmount)} />
          <Row label="Card on file" value={`•••• ${order.cardLast4}`} />
          <Row
            label="Payment"
            value={
              order.paymentStatus === "paid"
                ? "Paid"
                : order.paymentStatus === "ready"
                  ? "Ready to charge"
                  : order.paymentStatus === "cancelled-fee"
                    ? "Cancellation fee"
                    : "Nothing charged"
            }
          />
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink/50">
            Cancellation policy accepted at booking.
          </p>
        </Section>
      </div>

      <Section title="Status timeline" className="mt-4">
        <ol className="space-y-3">
          {order.statusHistory.map((entry, i) => (
            <li key={`${entry.status}-${i}`} className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-royal" />
              <div>
                <p className="font-medium text-ink">
                  {OPS_STATUS_LABEL[entry.status]}
                </p>
                <p className="font-mono text-[0.6875rem] text-ink/40">
                  {new Date(entry.at).toLocaleString("en-US", {
                    timeZone: "America/Los_Angeles",
                  })}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {(order.status === "collected" ||
        order.status === "washing" ||
        order.status === "out-for-delivery") && (
        <Section title="Weigh the bag" className="mt-4">
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              min={1}
              step={1}
              placeholder={String(order.service.estimatedWeightLbs)}
              value={weightDraft}
              onChange={(e) => setWeightDraft(e.target.value)}
              className="h-11 w-28 rounded-2xl bg-foam px-3 outline-none ring-1 ring-inset ring-ink/10 focus:ring-2 focus:ring-royal"
            />
            <button
              type="button"
              onClick={() => {
                const lbs = Number(weightDraft);
                if (Number.isFinite(lbs) && lbs > 0) {
                  setActualWeight(order.reference, lbs);
                  setWeightDraft("");
                }
              }}
              className="h-11 rounded-full bg-royal px-5 text-[0.875rem] font-semibold text-white"
            >
              Update weight
            </button>
          </div>
        </Section>
      )}

      {next.length > 0 && (
        <Section title="Move forward" className="mt-4">
          <div className="flex flex-wrap gap-2">
            {next.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatus(order.reference, status as OpsStatus)}
                className={cn(
                  "h-11 rounded-full px-5 text-[0.875rem] font-semibold",
                  status === "no-show"
                    ? "bg-blush text-ink"
                    : "bg-ember text-white"
                )}
              >
                Mark {OPS_STATUS_LABEL[status]}
              </button>
            ))}
          </div>
        </Section>
      )}

      {(order.paymentStatus === "ready" || order.paymentStatus === "cancelled-fee") && (
        <Section title="Charge card" className="mt-4">
          <p className="text-[0.875rem] leading-relaxed text-ink/60">
            Demo only — nothing hits Stripe. Marks this order paid so you can
            walk the flow.
          </p>
          <button
            type="button"
            onClick={() => charge(order.reference)}
            className="mt-4 h-11 rounded-full bg-ink px-6 text-[0.875rem] font-semibold text-white"
          >
            Charge {formatCurrency(order.chargeAmount)} · •••• {order.cardLast4}
          </button>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[24px] bg-white p-6 ring-1 ring-inset ring-ink/8",
        className
      )}
    >
      <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink/40">
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.75rem] text-ink/40">{label}</p>
      <p className="mt-0.5 text-[0.9375rem] font-medium text-ink">{value}</p>
    </div>
  );
}
