import type { Metadata } from "next";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: {
    default: `Ops — ${BUSINESS.name}`,
    template: `%s · ${BUSINESS.name}`,
  },
  robots: { index: false, follow: false },
};

export default function OpsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
