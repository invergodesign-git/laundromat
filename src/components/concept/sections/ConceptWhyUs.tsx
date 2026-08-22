"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import {
  BadgeCheck,
  Clock3,
  HandHeart,
  PiggyBank,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useIntro } from "@/components/concept/IntroContext";
import { BubbleAccent } from "@/components/concept/motion/Bubbles";
import { MaskLines } from "@/components/concept/motion/MaskLines";
import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import { BUSINESS, SERVICE_PROMISE } from "@/lib/business";

/**
 * Each card leans a different way and carries its own accent colour so the
 * row reads as hand-made stickers rather than a uniform feature grid.
 */
const REASONS = [
  {
    icon: Truck,
    title: "You never leave home",
    body: "Leave the bag at your door. We collect it, and the same bag comes back clean, folded and sealed.",
    tint: "bg-royal text-white",
    tilt: "-rotate-2",
    src: "/images/real/basket.jpg",
  },
  {
    icon: PiggyBank,
    title: "The price is the price",
    body: "Charged on real weight, not a guess. Pickup is priced by distance and you see the number before you book.",
    tint: "bg-ember text-white",
    tilt: "rotate-2",
    src: "/images/real/basket-tall.jpg",
  },
  {
    icon: HandHeart,
    title: "Folded by a person",
    body: "No conveyor belt, no machine crease. A person folds every piece so it goes straight into your drawer.",
    tint: "bg-aqua text-ink",
    tilt: "-rotate-1",
    src: "/images/real/fold.jpg",
  },
  {
    icon: ShieldCheck,
    title: "Veteran owned",
    body: "Owned and run locally by the people who wash your laundry — not a franchise with a call centre.",
    tint: "bg-mint text-ink",
    tilt: "rotate-1",
    src: "/images/real/shop.jpg",
  },
  {
    icon: Clock3,
    title: "No surprise waiting",
    body: "You pick the turnaround when you book — 12 hours to three days — so you always know when the bag is coming back.",
    tint: "bg-blush text-ink",
    tilt: "-rotate-2",
    src: "/images/real/van.jpg",
  },
  {
    icon: BadgeCheck,
    title: "Nothing to sign up for",
    body: "No account, no subscription, no card on file. Check your price, call, and that is the whole process.",
    tint: "bg-rich text-white",
    tilt: "rotate-2",
    src: "/images/real/handoff.jpg",
  },
] as const;

/**
 * Section — Why people stick with us.
 * Deliberately scroll-light: cards lift in once and then stay put.
 */
export function ConceptWhyUs() {
  const { ready } = useIntro();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ready || !root.current || prefersReducedMotion()) return;

      // See ConceptProcess — never pre-hide content behind a scroll trigger.
      gsap.from(".why-card", {
        autoAlpha: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.09,
        ease: EASE.premium,
        immediateRender: false,
        scrollTrigger: { trigger: ".why-grid", start: "top 85%", once: true },
      });
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true }
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-foam-deep">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[10%] top-[-10%] h-[34rem] w-[34rem] rounded-full bg-rich/15 blur-[130px]"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-32">
        <div className="relative max-w-3xl">
          <BubbleAccent size={52} className="right-0 -top-10 hidden sm:block" duration={10} />
          <p className="font-mono-meta text-royal">Why us</p>

          <MaskLines className="mt-4">
            <h2 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.96] tracking-[-0.025em] text-ink">
              Laundry is boring.
              <br />
              Losing it{" "}
              <span className="relative inline-block">
                <span className="relative z-10">is not.</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-1 z-0 h-[0.35em] rotate-1 rounded-full bg-aqua/50"
                />
              </span>
            </h2>
          </MaskLines>

          <p className="mt-7 text-[1.125rem] leading-relaxed text-ink/65 sm:text-[1.25rem]">
            Six reasons people hand us the bag every week instead of spending
            their evening in front of a machine.
          </p>
        </div>

        <div className="why-grid mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {REASONS.map((r) => {
            const Icon = r.icon;
            return (
              <article
                key={r.title}
                className="why-card group relative isolate flex flex-col overflow-hidden rounded-[28px] bg-white p-7 shadow-[0_1px_2px_rgba(20,18,41,0.04)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_36px_70px_-40px_rgba(20,18,41,0.45)] sm:p-8"
              >
                {/* Faded photo of the thing the card is talking about. A
                    negative z-index keeps it above the white card fill but
                    under the copy, and the wash guards the text contrast. */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                  <Image
                    src={r.src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover opacity-45 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-white/85 to-white/35" />
                </div>

                <span
                  className={`grid h-16 w-16 place-items-center rounded-3xl ${r.tint} ${r.tilt} shadow-[0_16px_32px_-16px_rgba(20,18,41,0.55)] transition-transform duration-500 group-hover:rotate-0`}
                >
                  <Icon className="h-7 w-7" strokeWidth={2} />
                </span>

                <h3 className="mt-7 font-display text-[1.75rem] leading-tight tracking-tight text-ink">
                  {r.title}
                </h3>
                <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink/65">{r.body}</p>
              </article>
            );
          })}
        </div>

        {/* Plain-spoken callout — the thing an owner would actually say */}
        <div className="relative mt-14 overflow-hidden rounded-[32px] bg-white px-7 py-10 sm:px-12 sm:py-12 lg:mt-16">
          <BubbleAccent size={72} className="-bottom-6 right-8 opacity-70" duration={9} />
          <div className="relative max-w-3xl">
            <p className="font-mono-meta text-ember">Our service promise</p>
            <p className="mt-4 font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.15] tracking-tight text-ink">
              &ldquo;{SERVICE_PROMISE}&rdquo;
            </p>
            <p className="mt-6 text-[1rem] font-medium text-ink/55">
              {BUSINESS.name} · Veteran owned, {BUSINESS.servingArea}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
