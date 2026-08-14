import Image from "next/image";
import { Clock, MapPin, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/business";
import { PRICING_CONFIG } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

/**
 * Site footer — Quick Links · Services · Contact
 */
export function ConceptFooter() {
  return (
    <footer className="border-t border-cream/10 bg-plum-deep">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-16">
        <div className="lg:col-span-5">
          <Image
            src="/images/logo-knockout.png"
            alt={BUSINESS.name}
            width={958}
            height={326}
            className="h-12 w-auto sm:h-14"
          />
          <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-cream/55">
            Veteran owned wash &amp; fold in {BUSINESS.city}. Honest pricing, local care,
            and laundry handled the way it should be.
          </p>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-mono-meta text-cream/40">Quick Links</h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-[0.9375rem] text-cream/70">
            <li>
              <a href="#home" className="transition-colors hover:text-cream">
                Home
              </a>
            </li>
            <li>
              <a href="#about" className="transition-colors hover:text-cream">
                About Us
              </a>
            </li>
            <li>
              <a href="#services" className="transition-colors hover:text-cream">
                Services
              </a>
            </li>
            <li>
              <a href="#pricing" className="transition-colors hover:text-cream">
                Pricing
              </a>
            </li>
            <li>
              <a href="#faq" className="transition-colors hover:text-cream">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-mono-meta text-cream/40">Services</h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-[0.9375rem] text-cream/70">
            <li>Wash &amp; Fold</li>
            <li>Pickup &amp; Delivery</li>
            <li>{formatCurrency(PRICING_CONFIG.washFoldRatePerLb)} / lb</li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-mono-meta text-cream/40">Contact Us</h3>
          <address className="mt-4 flex flex-col gap-3 not-italic text-[0.9375rem] text-cream/70">
            <a
              href={BUSINESS.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2.5 transition-colors hover:text-cream"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
              {BUSINESS.address}
            </a>
            <a
              href={BUSINESS.phoneHref}
              className="flex items-center gap-2.5 font-medium text-cream transition-colors hover:text-ember"
            >
              <Phone className="h-4 w-4 shrink-0 text-ember" />
              {BUSINESS.phoneDisplay}
            </a>
            <span className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-ember" />
              {BUSINESS.hoursLabel}
            </span>
          </address>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-5 text-[0.75rem] text-cream/40 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
          <p>Veteran owned · {BUSINESS.servingArea}</p>
        </div>
      </div>
    </footer>
  );
}
