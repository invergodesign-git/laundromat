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
      <div className="fixed inset-x-0 top-0 z-[51] border-b border-cream/10 bg-plum-deep">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between gap-3 px-5 text-[0.6875rem] sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <a
              href={BUSINESS.phoneHref}
              className="flex shrink-0 items-center gap-2 font-mono font-medium tracking-wide text-cream/70 transition-colors hover:text-cream"
            >
              <Phone className="h-3 w-3 text-ember" />
              <span className="hidden sm:inline">Call Us:</span>
              {BUSINESS.phoneDisplay}
            </a>
            <span className="hidden items-center gap-1.5 font-mono tracking-wide text-cream/45 md:inline-flex">
              <Clock className="h-3 w-3 text-cream/30" />
              {BUSINESS.hoursLabel}
            </span>
            <a
              href={BUSINESS.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 font-mono tracking-wide text-cream/45 transition-colors hover:text-cream lg:inline-flex"
            >
              <MapPin className="h-3 w-3 text-cream/30" />
              Directions
            </a>
          </div>
          <a
            href="#pricing"
            className="shrink-0 font-mono font-medium tracking-[0.12em] text-ember uppercase transition-colors hover:text-cream"
          >
            Book now
          </a>
        </div>
      </div>

      <header
        className={cn(
          "fixed inset-x-0 top-9 z-50 transition-all duration-500",
          leftHero
            ? "border-b border-cream/10 bg-plum/90 backdrop-blur-md"
            : "border-b border-cream/10 bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-5 sm:h-[72px] sm:px-8 lg:px-10">
          <a href="#home" className="shrink-0" aria-label={BUSINESS.name}>
            <Image
              id="nav-logo"
              src="/images/logo-knockout.png"
              alt={BUSINESS.name}
              width={958}
              height={326}
              priority
              className={cn(
                "h-8 w-auto transition-opacity duration-300 sm:h-9",
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
                  active === link.id
                    ? "text-cream"
                    : "text-cream/50 hover:text-cream/85"
                )}
              >
                {link.label}
                {active === link.id && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-4 -bottom-px h-px bg-ember"
                  />
                )}
              </a>
            ))}
            <a
              href={BUSINESS.phoneHref}
              className="relative px-4 py-2 text-[0.8125rem] font-semibold tracking-wide text-cream/50 transition-colors hover:text-cream/85"
            >
              Contact Us
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <a
              href={BUSINESS.phoneHref}
              aria-label={`Call ${BUSINESS.ownerFirstName}`}
              className="grid h-10 w-10 place-items-center rounded-full bg-ember text-plum sm:hidden"
            >
              <Phone className="h-[16px] w-[16px]" />
            </a>
            <SlideFill
              href="#pricing"
              variant="ember"
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
              className="grid h-10 w-10 place-items-center rounded-full text-cream ring-1 ring-inset ring-cream/20 lg:hidden"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] bg-plum lg:hidden">
          <div className="flex h-[calc(2.25rem+4rem)] items-end justify-between px-5 pb-3 sm:px-8">
            <Image
              src="/images/logo-knockout.png"
              alt={BUSINESS.name}
              width={958}
              height={326}
              className="h-8 w-auto"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid h-11 w-11 place-items-center rounded-full text-cream ring-1 ring-inset ring-cream/20"
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
                className="border-b border-cream/10 py-5 text-2xl font-display tracking-tight text-cream"
              >
                {link.label}
              </a>
            ))}
            <a
              href={BUSINESS.phoneHref}
              className="border-b border-cream/10 py-5 text-2xl font-display tracking-tight text-cream"
            >
              Contact Us
            </a>
          </nav>
          <div className="mt-8 px-5 sm:px-8">
            <SlideFill
              href="#pricing"
              variant="ember"
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
