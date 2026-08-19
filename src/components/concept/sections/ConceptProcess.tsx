"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { Shirt, Sparkles, Truck, WashingMachine, Wind } from "lucide-react";
import { useIntro } from "@/components/concept/IntroContext";
import { BubbleAccent } from "@/components/concept/motion/Bubbles";
import { MaskLines } from "@/components/concept/motion/MaskLines";
import { SlideFill } from "@/components/concept/motion/SlideFill";
import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import { BUSINESS } from "@/lib/business";

const SERVICES = [
  {
    n: "01",
    icon: WashingMachine,
    title: "Wash",
    lead: "Sorted first, washed second.",
    body: "Darks, lights and delicates never share a drum. Everything gets the temperature and the detergent it actually needs.",
    points: ["Sorted by colour & fabric", "Gentle, skin-friendly detergent", "Stains pre-treated by hand"],
    src: "/images/real/room-bright.jpg",
    alt: "A clean, bright laundry room with a front-load washer mid-cycle",
    ring: "ring-aqua/50",
    sticker: "No mixing",
  },
  {
    n: "02",
    icon: Wind,
    title: "Dry",
    lead: "Dried right, not rushed.",
    body: "Heat gets matched to the fabric so nothing shrinks, nothing pills, and nothing comes back still damp at the seams.",
    points: ["Heat matched to fabric", "Nothing over-dried", "Checked before folding"],
    src: "/images/real/dryers.jpg",
    alt: "A long row of commercial dryers with their doors open",
    ring: "ring-blush/50",
    sticker: "No damp seams",
  },
  {
    n: "03",
    icon: Shirt,
    title: "Fold",
    lead: "Folded by hand, drawer-ready.",
    body: "Every piece is folded by a person, not a machine — stacked so it goes straight from the bag into your drawer.",
    points: ["Folded by hand", "Stacked by type", "Bagged fresh & sealed"],
    src: "/images/real/whites.jpg",
    alt: "Crisp white shirts hanging in soft daylight",
    ring: "ring-mint/60",
    sticker: "Drawer-ready",
  },
] as const;

const INCLUDED = [
  { icon: Truck, label: "Pickup at your door" },
  { icon: Sparkles, label: "Wash, dry & fold" },
  { icon: Shirt, label: "Sorted & bagged" },
  { icon: Truck, label: "Delivered back to you" },
] as const;

/**
 * Section 03 — Services.
 *
 * Deliberately NOT pinned. The earlier version hijacked ~5 viewports of
 * scroll to swipe three photos, which read as the page being stuck. Now the
 * cards simply scroll past and lift in on arrival.
 */
export function ConceptProcess() {
  const { ready } = useIntro();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ready || !root.current || prefersReducedMotion()) return;

      // immediateRender:false keeps the cards painted until their trigger
      // fires. If a trigger ever misses, the content is simply there rather
      // than stuck at autoAlpha 0.
      gsap.from(".service-card", {
        autoAlpha: 0,
        y: 48,
        duration: 0.85,
        stagger: 0.12,
        ease: EASE.premium,
        immediateRender: false,
        scrollTrigger: { trigger: ".service-grid", start: "top 85%", once: true },
      });

      gsap.from(".included-chip", {
        autoAlpha: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.07,
        ease: EASE.soft,
        immediateRender: false,
        scrollTrigger: { trigger: ".included-rail", start: "top 88%", once: true },
      });
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true }
  );

  return (
    <section id="services" ref={root} className="relative z-10 bg-white text-ink">
      {/* Soft wave carrying the soap-blue page into the white service band */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 overflow-hidden sm:h-16"
      >
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0,0 L1440,0 L1440,26 C1200,58 960,10 720,34 C480,58 240,20 0,44 Z"
            fill="#F2F6FF"
          />
        </svg>
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-24 sm:px-8 sm:pb-28 sm:pt-28 lg:px-10 lg:pb-32 lg:pt-32">
        <div className="relative max-w-4xl">
          <BubbleAccent size={64} className="-right-4 -top-10 hidden sm:block" duration={9} />
          <p className="font-mono-meta text-royal">Services</p>

          <MaskLines className="mt-4">
            <h2 className="font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.025em] text-ink">
              We pick it up.
              <br />
              We bring it back{" "}
              <span className="relative inline-block">
                <span className="relative z-10">folded.</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-1 z-0 h-[0.35em] -rotate-1 rounded-full bg-ember/30"
                />
              </span>
            </h2>
          </MaskLines>

          <p className="mt-7 max-w-2xl text-[1.125rem] leading-relaxed text-ink/65 sm:text-[1.25rem]">
            You never have to set foot in the shop. We collect your bag, run it
            through wash, dry and fold, then bring it back to the same door — at{" "}
            <span className="font-semibold text-ember">{BUSINESS.washFoldRateLabel}</span>,
            with pickup priced by distance.
          </p>
        </div>

        {/* ---- The three stages ---- */}
        <div className="service-grid mt-14 grid gap-6 lg:mt-20 lg:grid-cols-3 lg:gap-8">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <article
                key={s.n}
                className={`service-card group relative flex flex-col overflow-hidden rounded-[32px] bg-foam ring-2 ring-inset ${s.ring} transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-40px_rgba(20,18,41,0.4)]`}
              >
                <div className="relative aspect-[5/4] overflow-hidden">
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority={i === 0}
                  />
                  {/* Scrim so the white number badge holds against a bright photo */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/25 to-transparent"
                  />

                  {/* Big cartoon number badge */}
                  <span className="absolute left-5 top-5 grid h-14 w-14 -rotate-6 place-items-center rounded-2xl bg-white font-display text-2xl text-royal shadow-[0_10px_24px_-10px_rgba(20,18,41,0.5)]">
                    {s.n}
                  </span>

                  {/* Hand-written style sticker */}
                  <span className="absolute right-4 top-6 rotate-6 rounded-full bg-ember px-4 py-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-white shadow-[0_10px_24px_-10px_rgba(255,106,43,0.9)]">
                    {s.sticker}
                  </span>

                  <BubbleAccent size={40} className="-bottom-3 right-10" duration={8 + i} />
                </div>

                <div className="flex flex-1 flex-col p-7 sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-royal/10 text-royal">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h3 className="font-display text-[2rem] leading-none tracking-tight text-ink">
                      {s.title}
                    </h3>
                  </div>

                  <p className="mt-5 text-[1.125rem] font-semibold leading-snug text-royal">
                    {s.lead}
                  </p>
                  <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink/65">{s.body}</p>

                  <ul className="mt-6 flex flex-col gap-2.5 border-t border-ink/10 pt-6">
                    {s.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-[1rem] font-medium text-ink/75"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-ember"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* ---- What every order includes ---- */}
        <div className="included-rail relative mt-16 overflow-hidden rounded-[32px] bg-royal px-6 py-10 text-white sm:px-10 sm:py-12 lg:mt-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(108,92,255,0.7),transparent_60%)]"
          />
          <BubbleAccent size={90} className="-right-6 -top-10 opacity-25" duration={11} />

          <div className="relative">
            <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-white/60">
              Every single order
            </p>
            <h3 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight tracking-tight">
              One price. Four things happen.
            </h3>

            <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {INCLUDED.map((item, i) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.label}
                    className="included-chip flex items-center gap-3.5 rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-inset ring-white/15"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white font-display text-lg text-royal">
                      {i + 1}
                    </span>
                    <span className="flex items-center gap-2 text-[1.0625rem] font-medium leading-snug">
                      <Icon className="h-4 w-4 shrink-0 text-white/70" strokeWidth={2} />
                      {item.label}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <SlideFill
                href="#pricing"
                size="lg"
                arrow
                className="!bg-white !text-royal hover:!bg-foam"
              >
                Check my price
              </SlideFill>
              <a
                href={BUSINESS.phoneHref}
                className="inline-flex h-14 items-center justify-center rounded-full px-7 font-mono text-[0.875rem] font-medium uppercase tracking-[0.14em] text-white ring-1 ring-inset ring-white/35 transition-colors hover:ring-white/70"
              >
                Call {BUSINESS.ownerFirstName}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
