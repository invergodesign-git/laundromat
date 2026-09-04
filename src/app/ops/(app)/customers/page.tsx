"use client";

import { useMemo, useState } from "react";
import { useOpsStore } from "@/lib/ops/store";

export default function OpsCustomersPage() {
  const { customers } = useOpsStore();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.firstName, c.lastName, c.email, c.phone, c.neighbourhood]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [customers, query]);

  return (
    <div>
      <div className="max-w-2xl">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-royal">
          Customers
        </p>
        <h1 className="mt-2 font-display text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-tight text-ink">
          Guest accounts
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/60">
          Built from bookings — first name, last name, email, phone. No login
          forced on the customer.
        </p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search customers…"
        className="mt-8 h-11 w-full max-w-md rounded-2xl bg-white px-4 text-[0.9375rem] outline-none ring-1 ring-inset ring-ink/10 focus:ring-2 focus:ring-royal"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((customer) => (
          <article
            key={customer.id}
            className="rounded-[24px] bg-white p-6 ring-1 ring-inset ring-ink/8"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-xl tracking-tight text-ink">
                {customer.firstName} {customer.lastName}
              </h2>
              {customer.orderCount > 1 && (
                <span className="rounded-full bg-mint/25 px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink/70">
                  Repeat
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink/40">
              {customer.neighbourhood}
            </p>
            <dl className="mt-5 space-y-2 text-[0.875rem]">
              <div>
                <dt className="text-ink/40">Phone</dt>
                <dd className="font-medium text-ink">{customer.phone}</dd>
              </div>
              <div>
                <dt className="text-ink/40">Email</dt>
                <dd className="break-all font-medium text-ink">
                  {customer.email}
                </dd>
              </div>
              <div>
                <dt className="text-ink/40">Orders</dt>
                <dd className="font-medium text-ink">{customer.orderCount}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
