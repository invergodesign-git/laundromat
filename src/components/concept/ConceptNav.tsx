"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Clock, MapPin, Menu, Phone, X } from "lucide-react";
import { useIntro } from "@/components/concept/IntroContext";
import { SlideFill } from "@/components/concept/motion/SlideFill";
import { BOOKING } from "@/lib/booking";
import { BUSINESS } from "@/lib/business";
import { isActivePath, NAV_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * Site header. Routes rather than scroll anchors now that every service has
 * its own page, with the phone number promoted to a full-size CALL NOW button
 * because the phone is still how most orders actually start.
 */
export function ConceptNav() {
  const { ready } = useIntro();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    // Frosts as soon as the page moves — a transparent bar lets hero content
    // slide visibly underneath the logo.
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route changes leave the sheet open otherwise, since it is not unmounted.
  useEffect(() => {
    setOpen(false);
    setOpenGroup(null);
  }, [pathname]);

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
      {/* Utility strip — hours · area · email */}
      <div className="fixed inset-x-0 top-0 z-[51] bg-royal text-white">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between gap-3 px-5 text-[0.6875rem] sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-5">
            <span className="flex shrink-0 items-center gap-1.5 font-mono tracking-wide text-white/85">
              <Clock className="h-3 w-3" />
              {BUSINESS.hoursLabel}
            </span>
            <span className="hidden items-center gap-1.5 font-mono tracking-wide text-white/70 md:inline-flex">
              <MapPin className="h-3 w-3" />
              Pickup &amp; delivery in {BUSINESS.servingArea}
            </span>
          </div>
          <a
            href={BUSINESS.emailHref}
            className="hidden shrink-0 font-mono tracking-wide text-white/85 transition-colors hover:text-white sm:block"
          >
            {BUSINESS.email}
          </a>
        </div>
      </div>

      <header
        className={cn(
          "fixed inset-x-0 top-9 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-white/60 bg-white/80 shadow-[0_10px_30px_-24px_rgba(20,18,41,0.5)] backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center gap-5 px-5 sm:h-[5.5rem] sm:px-8 lg:px-10">
          <Link href="/" className="shrink-0" aria-label={BUSINESS.name}>
            <Image
              id="nav-logo"
              src="/images/logo-knockout.png"
              alt={BUSINESS.name}
              width={958}
              height={326}
              priority
              className={cn(
                "h-14 w-auto transition-opacity duration-300 sm:h-[4.25rem]",
                ready ? "opacity-100" : "opacity-0"
              )}
            />
          </Link>

          {/* Inline nav only above xl — below that the logo, CALL NOW and
              seven labels cannot share a row without wrapping. */}
          <nav
            aria-label="Main"
            className="mx-auto hidden items-center gap-0.5 xl:flex"
          >
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);

              if (!link.children) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative whitespace-nowrap px-3 py-2 text-[0.8125rem] font-semibold tracking-wide transition-colors duration-300",
                      active ? "text-royal" : "text-ink/55 hover:text-ink"
                    )}
                  >
                    {link.label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-ember"
                      />
                    )}
                  </Link>
                );
              }

              return (
                <div key={link.href} className="group relative">
                  <Link
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-1 whitespace-nowrap px-3 py-2 text-[0.8125rem] font-semibold tracking-wide transition-colors duration-300",
                      active ? "text-royal" : "text-ink/55 hover:text-ink"
                    )}
                  >
                    {link.label}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-ember"
                      />
                    )}
                  </Link>
                  <div className="invisible absolute left-0 top-full w-64 translate-y-1 pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-2 shadow-[0_30px_60px_-30px_rgba(20,18,41,0.5)] backdrop-blur-xl">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block rounded-xl px-3 py-2 text-[0.8125rem] font-medium transition-colors",
                            pathname === child.href
                              ? "bg-royal/10 text-royal"
                              : "text-ink/70 hover:bg-foam hover:text-ink"
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 xl:ml-0 xl:gap-3">
            {/* The phone is the primary action — full number on desktop, a
                tappable pill on small screens. */}
            <a
              href={BUSINESS.phoneHref}
              className="hidden items-center gap-2.5 rounded-full bg-ember px-5 py-3 text-white shadow-[0_16px_34px_-14px_rgba(255,106,43,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-ember/90 lg:inline-flex"
            >
              <Phone className="h-4 w-4 shrink-0" />
              <span className="flex flex-col leading-none">
                <span className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.16em] text-white/80">
                  Call now
                </span>
                <span className="mt-1 text-[0.9375rem] font-bold tracking-tight">
                  {BUSINESS.phoneDisplay}
                </span>
              </span>
            </a>
            <a
              href={BUSINESS.phoneHref}
              aria-label={`Call ${BUSINESS.name}`}
              className="grid h-11 w-11 place-items-center rounded-full bg-ember text-white shadow-[0_14px_28px_-14px_rgba(255,106,43,0.9)] lg:hidden"
            >
              <Phone className="h-[17px] w-[17px]" />
            </a>

            <SlideFill
              href={BOOKING.href}
              target={BOOKING.target}
              rel={BOOKING.rel}
              variant="primary"
              size="md"
              arrow
              className="!hidden !h-11 !px-5 !text-[0.6875rem] sm:!inline-flex"
            >
              Book now
            </SlideFill>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/70 text-ink ring-1 ring-inset ring-ink/10 backdrop-blur xl:hidden"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-foam xl:hidden">
          <div className="flex h-[calc(2.25rem+4.5rem)] items-end justify-between px-5 pb-3 sm:px-8">
            <Image
              src="/images/logo-knockout.png"
              alt={BUSINESS.name}
              width={958}
              height={326}
              className="h-14 w-auto"
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

          <nav className="flex flex-col px-5 pt-4 sm:px-8">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.href} className="border-b border-ink/10">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroup((g) => (g === link.href ? null : link.href))
                    }
                    aria-expanded={openGroup === link.href}
                    className="flex w-full items-center justify-between py-5 font-display text-2xl tracking-tight text-ink"
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-ink/40 transition-transform duration-300",
                        openGroup === link.href && "rotate-180"
                      )}
                    />
                  </button>
                  {openGroup === link.href && (
                    <div className="grid gap-1 pb-5">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="rounded-xl bg-white/70 px-4 py-3 text-[0.9375rem] font-medium text-ink/75"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-ink/10 py-5 font-display text-2xl tracking-tight text-ink"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="mt-8 grid gap-3 px-5 pb-16 sm:px-8">
            <a
              href={BUSINESS.phoneHref}
              className="flex h-16 items-center justify-center gap-3 rounded-full bg-ember text-white shadow-[0_18px_40px_-16px_rgba(255,106,43,0.9)]"
            >
              <Phone className="h-5 w-5" />
              <span className="text-lg font-bold tracking-tight">
                Call {BUSINESS.phoneDisplay}
              </span>
            </a>
            <SlideFill
              href={BOOKING.href}
              target={BOOKING.target}
              rel={BOOKING.rel}
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
