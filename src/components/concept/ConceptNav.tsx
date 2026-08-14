"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, MapPin, Menu, Phone, X } from "lucide-react";
import { useIntro } from "@/components/concept/IntroContext";
import { SlideFill } from "@/components/concept/motion/SlideFill";
import { BUSINESS } from "@/lib/business";
import { cn } from "@/lib/utils";

/**
 * Named nav — competitor-style labels (Home / About Us / Services / …)
 * plus a utility strip with Call Us + Book now.
 */
const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "services", label: "Services" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
] as const;

export function ConceptNav() {
  const { ready } = useIntro();
  const [active, setActive] = useState("home");
  const [leftHero, setLeftHero] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      Boolean
    ) as HTMLElement[];

    const onScroll = () => {
      const home = document.getElementById("home");
      if (home) setLeftHero(home.getBoundingClientRect().bottom < 100);

      let best = "home";
      let bestDist = Infinity;
      sections.forEach((el) => {
        const dist = Math.abs(el.getBoundingClientRect().top - window.innerHeight * 0.35);
        if (dist < bestDist) {
          bestDist = dist;
          best = el.id;
        }
      });
      setActive(best);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Utility strip — Call · Hours · Directions · Book */}
      <div className="fixed inset-x-0 top-0 z-[51] bg-royal text-white">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between gap-3 px-5 text-[0.6875rem] sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <a
              href={BUSINESS.phoneHref}
              className="flex shrink-0 items-center gap-2 font-mono font-medium tracking-wide text-white/90 transition-colors hover:text-white"
            >
              <Phone className="h-3 w-3" />
              <span className="hidden sm:inline">Call Us:</span>
              {BUSINESS.phoneDisplay}
            </a>
            <span className="hidden items-center gap-1.5 font-mono tracking-wide text-white/65 md:inline-flex">
              <Clock className="h-3 w-3" />
              {BUSINESS.hoursLabel}
            </span>
            <a
              href={BUSINESS.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 font-mono tracking-wide text-white/65 transition-colors hover:text-white lg:inline-flex"
            >
              <MapPin className="h-3 w-3" />
              Directions
            </a>
          </div>
          <a
            href="#pricing"
            className="shrink-0 font-mono font-medium tracking-[0.12em] uppercase text-white/90 transition-colors hover:text-white"
          >
            Book now
          </a>
        </div>
      </div>

      <header
        className={cn(
          "fixed inset-x-0 top-9 z-50 transition-all duration-500",
          leftHero
            ? "border-b border-white/60 bg-white/75 backdrop-blur-xl backdrop-saturate-150 shadow-[0_10px_30px_-24px_rgba(20,18,41,0.5)]"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-5 sm:h-[76px] sm:px-8 lg:px-10">
          <a href="#home" className="shrink-0" aria-label={BUSINESS.name}>
            <Image
              id="nav-logo"
              src="/images/logo-knockout.png"
              alt={BUSINESS.name}
              width={958}
              height={326}
              priority
              className={cn(
                "h-9 w-auto transition-opacity duration-300 sm:h-11",
                ready ? "opacity-100" : "opacity-0"
              )}
            />
          </a>

          <nav aria-label="Main" className="mx-auto hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={cn(
                  "relative px-4 py-2 text-[0.8125rem] font-semibold tracking-wide transition-colors duration-300",
                  active === link.id ? "text-royal" : "text-ink/55 hover:text-ink"
                )}
              >
                {link.label}
                {active === link.id && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-ember"
                  />
                )}
              </a>
            ))}
            <a
              href={BUSINESS.phoneHref}
              className="relative px-4 py-2 text-[0.8125rem] font-semibold tracking-wide text-ink/55 transition-colors hover:text-ink"
            >
              Contact Us
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <a
              href={BUSINESS.phoneHref}
              aria-label={`Call ${BUSINESS.ownerFirstName}`}
              className="grid h-10 w-10 place-items-center rounded-full bg-royal text-white sm:hidden"
            >
              <Phone className="h-[16px] w-[16px]" />
            </a>
            <SlideFill
              href="#pricing"
              variant="primary"
              size="md"
              arrow
              className="!hidden !h-10 !px-4 !text-[0.6875rem] sm:!inline-flex"
            >
              Book now
            </SlideFill>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-ink ring-1 ring-inset ring-ink/10 backdrop-blur lg:hidden"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] bg-foam lg:hidden">
          <div className="flex h-[calc(2.25rem+4rem)] items-end justify-between px-5 pb-3 sm:px-8">
            <Image
              src="/images/logo-knockout.png"
              alt={BUSINESS.name}
              width={958}
              height={326}
              className="h-9 w-auto"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink ring-1 ring-inset ring-ink/10"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
          <nav className="flex flex-col px-5 pt-6 sm:px-8">
            {LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setOpen(false)}
                className="border-b border-ink/10 py-5 font-display text-2xl tracking-tight text-ink"
              >
                {link.label}
              </a>
            ))}
            <a
              href={BUSINESS.phoneHref}
              className="border-b border-ink/10 py-5 font-display text-2xl tracking-tight text-ink"
            >
              Contact Us
            </a>
          </nav>
          <div className="mt-8 px-5 sm:px-8">
            <SlideFill
              href="#pricing"
              variant="primary"
              size="lg"
              arrow
              onClick={() => setOpen(false)}
              className="w-full justify-between"
            >
              Book now
            </SlideFill>
          </div>
        </div>
      )}
    </>
  );
}
