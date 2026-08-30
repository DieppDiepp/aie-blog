import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { TopicGrid } from "@/components/topic/TopicGrid";

export const metadata: Metadata = {
  title: "Chủ đề",
};

// Overview of every field, each linking to its own page.
export default async function TopicsPage() {
  const posts = await getAllPosts();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-20 md:px-10 md:py-28">
      <h1 className="font-serif text-[40px] font-medium leading-tight tracking-[-0.022em] text-ink md:text-[52px]">
        Chủ đề
      </h1>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
        Các lĩnh vực mình viết quanh đó, từ hạ tầng hệ thống tới mô hình ngôn ngữ.
      </p>

      <div className="mt-14">
        <TopicGrid posts={posts} />
      </div>
    </main>
  );
}
