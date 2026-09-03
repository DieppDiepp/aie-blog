import Link from "next/link";
import type { Post } from "@/lib/types";
import { TOPICS, postsForTopic } from "@/lib/topics";

// The topics grid: six equal cells separated by 2px ink gaps (the container's
// background shows through the gap, so the rules are the gaps). A field with
// posts lists its two most recent titles inside the cell; a field without posts
// says so plainly rather than inventing a number.
function TopicCell({
  topic,
  posts,
}: {
  topic: (typeof TOPICS)[number];
  posts: Post[];
}) {
  const count = posts.length;
  const has = count > 0;

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="flex min-h-[230px] flex-col bg-bg px-8 py-[30px] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_7%,var(--bg))]"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[30px] font-extrabold leading-none tracking-[-0.03em] text-ink">
          {topic.name}
        </span>
        {has ? (
          <span className="whitespace-nowrap bg-ink px-[9px] py-1.5 text-[11px] font-bold uppercase leading-none tracking-[0.14em] text-ink-invert">
            {count} bài
          </span>
        ) : (
          <span className="whitespace-nowrap border border-[rgba(32,30,29,0.35)] px-[9px] py-1.5 text-[11px] font-bold uppercase leading-none tracking-[0.14em] text-muted">
            Đang cập nhật
          </span>
        )}
      </div>

      <p className="mt-3 max-w-[420px] font-serif text-[16px] leading-relaxed text-muted">
        {topic.blurb}
      </p>

      {has ? (
        <div className="mt-auto flex flex-col pt-5">
          {posts.slice(0, 2).map((post) => (
            <span
              key={post.slug}
              className="border-t border-[rgba(32,30,29,0.2)] py-[9px] text-[13.5px] font-semibold leading-snug text-ink"
            >
              {post.title}
            </span>
          ))}
          <span className="border-t border-[rgba(32,30,29,0.2)] pt-3 text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-accent-deep">
            Xem cả {count} bài
          </span>
        </div>
      ) : (
        <span className="mt-auto border-t border-[rgba(32,30,29,0.2)] pt-5 font-serif text-[15px] italic leading-relaxed text-[rgba(32,30,29,0.5)]">
          Chưa có bài nào trong nhóm này.
        </span>
      )}
    </Link>
  );
}

export function TopicGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid gap-0.5 bg-ink md:grid-cols-2">
      {TOPICS.map((topic) => (
        <TopicCell key={topic.slug} topic={topic} posts={postsForTopic(posts, topic)} />
      ))}
    </div>
  );
}

// The strip of other fields at the foot of a topic page, so a reader who
// finishes one field can step sideways into another.
export function TopicStrip({
  posts,
  currentSlug,
}: {
  posts: Post[];
  currentSlug: string;
}) {
  const others = TOPICS.filter((t) => t.slug !== currentSlug);
  return (
    <div className="grid gap-px border-b-2 border-rule bg-hairline md:grid-cols-5">
      {others.map((topic) => (
        <Link
          key={topic.slug}
          href={`/topics/${topic.slug}`}
          className="bg-bg px-5 py-[18px] transition-colors hover:bg-accent-tint-soft"
        >
          <span className="block text-[15px] font-bold leading-tight tracking-[-0.01em] text-ink">
            {topic.name}
          </span>
          <span className="mt-1.5 block text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-muted">
            {postsForTopic(posts, topic).length} bài
          </span>
        </Link>
      ))}
    </div>
  );
}
