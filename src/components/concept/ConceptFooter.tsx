import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { BUSINESS, SERVICE_PROMISE } from "@/lib/business";
import { NAV_LINKS } from "@/lib/nav";
import { SERVICES } from "@/lib/services";

/**
 * Site footer — promise · quick links · every service · contact.
 * Doubles as the sitemap now that the site spans more than one page.
 */
export function ConceptFooter() {
  const quickLinks = NAV_LINKS.filter((l) => !l.children);

  return (
    <footer className="bg-foam-deep">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-16">
        <div className="lg:col-span-4">
          <Image
            src="/images/logo-knockout.png"
            alt={BUSINESS.name}
            width={958}
            height={326}
            className="h-14 w-auto sm:h-16"
          />
          <p className="mt-6 font-mono-meta text-ink/40">Our promise</p>
          <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-ink/65">
            {SERVICE_PROMISE}
          </p>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-mono-meta text-ink/40">Quick Links</h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-[0.9375rem] text-ink/70">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-royal"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-mono-meta text-ink/40">Services</h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-[0.9375rem] text-ink/70">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="transition-colors hover:text-royal"
                >
                  {service.short}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-mono-meta text-ink/40">Contact Us</h3>
          <address className="mt-4 flex flex-col gap-3 not-italic text-[0.9375rem] text-ink/70">
            <a
              href={BUSINESS.phoneHref}
              className="flex items-center gap-2.5 text-[1.125rem] font-bold tracking-tight text-ink transition-colors hover:text-royal"
            >
              <Phone className="h-4 w-4 shrink-0 text-ember" />
              {BUSINESS.phoneDisplay}
            </a>
            <a
              href={BUSINESS.emailHref}
              className="flex items-center gap-2.5 transition-colors hover:text-royal"
            >
              <Mail className="h-4 w-4 shrink-0 text-ember" />
              {BUSINESS.email}
            </a>
            <span className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
              Serving {BUSINESS.servingArea}
            </span>
            <span className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-ember" />
              {BUSINESS.hoursLabel}
            </span>
          </address>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-5 text-[0.75rem] text-ink/45 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
          <p>Veteran owned · {BUSINESS.servingArea}</p>
        </div>
      </div>
    </footer>
  );
}
