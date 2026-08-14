"use client";

import { ConceptCloseCta } from "@/components/concept/ConceptCloseCta";
import { ConceptFooter } from "@/components/concept/ConceptFooter";
import { ConceptNav } from "@/components/concept/ConceptNav";
import { ConceptServeAreas } from "@/components/concept/ConceptServeAreas";
import { ConceptSplash } from "@/components/concept/ConceptSplash";
import { IntroProvider } from "@/components/concept/IntroContext";
import { Grain } from "@/components/concept/motion/Grain";
import { ConceptFaq } from "@/components/concept/sections/ConceptFaq";
import { ConceptHero } from "@/components/concept/sections/ConceptHero";
import { ConceptJourney } from "@/components/concept/sections/ConceptJourney";
import { ConceptProcess } from "@/components/concept/sections/ConceptProcess";
import { ConceptPricing } from "@/components/concept/sections/ConceptPricing";
import { ConceptVeteran } from "@/components/concept/sections/ConceptVeteran";

/**
 * Client-ready homepage — Handled cinematic concept, finalized for review.
 */
export default function Home() {
  return (
    <IntroProvider>
      <div className="concept-root min-h-full bg-plum font-geist text-cream">
        <ConceptSplash />
        <Grain />
        <ConceptNav />
        <main>
          <ConceptHero />
          <ConceptJourney />
          <ConceptProcess />
          <ConceptPricing />
          <ConceptVeteran />
          <ConceptServeAreas />
          <ConceptFaq />
          <ConceptCloseCta />
        </main>
        <ConceptFooter />
      </div>
    </IntroProvider>
  );
}
