import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { TOPICS, postsForTopic } from "@/lib/topics";
import { LeadPost, NumberedRow } from "@/components/post/PostCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { readingTimeMinutes } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tất cả bài viết và ghi chú về xây dựng hệ thống AI, mới nhất trước.",
  alternates: { canonical: "/blog" },
};

// The full index of posts, ordered newest first: a lead spread, then a
// numbered table. The filter bar is a single unbroken rail; each cell is
// divided by a 1px rule rather than sitting in its own box.
export default async function BlogPage() {
  const posts = await getAllPosts();
  const [lead, ...others] = posts;
  const totalMinutes = posts.reduce((sum, p) => sum + readingTimeMinutes(p.body), 0);

  return (
    <main>
      <section className="grid border-b-2 border-rule md:grid-cols-[1fr_300px]">
        <div className="border-r-2 border-rule px-14 pb-9 pt-12">
          <h1 className="text-[62px] font-extrabold leading-[0.94] tracking-[-0.04em] text-ink">
            Tất cả bài viết
          </h1>
          <p className="mt-4.5 max-w-[540px] font-serif text-[21px] font-light italic leading-[1.5] text-muted">
            {posts.length > 0
              ? `${posts.length} bài đã viết, xếp theo thứ tự mới nhất. Lọc theo chủ đề ở thanh bên dưới.`
              : "Chưa có bài viết nào. Bài đầu tiên đang được viết."}
          </p>
        </div>
        <div className="flex flex-col justify-end p-6">
          <span className="text-[52px] font-extrabold leading-none tracking-[-0.04em] text-ink">
            {String(posts.length).padStart(2, "0")}
          </span>
          <span className="mt-2 text-[10px] font-semibold uppercase leading-[1.5] tracking-[0.16em] text-muted">
            Bài viết, {totalMinutes} phút đọc
          </span>
        </div>
      </section>

      {/* Filter rail. Counts are live, and a field with nothing in it is dimmed
          rather than hidden, so the map of where the writing is headed stays
          visible. */}
      <nav
        aria-label="Lọc theo chủ đề"
        className="flex items-stretch border-b-2 border-rule"
      >
        <span className="flex items-center border-r border-hairline pl-14 pr-5 text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-muted">
          Chủ đề
        </span>
        <span className="flex items-center bg-ink px-[18px] py-3.5 text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-ink-invert">
          Tất cả
        </span>
        {TOPICS.map((topic) => {
          const count = postsForTopic(posts, topic).length;
          return (
            <Link
              key={topic.slug}
              href={`/topics/${topic.slug}`}
              className={`flex items-center border-r border-hairline px-[18px] py-3.5 text-[11px] font-semibold uppercase leading-none tracking-[0.12em] transition-colors ${
                count > 0 ? "text-ink hover:bg-accent-tint" : "text-[rgba(32,30,29,0.45)]"
              }`}
            >
              {topic.name} {count}
            </Link>
          );
        })}
        <span className="flex-1" />
        <span className="flex items-center border-l border-hairline pl-5 pr-14 text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-muted">
          Mới nhất trước
        </span>
      </nav>

      {lead && (
        <Reveal>
          <LeadPost post={lead} />
        </Reveal>
      )}

      {others.length > 0 && (
        <Reveal>
          <div className="border-b-2 border-rule">
            {others.map((post, i) => (
              <NumberedRow key={post.slug} post={post} index={i + 2} />
            ))}
          </div>
        </Reveal>
      )}

      <div className="flex items-center justify-between px-14 py-[22px]">
        <span className="text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-muted">
          {posts.length > 0
            ? "Hết trang 1, đây là toàn bộ bài đã viết"
            : "Danh sách sẽ hiện ở đây khi bài đầu tiên xong"}
        </span>
        <Button href="/graph" variant="outline">
          Xem bản đồ tri thức
        </Button>
      </div>
    </main>
  );
}
