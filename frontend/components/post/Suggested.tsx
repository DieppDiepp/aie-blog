import Link from "next/link";
import type { Post } from "@/lib/types";

// "Read next" in the article rail, under the table of contents. Deliberately
// text-only: the rail should stay quiet next to the body, and the cover art
// already appears full-bleed at the top of every article.
export function Suggested({
  posts,
  currentSlug,
  limit = 2,
}: {
  posts: Post[];
  currentSlug: string;
  limit?: number;
}) {
  const others = posts.filter((p) => p.slug !== currentSlug).slice(0, limit);
  if (others.length === 0) return null;

  return (
    <div className="border-t border-hairline pt-4">
      <span className="block text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-muted">
        Đọc tiếp
      </span>
      <ul className="m-0 mt-3 list-none space-y-2.5 p-0">
        {others.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="block text-[13px] font-semibold leading-snug text-ink transition-colors hover:text-accent"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// The ink field at the foot of an article: previous post on the left, next on
// the right. Replaces the old "Back to Blog" link, which was a dead end.
export function PrevNext({
  prev,
  next,
}: {
  prev?: Post | null;
  next?: Post | null;
}) {
  if (!prev && !next) return null;

  return (
    <div className="grid border-t-2 border-rule bg-ink text-ink-invert md:grid-cols-2">
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group border-r border-[rgba(243,242,242,0.2)] px-14 py-[34px]"
        >
          <span className="block text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-[rgba(243,242,242,0.5)]">
            ← Bài trước
          </span>
          <span className="mt-3 block text-[24px] font-bold leading-tight tracking-[-0.02em] transition-colors group-hover:text-accent">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={`/blog/${next.slug}`} className="group px-14 py-[34px] text-right">
          <span className="block text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-accent">
            Bài sau →
          </span>
          <span className="mt-3 block text-[24px] font-bold leading-tight tracking-[-0.02em] transition-colors group-hover:text-accent">
            {next.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
