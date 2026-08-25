import Link from "next/link";
import type { Post } from "@/lib/types";
import { Tag, TagList } from "@/components/ui/Tag";
import { formatYearMonth } from "@/lib/format";

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
export function FeaturedPost({ post }: { post: Post }) {
  const tags = post.tags ?? [];
  return (
    <Link
      href={`/brain/${post.slug}`}
      className="block rounded-[18px] border p-7 md:p-8"
      style={{ background: "var(--accent-wash)", borderColor: "var(--accent-line)" }}
    >
      <div className="flex justify-end">
        <span className="font-mono text-[12.5px] text-muted">
          {formatYearMonth(post.created_at)}
        </span>
      </div>
      <h3 className="mt-1.5 font-serif text-[28px] font-medium leading-[1.12] tracking-[-0.017em] text-ink md:text-[30px]">
        {post.title}
      </h3>
      {post.summary && (
        <p className="mt-2.5 max-w-xl text-[15.5px] leading-relaxed text-muted">
          {post.summary}
        </p>
      )}
      <div className="mt-5 flex items-center justify-between gap-4">
        <TagList tags={tags} />
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-medium text-accent">
          Đọc bài <ArrowRight />
        </span>
      </div>
    </Link>
  );
}

// Compact post row for lists.
export function PostRow({ post }: { post: Post }) {
  const firstTag = post.tags?.[0];
  return (
    <Link
      href={`/brain/${post.slug}`}
      className="grid grid-cols-[72px_1fr] items-baseline gap-6 border-b border-hairline py-6 last:border-b-0 md:grid-cols-[88px_1fr_auto] md:gap-8"
    >
      <span className="font-mono text-[13px] text-muted">
        {formatYearMonth(post.created_at)}
      </span>
      <span className="flex flex-col gap-1.5">
        <span className="font-serif text-[20px] font-medium leading-tight tracking-[-0.01em] text-ink md:text-[22px]">
          {post.title}
        </span>
        {post.summary && (
          <span className="text-[15px] leading-normal text-muted">{post.summary}</span>
        )}
      </span>
      {firstTag && (
        <span className="col-span-2 flex md:col-span-1 md:justify-end">
          <Tag {...firstTag} />
        </span>
      )}
    </Link>
  );
}
