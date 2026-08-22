/**
 * Site navigation structure. The header, the mobile sheet and the footer all
 * read from here so a new page only has to be added in one place.
 */

import { SERVICES } from "./services";

export interface NavLink {
  href: string;
  label: string;
  /** Present on Services — renders as a dropdown / accordion. */
  children?: readonly NavLink[];
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/", label: "Home" },
  {
    href: "/services",
    label: "Services",
    children: [
      { href: "/services", label: "All services" },
      ...SERVICES.map((s) => ({ href: `/services/${s.slug}`, label: s.short })),
    ],
  },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact Us" },
];

/**
 * True when `pathname` is inside `href`. "/" only matches exactly, otherwise
 * every link would light up on the homepage.
 */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
