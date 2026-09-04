"use client";

import { businessToday, getPickupWindow } from "@/lib/business";
import { useOpsStore } from "@/lib/ops/store";
import { OrderCard, StatChip } from "@/components/ops/OpsUi";

export default function OpsTodayPage() {
  const { orders } = useOpsStore();
  const today = businessToday();
  const todays = orders.filter((o) => o.pickup.date === today);

  const due = todays.filter(
    (o) => o.status === "booked" || o.status === "out-for-pickup"
  ).length;
  const out = todays.filter((o) => o.status === "out-for-pickup").length;
  const noShows = todays.filter((o) => o.status === "no-show").length;

  const byWindow = new Map<string, typeof todays>();
  for (const order of todays) {
    const key = order.pickup.windowId;
    const list = byWindow.get(key) ?? [];
    list.push(order);
    byWindow.set(key, list);
  }

  const windowOrder = ["weekday-day", "weekday-night", "weekend-day"];

  return (
    <div>
      <div className="max-w-2xl">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-royal">
          Today
        </p>
        <h1 className="mt-2 font-display text-[clamp(2rem,4vw,2.75rem)] leading-none tracking-tight text-ink">
          Dispatch board
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/60">
          What the van is collecting {today}. Tap a card to open the order.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <StatChip label="Due today" value={due} tone="royal" />
        <StatChip label="Out for pickup" value={out} tone="mint" />
        <StatChip label="No-shows" value={noShows} tone="ember" />
      </div>

      {todays.length === 0 ? (
        <p className="mt-12 rounded-[24px] bg-white p-8 text-ink/60 ring-1 ring-inset ring-ink/8">
          No pickups on the board for today in this demo seed.
        </p>
      ) : (
        <div className="mt-10 space-y-10">
          {windowOrder
            .filter((id) => byWindow.has(id))
            .map((windowId) => {
              const window = getPickupWindow(windowId);
              const list = byWindow.get(windowId) ?? [];
              return (
                <section key={windowId}>
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink/40">
                        Pickup window
                      </p>
                      <h2 className="mt-1 font-display text-2xl tracking-tight text-ink">
                        {window?.label ?? windowId}
                      </h2>
                    </div>
                    <span className="font-mono text-[0.75rem] text-ink/40">
                      {list.length} stop{list.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {list.map((order) => (
                      <OrderCard key={order.reference} order={order} />
                    ))}
                  </div>
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}
