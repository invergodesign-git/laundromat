import { Phone, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/motion";
import { BUSINESS } from "@/lib/business";

const STANDARDS = [
  "Charge what we said we would charge",
  "Do the job properly, every single order",
  "Hand it back the way we'd want it handed to us",
];

export function Veteran() {
  return (
    <section id="veteran" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[36px] bg-brand">
          <div className="grid lg:grid-cols-12">
            <div className="p-8 text-white sm:p-12 lg:col-span-6 lg:p-14">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 text-[0.8125rem] font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  Veteran owned
                </span>

                <h2 className="mt-6 text-[2.25rem] sm:text-[2.75rem] lg:text-5xl">
                  Run to the standard
                  <br />
                  {BUSINESS.ownerFirstName} was trained to.
                </h2>

                <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">
                  {BUSINESS.name} is a local shop in {BUSINESS.city}, owned and run by{" "}
                  {BUSINESS.ownerFirstName}. There&apos;s no call centre and no franchise
                  behind it — just one person who is accountable for how your laundry
                  comes back.
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <ul className="mt-8 flex flex-col gap-3">
                  {STANDARDS.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[0.9375rem] font-semibold">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.16}>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <ButtonLink href={BUSINESS.phoneHref} variant="white" size="lg" arrow>
                    <Phone className="h-4 w-4 text-sun" />
                    Call {BUSINESS.ownerFirstName}
                  </ButtonLink>
                  <span className="text-[0.9375rem] font-bold text-white/70 tabular">
                    {BUSINESS.phoneDisplay}
                  </span>
                </div>
              </Reveal>
            </div>

            <div className="relative min-h-[300px] lg:col-span-6">
              <Photo
                src="/images/shot-shop.png"
                alt="The bright, clean interior of the laundromat with a row of white washing machines"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="absolute inset-0 h-full w-full rounded-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
