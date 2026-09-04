"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Banknote,
  CalendarDays,
  ExternalLink,
  LogOut,
  MapPin,
  RotateCcw,
  Users,
  ClipboardList,
} from "lucide-react";
import { BUSINESS } from "@/lib/business";
import { useOpsStore } from "@/lib/ops/store";
import { cn } from "@/lib/utils";

const NAV: {
  href: string;
  label: string;
  icon: typeof CalendarDays;
  exact?: boolean;
}[] = [
  { href: "/ops", label: "Today", icon: CalendarDays, exact: true },
  { href: "/ops/orders", label: "Orders", icon: ClipboardList },
  { href: "/ops/customers", label: "Customers", icon: Users },
  { href: "/ops/waitlist", label: "Waitlist", icon: MapPin },
  { href: "/ops/money", label: "Money", icon: Banknote },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OpsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { reset } = useOpsStore();

  async function logout() {
    await fetch("/api/ops/logout", { method: "POST" });
    router.replace("/ops/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-foam text-ink">
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-foam/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="truncate font-display text-xl tracking-tight text-ink sm:text-2xl">
              {BUSINESS.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-aqua/25 px-2.5 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink/70">
                Demo data
              </span>
              <span className="hidden text-[0.75rem] text-ink/45 sm:inline">
                Not live bookings — refresh restores the sample day
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-3 text-[0.8125rem] font-medium text-ink/70 ring-1 ring-inset ring-ink/10 hover:text-ink"
              title="Reset demo"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-3 text-[0.8125rem] font-medium text-ink/70 ring-1 ring-inset ring-ink/10 hover:text-ink"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View site</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-3 text-[0.8125rem] font-medium text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px] gap-0 lg:gap-8 lg:px-8 lg:py-8">
        <aside className="hidden w-52 shrink-0 lg:block">
          <nav className="sticky top-24 flex flex-col gap-1 rounded-[28px] bg-white p-3 ring-1 ring-inset ring-ink/8">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(pathname, href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[0.9375rem] font-medium transition-colors",
                    active
                      ? "bg-royal text-white"
                      : "text-ink/65 hover:bg-foam hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-0 lg:pb-10 lg:pt-0">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-1 py-2.5 text-[0.625rem] font-medium uppercase tracking-[0.08em]",
                    active ? "text-royal" : "text-ink/40"
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5", active && "text-royal")}
                    strokeWidth={1.8}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
