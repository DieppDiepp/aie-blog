import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { buildGraph } from "@/lib/graph";
import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph";

export const metadata: Metadata = {
  title: "Graph · AI Engineer Blog",
};

// The knowledge graph: a live map of how the writing connects. Built from the
// same posts and topics as the rest of the site, so it is never out of date.
export default async function GraphPage() {
  const posts = await getAllPosts();
  const graph = buildGraph(posts);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10 md:py-20">
      <h1 className="font-serif text-[40px] font-medium leading-tight tracking-[-0.022em] text-ink md:text-[52px]">
        Knowledge Graph
      </h1>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
        Mỗi chủ đề là một điểm nối, mỗi bài viết là một nút gắn vào chủ đề của
        nó. Bản đồ lớn dần theo số bài mình viết.
      </p>

      <div className="mt-10">
        <KnowledgeGraph data={graph} />
      </div>

      <p className="mt-4 text-[13.5px] text-muted">
        Kéo các nút để sắp xếp lại, rê chuột để làm nổi vùng liên quan, bấm để mở.
      </p>
    </main>
  );
}
