import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { TopicGrid } from "@/components/topic/TopicGrid";
import { Tag } from "@/components/ui/Tag";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Chủ đề",
  description: "Sáu nhóm mà blog này xếp bài vào, từ hạ tầng hệ thống tới mô hình ngôn ngữ.",
  alternates: { canonical: "/topics" },
};

// Overview of every field, each linking to its own page.
export default async function TopicsPage() {
  const posts = await getAllPosts();

  return (
    <main>
      <section className="border-b-2 border-rule px-14 pb-9 pt-12">
        <h1 className="text-[62px] font-extrabold leading-[0.94] tracking-[-0.04em] text-ink">
          Chủ đề
        </h1>
        <p className="mt-4.5 max-w-[620px] font-serif text-[21px] font-light italic leading-[1.5] text-muted">
          Sáu nhóm mà blog này xếp bài vào. Nhóm nào chưa có bài thì vẫn có trang
          riêng, chỉ là đang trống.
        </p>
      </section>

      <Reveal as="section">
        <div className="border-b-2 border-rule">
          <TopicGrid posts={posts} />
        </div>
      </Reveal>

      <div className="flex items-center justify-between px-14 py-[22px]">
        <span className="text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-muted">
          Độ khó gắn theo từng bài, không theo chủ đề
        </span>
        <div className="flex gap-[7px]">
          <Tag label="Cơ bản" variant="easy" />
          <Tag label="Trung bình" variant="mid" />
          <Tag label="Khó" variant="hard" />
        </div>
      </div>
    </main>
  );
}
