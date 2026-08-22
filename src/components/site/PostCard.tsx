import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatPostDate, type Post } from "@/lib/blog";
import { cn } from "@/lib/utils";

/**
 * Blog teaser card. Used on the blog index, the homepage strip and the
 * "keep reading" row at the end of a post.
 */
export function PostCard({
  post,
  priority = false,
  className,
}: {
  post: Post;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[28px] bg-white ring-2 ring-inset ring-ink/8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-40px_rgba(20,18,41,0.45)]",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority={priority}
        />
        <span className="absolute left-5 top-5 rounded-full bg-white/95 px-3.5 py-1.5 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-royal">
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink/40">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span className="mx-2">·</span>
          {post.readingMinutes} min read
        </p>
        <h3 className="mt-4 font-display text-[1.625rem] leading-tight tracking-tight text-ink">
          {post.title}
        </h3>
        <p className="mt-3 flex-1 text-[1.0625rem] leading-relaxed text-ink/65">
          {post.excerpt}
        </p>
        <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-royal">
          Read it
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
