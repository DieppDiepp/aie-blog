import Link from "next/link";
import type { Post } from "@/lib/types";
import { TOPICS, postsForTopic } from "@/lib/topics";

// A single field card: name, one-line blurb, and a live count that also tells
// the reader whether the field has anything to read yet.
function TopicCard({ post, count }: { post: (typeof TOPICS)[number]; count: number }) {
  const has = count > 0;
  return (
    <Link
      href={`/topics/${post.slug}`}
      className="group relative flex flex-col rounded-card border border-hairline bg-surface p-6 transition-colors hover:border-accent-line"
    >
      <h3 className="font-serif text-[20px] font-medium tracking-[-0.01em] text-ink transition-colors group-hover:text-accent">
        {post.name}
      </h3>
      <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{post.blurb}</p>
      <span className="mt-5 font-mono text-[12px] uppercase tracking-[0.06em] text-muted">
        {has ? `${count} bài viết` : "Đang cập nhật"}
      </span>
    </Link>
  );
}

// Grid of every field, with counts computed from the current post set.
export function TopicGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TOPICS.map((topic) => (
        <TopicCard
          key={topic.slug}
          post={topic}
          count={postsForTopic(posts, topic).length}
        />
      ))}
    </div>
  );
}
