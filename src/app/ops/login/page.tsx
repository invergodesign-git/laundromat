import type { Metadata } from "next";
import { Suspense } from "react";
import { OpsLoginForm } from "@/components/ops/OpsLoginForm";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function OpsLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-foam px-5 py-16">
      <Suspense
        fallback={
          <div className="h-72 w-full max-w-md animate-pulse rounded-[32px] bg-white/70" />
        }
      >
        <OpsLoginForm />
      </Suspense>
    </div>
  );
}
