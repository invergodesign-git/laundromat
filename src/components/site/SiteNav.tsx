"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, Phone, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { BUSINESS } from "@/lib/business";

const LINKS = [
  { id: "how-it-works", label: "How it works" },
  { id: "pricing", label: "Pricing" },
  { id: "veteran", label: "Veteran owned" },
  { id: "faq", label: "FAQ" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          {/* The lockup floats as its own object, so it stays legible over the
              hero photograph and over the white sections without switching colour. */}
          <a
            href="#top"
            className="flex shrink-0 items-center rounded-full bg-white px-4 py-1.5 shadow-lift sm:px-5"
          >
            {/* Sized so the pill matches the height of the navigation pill exactly. */}
            <Image
              src="/images/logo-lockup.png"
              alt={BUSINESS.name}
              width={966}
              height={340}
              priority
              className="h-10 w-auto lg:h-11"
            />
          </a>

          {/* The floating pill: one white object holding navigation and the action. */}
          <div className="ml-auto hidden items-center rounded-full bg-white/95 p-1.5 pl-3 shadow-lift backdrop-blur-xl lg:flex">
            <nav className="flex items-center">
              {LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className="rounded-full px-4 py-2.5 text-[0.9375rem] font-semibold text-ink-soft transition-colors hover:bg-mist hover:text-brand"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <a
              href={BUSINESS.phoneHref}
              className="ml-2 flex items-center gap-2 rounded-full px-3 py-2.5 text-[0.9375rem] font-bold text-ink transition-colors hover:text-brand"
            >
              <Phone className="h-4 w-4 text-sun" />
              {BUSINESS.phoneDisplay}
            </a>
            <ButtonLink href="#pricing" variant="accent" arrow className="ml-1">
              Book a pickup
            </ButtonLink>
          </div>

          {/* Compact pill for small screens. */}
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-white/95 p-1.5 shadow-lift backdrop-blur-xl lg:hidden">
            <a
              href={BUSINESS.phoneHref}
              aria-label={`Call ${BUSINESS.ownerFirstName}`}
              className="grid h-10 w-10 place-items-center rounded-full bg-sun text-white"
            >
              <Phone className="h-[18px] w-[18px]" />
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-mist"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] bg-white lg:hidden">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
            <Image
              src="/images/logo-lockup.png"
              alt={BUSINESS.name}
              width={966}
              height={340}
              className="h-9 w-auto"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid h-11 w-11 place-items-center rounded-full text-ink ring-1 ring-inset ring-line"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>

          <nav className="flex flex-col px-4 pt-4 sm:px-6">
            {LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setOpen(false)}
                className="border-b border-line py-5 text-2xl font-extrabold tracking-tight text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-8 flex flex-col gap-3 px-4 sm:px-6">
            <ButtonLink
              href="#pricing"
              variant="accent"
              size="lg"
              arrow
              onClick={() => setOpen(false)}
              className="w-full justify-between"
            >
              Book a pickup
            </ButtonLink>
            <ButtonLink
              href={BUSINESS.phoneHref}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Phone className="h-4 w-4 text-sun" />
              {BUSINESS.phoneDisplay}
            </ButtonLink>
          </div>
        </div>
      )}
    </>
  );
}
