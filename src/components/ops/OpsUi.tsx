import Link from "next/link";
import { getPickupWindow } from "@/lib/business";
import { getTier } from "@/lib/pricing";
import type { OpsOrder, OpsStatus } from "@/lib/ops/types";
import { OPS_STATUS_LABEL } from "@/lib/ops/types";
import { cn, formatCurrency } from "@/lib/utils";

export function StatusPill({
  status,
  className,
}: {
  status: OpsStatus;
  className?: string;
}) {
  const tone: Record<OpsStatus, string> = {
    booked: "bg-royal/10 text-royal",
    "out-for-pickup": "bg-aqua/25 text-ink",
    collected: "bg-mint/25 text-ink",
    washing: "bg-lavender/15 text-royal",
    "out-for-delivery": "bg-ember/15 text-ember",
    delivered: "bg-ink/8 text-ink/70",
    "no-show": "bg-blush/25 text-ink",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em]",
        tone[status],
        className
      )}
    >
      {OPS_STATUS_LABEL[status]}
    </span>
  );
}

export function OrderCard({ order }: { order: OpsOrder }) {
  const window = getPickupWindow(order.pickup.windowId);
  const tier = getTier(order.service.tierId);

  return (
    <Link
      href={`/ops/orders/${order.reference}`}
      className="block rounded-[24px] bg-white p-5 ring-1 ring-inset ring-ink/8 transition-transform hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-30px_rgba(20,18,41,0.45)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl tracking-tight text-ink">
            {order.contact.firstName} {order.contact.lastName}
          </p>
          <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink/40">
            {order.neighbourhood} · {order.reference}
          </p>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-[0.875rem] text-ink/65">
        <div>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink/35">
            Window
          </p>
          <p className="mt-0.5 font-medium text-ink">
            {window?.label ?? order.pickup.windowId}
          </p>
        </div>
        <div>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink/35">
            Bag
          </p>
          <p className="mt-0.5 font-medium text-ink">
            {order.actualWeightLbs ?? order.service.estimatedWeightLbs} lb
            {order.actualWeightLbs == null ? " est." : ""}
          </p>
        </div>
        <div>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink/35">
            Service
          </p>
          <p className="mt-0.5 font-medium text-ink">{tier.label}</p>
        </div>
        <div>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink/35">
            Estimate
          </p>
          <p className="mt-0.5 font-medium text-ink">
            {formatCurrency(order.chargeAmount)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function StatChip({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "ember" | "mint" | "royal";
}) {
  const tones = {
    default: "bg-white ring-ink/8",
    ember: "bg-ember/10 ring-ember/20",
    mint: "bg-mint/15 ring-mint/30",
    royal: "bg-royal/10 ring-royal/20",
  };
  return (
    <div
      className={cn(
        "rounded-[22px] px-5 py-4 ring-1 ring-inset",
        tones[tone]
      )}
    >
      <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink/45">
        {label}
      </p>
      <p className="mt-1 font-display text-[1.75rem] leading-none tracking-tight text-ink">
        {value}
      </p>
    </div>
  );
}
