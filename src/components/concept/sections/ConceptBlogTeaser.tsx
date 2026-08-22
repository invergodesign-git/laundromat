import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PostCard } from "@/components/site/PostCard";
import { SORTED_POSTS } from "@/lib/blog";

/**
 * Three most recent posts on the homepage. Reuses the same card as the blog
 * index so the two never drift apart visually.
 */
export function ConceptBlogTeaser() {
  const posts = SORTED_POSTS.slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="bg-foam py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-mono-meta text-royal">From the blog</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-[-0.025em] text-ink">
              Laundry, explained properly.
            </h2>
          </div>
          <Link
            href="/blog"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink ring-1 ring-inset ring-ink/10 transition-colors hover:bg-white/70"
          >
            Read the blog
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
