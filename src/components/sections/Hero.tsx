import Image from "next/image";
import { ArrowUpRight, Phone, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/motion";
import { BUSINESS } from "@/lib/business";
import { PRICING_CONFIG } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

const FACTS = [
  { value: `${formatCurrency(PRICING_CONFIG.washFoldRatePerLb)}/lb`, label: "Wash & fold" },
  { value: `From ${formatCurrency(PRICING_CONFIG.pickup.minFee)}`, label: "Pickup & delivery" },
  { value: "No contracts", label: "Pay per order" },
];

export function Hero() {
  return (
    <section id="top" className="relative isolate min-h-[100svh] overflow-hidden bg-ink">
      <Image
        src="/images/hero-room.png"
        alt="A warm, sunlit laundry room with folded linens stacked on oak shelving"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_50%]"
      />

      {/* Two scrims: one across for the type, one up from the floor so the
          content has a base to sit on at every viewport height. */}
      <div className="absolute inset-0 bg-[linear-gradient(95deg,rgba(12,10,16,0.9)_0%,rgba(12,10,16,0.72)_34%,rgba(12,10,16,0.28)_66%,rgba(12,10,16,0.42)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(to_top,rgba(12,10,16,0.85)_0%,rgba(12,10,16,0.25)_55%,rgba(12,10,16,0)_100%)]" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-4 pb-10 pt-32 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-3xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-2 text-[0.8125rem] font-bold text-white ring-1 ring-inset ring-white/25 backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-sun" />
                Veteran owned · San Diego
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="mt-7 text-[clamp(2.9rem,8.2vw,6.5rem)] font-extrabold leading-[0.94] tracking-[-0.04em] text-white">
                Fresh laundry,
                <br />
                zero effort.
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-6 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
                Wash &amp; fold done properly by a local, veteran owned shop.{" "}
                {formatCurrency(PRICING_CONFIG.washFoldRatePerLb)} a pound, and pickup priced
                honestly by how far you are from our door.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <ButtonLink href="#pricing" variant="white" size="lg" arrow>
                  Schedule a pickup
                </ButtonLink>
                <ButtonLink href={BUSINESS.phoneHref} variant="glass" size="lg">
                  <Phone className="h-4 w-4 text-sun" />
                  Call {BUSINESS.ownerFirstName}
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          {/* Floating card: a way into the process without another wall of type.
              Held back on phones, where it would push the hero to nearly
              one and a half screens for content that follows two sections later. */}
          <Reveal delay={0.32} className="hidden lg:block lg:shrink-0">
            <a
              href="#how-it-works"
              className="group block w-full max-w-sm rounded-[26px] bg-white/12 p-3 ring-1 ring-inset ring-white/25 backdrop-blur-xl transition-colors duration-300 hover:bg-white/20 lg:w-[22rem]"
            >
              <span className="relative block aspect-[16/10] overflow-hidden rounded-[18px]">
                <Image
                  src="/images/shot-folding.png"
                  alt="Hands folding a crisp white shirt"
                  fill
                  sizes="(min-width: 1024px) 22rem, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-ink shadow-lift transition-transform duration-300 group-hover:scale-110">
                    <ArrowUpRight className="h-6 w-6" strokeWidth={2.5} />
                  </span>
                </span>
              </span>
              <span className="flex items-center justify-between gap-3 px-3 py-3.5">
                <span className="text-[0.9375rem] font-bold text-white">See how it works</span>
                <span className="text-[0.8125rem] font-semibold text-white/60">3 steps</span>
              </span>
            </a>
          </Reveal>
        </div>

        {/* Facts rail, set as one glass bar rather than three stray badges. */}
        <Reveal delay={0.4}>
          <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-[22px] bg-white/15 ring-1 ring-inset ring-white/20 backdrop-blur-md lg:mt-14">
            {FACTS.map((fact) => (
              <div
                key={fact.label}
                className="bg-[rgba(12,10,16,0.42)] px-3 py-3.5 sm:px-6 sm:py-5"
              >
                <dt className="text-[0.6875rem] font-semibold leading-snug text-white/60 sm:text-[0.8125rem]">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-[0.9375rem] font-extrabold tracking-tight text-white tabular sm:text-xl">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
