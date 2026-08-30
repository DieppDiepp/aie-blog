import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { getTopic, postsForTopic, TOPICS } from "@/lib/topics";
import { PostRow } from "@/components/post/PostCard";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  return { title: topic ? `${topic.name}` : "Không tìm thấy chủ đề" };
}

export default async function TopicPage({ params }: Params) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const posts = await getAllPosts();
  const items = postsForTopic(posts, topic);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-20 md:px-10 md:py-28">
      {/* breadcrumb */}
      <div className="mb-8 flex items-center gap-2 font-mono text-[12.5px] text-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="text-hairline">/</span>
        <Link href="/topics" className="hover:text-ink">
          Chủ đề
        </Link>
        <span className="text-hairline">/</span>
        <span className="text-ink">{topic.name}</span>
      </div>

      <h1 className="font-serif text-[40px] font-medium leading-tight tracking-[-0.022em] text-ink md:text-[52px]">
        {topic.name}
      </h1>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
        {topic.blurb}
      </p>

      <div className="mt-14">
        {items.length === 0 ? (
          <div className="rounded-card border border-dashed border-hairline bg-surface px-8 py-14 text-center">
            <p className="font-serif text-[20px] text-ink">Đang cập nhật thêm</p>
            <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
              Chủ đề này chưa có bài viết nào. Mình đang viết dần, bạn ghé lại sau nhé.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex text-[14px] font-medium text-accent hover:text-accent-hover"
            >
              Xem tất cả bài viết
            </Link>
          </div>
        ) : (
          items.map((post) => <PostRow key={post.slug} post={post} />)
        )}
      </div>
    </main>
  );
}
