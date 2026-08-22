import type { ReactNode } from "react";
import { ConceptCloseCta } from "@/components/concept/ConceptCloseCta";
import { ConceptFooter } from "@/components/concept/ConceptFooter";
import { ConceptNav } from "@/components/concept/ConceptNav";

/**
 * Chrome for every page except the homepage, which runs its own splash.
 *
 * The top padding clears the fixed utility strip (2.25rem) plus the header
 * (4.5rem, 5.5rem from sm). Those three numbers are the only place the header
 * height is duplicated — keep them in step with `ConceptNav`.
 */
export function PageShell({
  children,
  closing = true,
}: {
  children: ReactNode;
  /** Set false on pages that end with their own call to action. */
  closing?: boolean;
}) {
  return (
    <div className="concept-root flex min-h-full flex-col bg-foam font-geist text-ink">
      <ConceptNav />
      <main className="flex-1 pt-[calc(2.25rem+4.5rem)] sm:pt-[calc(2.25rem+5.5rem)]">
        {children}
      </main>
      {closing && <ConceptCloseCta />}
      <ConceptFooter />
    </div>
  );
}
