import Link from "next/link";
import type { Post } from "@/lib/types";
import { Thumbnail } from "./Thumbnail";
import { formatYearMonth } from "@/lib/format";

// A short list of other posts to read next, shown in the article rail. Each
// row carries a small thumbnail (placeholder until art is added).
export function Suggested({
  posts,
  currentSlug,
  limit = 4,
}: {
  posts: Post[];
  currentSlug: string;
  limit?: number;
}) {
  const others = posts.filter((p) => p.slug !== currentSlug).slice(0, limit);
  if (others.length === 0) return null;

  return (
    <div>
      <span className="block font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
        Suggested
      </span>
      <ul className="mt-4 space-y-4">
        {others.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group flex gap-3">
              <Thumbnail
                src={post.thumbnail}
                alt=""
                rounded="rounded-[8px]"
                className="h-[46px] w-[62px] shrink-0"
              />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="line-clamp-2 font-serif text-[14.5px] leading-snug text-ink-body transition-colors group-hover:text-accent">
                  {post.title}
                </span>
                <span className="font-mono text-[11px] text-muted">
                  {formatYearMonth(post.created_at)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
