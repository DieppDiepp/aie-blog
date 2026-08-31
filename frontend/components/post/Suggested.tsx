import Link from "next/link";
import type { Post } from "@/lib/types";
import { Tag } from "@/components/ui/Tag";
import { Thumbnail } from "./Thumbnail";
import { formatYearMonth, readingTimeMinutes } from "@/lib/format";

// Suggested reading in the article rail. Each entry is a small editorial card:
// a wide cover on top, the title, and a compact meta line (topic, date, reading
// time). Kept to a few cards so the rail stays light next to the table of
// contents.
export function Suggested({
  posts,
  currentSlug,
  limit = 3,
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
      <ul className="mt-4 space-y-3">
        {others.map((post) => {
          const minutes = readingTimeMinutes(post.body);
          // Prefer the subject (topic) tag over a difficulty chip for context.
          const topic = post.tags?.find((t) => t.variant === "topic") ?? post.tags?.[0];
          return (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-[13px] border border-hairline bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--accent-line)] hover:shadow-[0_8px_22px_-14px_rgba(22,24,29,0.3)]"
              >
                <div className="aspect-[16/9] w-full border-b border-hairline">
                  <Thumbnail
                    src={post.thumbnail}
                    alt={post.title}
                    rounded="rounded-none"
                    className="h-full w-full"
                  />
                </div>
                <div className="flex flex-col gap-2.5 px-3.5 pb-3.5 pt-3">
                  <h4 className="line-clamp-2 font-serif text-[15px] font-medium leading-[1.32] tracking-[-0.01em] text-ink transition-colors group-hover:text-accent">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    {topic && <Tag {...topic} />}
                    <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-muted">
                      <span>{formatYearMonth(post.created_at)}</span>
                      <span className="inline-block h-2.5 w-px bg-hairline" />
                      <span>{minutes} min</span>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
