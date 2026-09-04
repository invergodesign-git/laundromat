"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { BUSINESS } from "@/lib/business";

export function OpsLoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/ops";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/ops/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Could not sign in.");
        setBusy(false);
        return;
      }
      router.replace(next.startsWith("/ops") ? next : "/ops");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-[0_30px_70px_-40px_rgba(20,18,41,0.45)] ring-1 ring-inset ring-ink/8 sm:p-10"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-royal text-white">
        <Lock className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <h1 className="mt-6 font-display text-[2rem] leading-none tracking-tight text-ink">
        Ops desk
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/60">
        Private to {BUSINESS.legalName}. Not linked from the public site.
      </p>

      <label className="mt-8 block">
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink/45">
          Password
        </span>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 h-12 w-full rounded-2xl bg-foam px-4 text-[1rem] text-ink outline-none ring-1 ring-inset ring-ink/10 focus:ring-2 focus:ring-royal"
        />
      </label>

      {error && (
        <p role="alert" className="mt-3 text-[0.875rem] text-ember">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !password}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ember font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening…
          </>
        ) : (
          "Open dashboard"
        )}
      </button>
    </form>
  );
}
