import Link from "next/link";
import type { Post } from "@/lib/types";
import { Tag, TagList } from "@/components/ui/Tag";
import { formatYearMonth, readingTimeMinutes } from "@/lib/format";

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h9M8.5 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Featured post: a tinted card used for the most recent or pinned article.
// The right-hand rail carries reading time, set off by a hairline border,
// echoing the approved mockup's editorial "sidebar" treatment.
export function FeaturedPost({ post }: { post: Post }) {
  const tags = post.tags ?? [];
  const minutes = readingTimeMinutes(post.body);
  return (
    <Link
      href={`/brain/${post.slug}`}
      className="group block rounded-card border p-7 md:p-8"
      style={{ background: "var(--accent-wash)", borderColor: "var(--accent-line)" }}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-9">
        <div className="flex-1">
          <span className="font-mono text-[12.5px] text-muted">
            {formatYearMonth(post.created_at)}
          </span>
          <h3 className="mt-2 font-serif text-[28px] font-medium leading-[1.12] tracking-[-0.017em] text-ink md:text-[30px]">
            {post.title}
          </h3>
          {post.summary && (
            <p className="mt-2.5 max-w-xl text-[15.5px] leading-relaxed text-muted">
              {post.summary}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <TagList tags={tags} />
            <span className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-medium text-accent transition-colors group-hover:text-accent-hover">
              Đọc bài <ArrowRight />
            </span>
          </div>
        </div>
        <div
          className="flex shrink-0 flex-row gap-5 border-t pt-4 md:w-[130px] md:flex-col md:gap-3 md:border-l md:border-t-0 md:pl-6 md:pt-0"
          style={{ borderColor: "var(--accent-line)" }}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
            Bài nổi bật
          </span>
          <span className="font-mono text-[13px] text-ink-body">{minutes} phút đọc</span>
        </div>
      </div>
    </Link>
  );
}

// Compact post row for lists. Bleeds to the edge of the container on hover
// (negative margin matching the horizontal padding) so the tint reaches the
// full row width, not just the text column.
export function PostRow({ post }: { post: Post }) {
  const firstTag = post.tags?.[0];
  return (
    <Link
      href={`/brain/${post.slug}`}
      className="group -mx-4 grid grid-cols-[64px_1fr] items-baseline gap-5 rounded-[10px] border-b border-hairline px-4 py-6 transition-colors last:border-b-0 hover:bg-[rgba(22,24,29,0.025)] md:grid-cols-[92px_1fr_auto] md:items-start md:gap-8"
    >
      <span className="font-mono text-[12.5px] text-muted md:pt-0.5">
        {formatYearMonth(post.created_at)}
      </span>
      <span className="flex flex-col gap-1.5">
        <span className="font-serif text-[20px] font-medium leading-tight tracking-[-0.01em] text-ink transition-colors group-hover:text-accent md:text-[21px]">
          {post.title}
        </span>
        {post.summary && (
          <span className="text-[15px] leading-normal text-muted">{post.summary}</span>
        )}
      </span>
      {firstTag && (
        <span className="col-span-2 flex md:col-span-1 md:justify-end md:pt-0.5">
          <Tag {...firstTag} />
        </span>
      )}
    </Link>
  );
}
