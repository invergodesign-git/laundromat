import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CtaRow } from "@/components/site/CtaRow";
import { PageShell } from "@/components/site/PageShell";
import { PostCard } from "@/components/site/PostCard";
import { formatPostDate, getPost, POSTS, SORTED_POSTS } from "@/lib/blog";

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: `${post.title} — California Laundromat`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();

  const more = SORTED_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <PageShell>
      <article>
        {/* Header */}
        <header className="relative isolate overflow-hidden bg-foam">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(108,92,255,0.14),transparent_62%)]"
          />
          <div className="relative mx-auto max-w-[820px] px-5 pb-12 pt-14 sm:px-8 sm:pt-16 lg:pt-20">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-royal"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All posts
            </Link>

            <p className="mt-8 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink/40">
              {post.category}
              <span className="mx-2">·</span>
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              <span className="mx-2">·</span>
              {post.readingMinutes} min read
            </p>

            <h1 className="mt-5 font-display text-[clamp(2.25rem,5.5vw,4rem)] leading-[1] tracking-[-0.025em] text-ink">
              {post.title}
            </h1>
            <p className="mt-6 text-[1.1875rem] leading-relaxed text-ink/65">
              {post.excerpt}
            </p>
          </div>
        </header>

        {/* Cover */}
        <div className="bg-gradient-to-b from-foam to-foam-deep">
          <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
            <div className="glass overflow-hidden rounded-[32px] p-2.5 sm:p-3">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[24px]">
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  sizes="(min-width: 1100px) 1100px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="bg-foam-deep">
          <div className="mx-auto max-w-[820px] px-5 py-16 sm:px-8 sm:py-20">
            {post.body.map((block, i) => {
              switch (block.type) {
                case "h2":
                  return (
                    <h2
                      key={i}
                      className="mt-12 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight tracking-[-0.02em] text-ink first:mt-0"
                    >
                      {block.text}
                    </h2>
                  );
                case "ul":
                  return (
                    <ul key={i} className="mt-6 grid gap-3">
                      {block.items.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3.5 rounded-2xl bg-white px-5 py-4 text-[1.0625rem] leading-relaxed text-ink/75"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ember"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                case "quote":
                  return (
                    <blockquote
                      key={i}
                      className="mt-10 rounded-[28px] bg-royal p-8 font-display text-[clamp(1.25rem,2.5vw,1.75rem)] leading-snug tracking-tight text-white sm:p-10"
                    >
                      {block.text}
                    </blockquote>
                  );
                default:
                  return (
                    <p
                      key={i}
                      className="mt-6 text-[1.125rem] leading-[1.75] text-ink/75 first:mt-0"
                    >
                      {block.text}
                    </p>
                  );
              }
            })}

            <div className="mt-14 rounded-[32px] bg-white p-8 ring-2 ring-inset ring-ember/40 sm:p-10">
              <h2 className="font-display text-[1.75rem] leading-tight tracking-tight text-ink">
                Want us to just deal with it?
              </h2>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink/65">
                Leave the bag at your door and we will take it from here.
              </p>
              <CtaRow className="mt-7" />
            </div>
          </div>
        </div>
      </article>

      {/* Keep reading */}
      {more.length > 0 && (
        <section className="bg-foam">
          <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1] tracking-[-0.025em] text-ink">
              Keep reading.
            </h2>
            <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((other) => (
                <PostCard key={other.slug} post={other} />
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
