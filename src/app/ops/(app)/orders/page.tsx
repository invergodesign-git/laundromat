"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getTier } from "@/lib/pricing";
import { useOpsStore } from "@/lib/ops/store";
import { OPS_STATUSES, OPS_STATUS_LABEL, type OpsStatus } from "@/lib/ops/types";
import { StatusPill } from "@/components/ops/OpsUi";
import { cn, formatCurrency } from "@/lib/utils";

export default function OpsOrdersPage() {
  const { orders } = useOpsStore();
  const [status, setStatus] = useState<OpsStatus | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...orders]
      .filter((o) => (status === "all" ? true : o.status === status))
      .filter((o) => {
        if (!q) return true;
        const hay = [
          o.reference,
          o.contact.firstName,
          o.contact.lastName,
          o.contact.email,
          o.neighbourhood,
          o.address.label,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  }, [orders, status, query]);

  return (
    <div>
      <div className="max-w-2xl">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-royal">
          Orders
        </p>
        <h1 className="mt-2 font-display text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-tight text-ink">
          Every pickup
        </h1>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, reference, area…"
          className="h-11 flex-1 rounded-2xl bg-white px-4 text-[0.9375rem] outline-none ring-1 ring-inset ring-ink/10 focus:ring-2 focus:ring-royal"
        />
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={status === "all"}
            onClick={() => setStatus("all")}
            label="All"
          />
          {OPS_STATUSES.map((s) => (
            <FilterChip
              key={s}
              active={status === s}
              onClick={() => setStatus(s)}
              label={OPS_STATUS_LABEL[s]}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] bg-white ring-1 ring-inset ring-ink/8">
        <ul className="divide-y divide-ink/8">
          {filtered.map((order) => {
            const tier = getTier(order.service.tierId);
            return (
              <li key={order.reference}>
                <Link
                  href={`/ops/orders/${order.reference}`}
                  className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-foam/80 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold tracking-tight text-ink">
                        {order.contact.firstName} {order.contact.lastName}
                      </p>
                      <StatusPill status={order.status} />
                    </div>
                    <p className="mt-1 truncate text-[0.875rem] text-ink/55">
                      {order.reference} · {order.neighbourhood} · {tier.label} ·{" "}
                      {order.pickup.date}
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-xl text-ink">
                    {formatCurrency(order.chargeAmount)}
                  </p>
                </Link>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-5 py-10 text-center text-ink/50">
              Nothing matches that filter.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.1em] transition-colors",
        active
          ? "bg-royal text-white"
          : "bg-white text-ink/55 ring-1 ring-inset ring-ink/10 hover:text-ink"
      )}
    >
      {label}
    </button>
  );
}
