"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { businessToday } from "@/lib/business";
import { useOpsStore } from "@/lib/ops/store";
import { StatusPill, StatChip } from "@/components/ops/OpsUi";
import { formatCurrency } from "@/lib/utils";

export default function OpsMoneyPage() {
  const { orders, charge } = useOpsStore();
  const [confirming, setConfirming] = useState<string | null>(null);
  const today = businessToday();

  const todaysEstimates = useMemo(
    () =>
      orders
        .filter((o) => o.pickup.date === today)
        .reduce((sum, o) => sum + o.chargeAmount, 0),
    [orders, today]
  );

  const ready = useMemo(
    () =>
      orders.filter(
        (o) => o.paymentStatus === "ready" || o.paymentStatus === "cancelled-fee"
      ),
    [orders]
  );

  const readyTotal = ready.reduce((sum, o) => sum + o.chargeAmount, 0);
  const paidToday = orders.filter(
    (o) => o.paymentStatus === "paid" && o.pickup.date === today
  );

  return (
    <div>
      <div className="max-w-2xl">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-royal">
          Money
        </p>
        <h1 className="mt-2 font-display text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-tight text-ink">
          Charge the card
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/60">
          Card on file at booking — charge the real weight after pickup, or a
          cancellation fee on a no-show. Demo only until Stripe is connected.
        </p>
      </div>

      <div className="mt-6 rounded-[22px] bg-royal/8 px-5 py-4 text-[0.875rem] leading-relaxed text-ink/70 ring-1 ring-inset ring-royal/20">
        Demo — live charges come after Stripe is connected. Buttons here only
        flip the sample data.
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <StatChip
          label="Today's estimates"
          value={formatCurrency(todaysEstimates)}
          tone="royal"
        />
        <StatChip
          label="Ready to charge"
          value={formatCurrency(readyTotal)}
          tone="ember"
        />
        <StatChip
          label="Paid (today's pickups)"
          value={paidToday.length}
          tone="mint"
        />
      </div>

      <h2 className="mt-10 font-display text-2xl tracking-tight text-ink">
        Ready to charge
      </h2>

      <ul className="mt-4 space-y-3">
        {ready.map((order) => (
          <li
            key={order.reference}
            className="flex flex-col gap-4 rounded-[24px] bg-white p-5 ring-1 ring-inset ring-ink/8 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/ops/orders/${order.reference}`}
                  className="font-semibold tracking-tight text-ink hover:text-royal"
                >
                  {order.contact.firstName} {order.contact.lastName}
                </Link>
                <StatusPill status={order.status} />
              </div>
              <p className="mt-1 text-[0.875rem] text-ink/55">
                {order.reference} · •••• {order.cardLast4} ·{" "}
                {order.paymentStatus === "cancelled-fee"
                  ? "Cancellation fee"
                  : order.actualWeightLbs != null
                    ? `${order.actualWeightLbs} lb weighed`
                    : "Estimate"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className="font-display text-2xl text-ink">
                {formatCurrency(order.chargeAmount)}
              </p>
              {confirming === order.reference ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      charge(order.reference);
                      setConfirming(null);
                    }}
                    className="h-10 rounded-full bg-ember px-4 text-[0.8125rem] font-semibold text-white"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(null)}
                    className="h-10 rounded-full bg-foam px-4 text-[0.8125rem] font-semibold text-ink/70"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(order.reference)}
                  className="h-10 rounded-full bg-ink px-4 text-[0.8125rem] font-semibold text-white"
                >
                  Charge
                </button>
              )}
            </div>
          </li>
        ))}
        {ready.length === 0 && (
          <li className="rounded-[24px] bg-white p-8 text-center text-ink/50 ring-1 ring-inset ring-ink/8">
            Nothing waiting to charge. Collect a bag or mark a no-show on an
            order first.
          </li>
        )}
      </ul>
    </div>
  );
}
