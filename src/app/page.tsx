"use client";

import { ConceptCloseCta } from "@/components/concept/ConceptCloseCta";
import { ConceptFooter } from "@/components/concept/ConceptFooter";
import { ConceptNav } from "@/components/concept/ConceptNav";
import { ConceptServeAreas } from "@/components/concept/ConceptServeAreas";
import { ConceptSplash } from "@/components/concept/ConceptSplash";
import { IntroProvider } from "@/components/concept/IntroContext";
import { ConceptBlogTeaser } from "@/components/concept/sections/ConceptBlogTeaser";
import { ConceptFaq } from "@/components/concept/sections/ConceptFaq";
import { ConceptHero } from "@/components/concept/sections/ConceptHero";
import { ConceptJourney } from "@/components/concept/sections/ConceptJourney";
import { ConceptPricing } from "@/components/concept/sections/ConceptPricing";
import { ConceptProcess } from "@/components/concept/sections/ConceptProcess";
import { ConceptReviews } from "@/components/concept/sections/ConceptReviews";
import { ConceptServicesTeaser } from "@/components/concept/sections/ConceptServicesTeaser";
import { ConceptVeteran } from "@/components/concept/sections/ConceptVeteran";
import { ConceptWhyUs } from "@/components/concept/sections/ConceptWhyUs";

/** Homepage — the only route that runs the splash intro. */
export default function Home() {
  return (
    <IntroProvider>
      <div className="concept-root min-h-full bg-foam font-geist text-ink">
        <ConceptSplash />
        <ConceptNav />
        <main>
          <ConceptHero />
          <ConceptJourney />
          <ConceptPricing />
          <ConceptVeteran />
          <ConceptProcess />
          <ConceptServicesTeaser />
          <ConceptWhyUs />
          <ConceptReviews />
          <ConceptServeAreas />
          <ConceptBlogTeaser />
          <ConceptFaq />
          <ConceptCloseCta />
        </main>
        <ConceptFooter />
      </div>
    </IntroProvider>
  );
}
