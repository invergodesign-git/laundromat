import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/motion";
import { PRICING_CONFIG } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

const STEPS = [
  {
    n: "1",
    title: "Tell us where you are",
    body: "Drop your laundry at the shop, or give us your address and we'll collect it. No account to create.",
  },
  {
    n: "2",
    title: "We wash, dry and fold",
    body: "Sorted by fabric, washed at the right temperature, dried properly, then folded by hand.",
  },
  {
    n: "3",
    title: "It comes back ready",
    body: "Folded and stacked so it goes straight into the drawer. You pay for the weight, plus the pickup.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="eyebrow text-brand">How it works</span>
              <h2 className="mt-3 text-[2.25rem] sm:text-5xl">
                Three steps, and
                <br />
                you&apos;re done.
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
                The same process for one bag of shirts as for a household&apos;s worth of
                bedding — and the price is worked out the same way every time.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="#pricing" variant="primary" size="lg" arrow>
                  See what yours costs
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal stagger={0.1} className="flex flex-col gap-4">
              {STEPS.map((step) => (
                <div
                  key={step.n}
                  className="flex gap-5 rounded-[28px] bg-mist p-6 transition-colors duration-300 hover:bg-brand-soft/60 sm:p-7"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-lg font-extrabold text-white">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight">{step.title}</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.05}>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:gap-6">
            <Photo
              src="/images/shot-folding.png"
              alt="Hands folding a crisp white shirt in bright daylight"
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="aspect-[4/3] w-full shadow-card"
            />
            <div className="relative">
              <Photo
                src="/images/shot-pickup.png"
                alt="A canvas tote of folded linens waiting on a sunlit San Diego doorstep"
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="aspect-[4/3] w-full shadow-card"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 px-5 py-4 backdrop-blur-sm">
                <p className="text-[0.9375rem] font-bold">
                  Picked up and delivered across {" "}
                  <span className="text-brand">San Diego</span>
                </p>
                <p className="mt-0.5 text-[0.8125rem] font-semibold text-ink-soft tabular">
                  {formatCurrency(PRICING_CONFIG.pickup.minFee)} –{" "}
                  {formatCurrency(PRICING_CONFIG.pickup.maxFee)} depending on distance
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
