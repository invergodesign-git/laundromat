import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Highlight, PageHero } from "@/components/site/PageHero";
import { PageShell } from "@/components/site/PageShell";
import { PostCard } from "@/components/site/PostCard";
import { formatPostDate, SORTED_POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — California Laundromat",
  description:
    "Straight answers about laundry: what a load really weighs, which detergents we use, how to treat a stain, and how delivery pricing works.",
};

export default function BlogPage() {
  const [lead, ...rest] = SORTED_POSTS;

  return (
    <PageShell>
      <PageHero
        eyebrow="The laundry notebook"
        accent="aqua"
        title={
          <>
            Everything we know,
            <br />
            written{" "}
            <Highlight accent="mint" tilt="rotate-1">
              down.
            </Highlight>
          </>
        }
        lead="No filler and no listicles. Just the questions customers actually ask us, answered properly — pricing, detergents, stains and the parts of laundry nobody explains."
      />

      <section className="bg-foam-deep">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          {lead && (
            <Link
              href={`/blog/${lead.slug}`}
              className="group grid overflow-hidden rounded-[36px] bg-white ring-2 ring-inset ring-royal/25 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_50px_90px_-45px_rgba(20,18,41,0.45)] lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[26rem]">
                <Image
                  src={lead.image}
                  alt={lead.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <span className="absolute left-6 top-6 rounded-full bg-white/95 px-4 py-2 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-royal">
                  Latest
                </span>
              </div>

              <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink/40">
                  {lead.category}
                  <span className="mx-2">·</span>
                  <time dateTime={lead.date}>{formatPostDate(lead.date)}</time>
                  <span className="mx-2">·</span>
                  {lead.readingMinutes} min read
                </p>
                <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.02] tracking-[-0.025em] text-ink">
                  {lead.title}
                </h2>
                <p className="mt-5 text-[1.125rem] leading-relaxed text-ink/65">
                  {lead.excerpt}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 font-mono text-[0.75rem] font-medium uppercase tracking-[0.14em] text-royal">
                  Read the post
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
