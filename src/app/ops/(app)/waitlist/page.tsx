"use client";

import { useOpsStore } from "@/lib/ops/store";

export default function OpsWaitlistPage() {
  const { waitlist } = useOpsStore();

  return (
    <div>
      <div className="max-w-2xl">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-royal">
          Waitlist
        </p>
        <h1 className="mt-2 font-display text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-tight text-ink">
          Out of area
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/60">
          These are not bookings. Nobody is expecting a pickup — they asked to
          hear when you reach their area.
        </p>
      </div>

      <div className="mt-6 rounded-[22px] bg-aqua/15 px-5 py-4 text-[0.875rem] leading-relaxed text-ink/75 ring-1 ring-inset ring-aqua/40">
        Not a booking. Kept separate so real pickups never get buried under
        expansion leads.
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {waitlist.map((lead) => (
          <article
            key={lead.id}
            className="rounded-[24px] bg-white p-6 ring-1 ring-inset ring-ink/8"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl tracking-tight text-ink">
                  {lead.contact.firstName} {lead.contact.lastName}
                </h2>
                <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink/40">
                  {lead.neighbourhood}
                </p>
              </div>
              <span className="rounded-full bg-ember/10 px-2.5 py-1 font-mono text-[0.6875rem] tracking-wide text-ember">
                {lead.distanceMiles} mi
              </span>
            </div>
            <p className="mt-4 text-[0.9375rem] text-ink/70">
              {lead.address.label}
              <br />
              {lead.address.context}
            </p>
            <dl className="mt-4 space-y-1.5 text-[0.875rem]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink/40">Phone</dt>
                <dd className="font-medium text-ink">{lead.contact.phone}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink/40">Email</dt>
                <dd className="break-all text-right font-medium text-ink">
                  {lead.contact.email}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
