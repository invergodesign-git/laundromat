import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { BookCompleteClient } from "@/components/booking/BookCompleteClient";
import { PageShell } from "@/components/site/PageShell";

export const metadata: Metadata = {
  title: "Confirming booking — California Laundromat",
  robots: { index: false, follow: false },
};

export default function BookCompletePage() {
  return (
    <PageShell>
      <section className="bg-foam">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10">
          <Suspense
            fallback={
              <div className="glass mx-auto max-w-xl rounded-[32px] p-10 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-royal" />
              </div>
            }
          >
            <BookCompleteClient />
          </Suspense>
        </div>
      </section>
    </PageShell>
  );
}
