import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { buildGraph } from "@/lib/graph";
import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph";
import { TOPICS, postsForTopic } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Graph",
  description:
    "Bản đồ tri thức: mỗi chủ đề là một điểm nối, mỗi bài viết là một nút gắn vào chủ đề của nó.",
  alternates: { canonical: "/graph" },
};

// The knowledge graph: a live map of how the writing connects. Built from the
// same posts and topics as the rest of the site, so it is never out of date.
export default async function GraphPage() {
  const posts = await getAllPosts();
  const graph = buildGraph(posts);

  return (
    <main>
      <section className="grid border-b-2 border-rule md:grid-cols-[1fr_320px]">
        <div className="border-r-2 border-rule px-14 pb-10 pt-12">
          <h1 className="text-[58px] font-extrabold leading-[0.95] tracking-[-0.04em] text-ink">
            Knowledge
            <br />
            Graph
          </h1>
          <p className="mt-5 max-w-[520px] font-serif text-[20px] font-light italic leading-[1.5] text-muted">
            Mỗi chủ đề là một điểm nối, mỗi bài viết là một nút gắn vào chủ đề của
            nó. Bản đồ lớn dần theo số bài mình viết.
          </p>
        </div>
        <div className="flex flex-col justify-end p-6">
          <span className="text-[44px] font-extrabold leading-none tracking-[-0.03em] text-ink">
            {TOPICS.length} <span className="text-accent">/</span> {posts.length}
          </span>
          <span className="mt-1.5 text-[10px] font-semibold uppercase leading-[1.5] tracking-[0.16em] text-muted">
            Chủ đề / Bài viết
          </span>
        </div>
      </section>

      <KnowledgeGraph data={graph} />

      <div className="grid gap-px border-b-2 border-rule bg-hairline md:grid-cols-3">
        {TOPICS.map((topic) => {
          const count = postsForTopic(posts, topic).length;
          return (
            <Link key={topic.slug} href={`/topics/${topic.slug}`} className="block bg-bg p-5">
              <span
                className={`block text-[11px] font-extrabold leading-none tracking-[0.16em] ${
                  count > 0 ? "text-accent-deep" : "text-[rgba(32,30,29,0.45)]"
                }`}
              >
                {count} bài
              </span>
              <span className="mt-2.5 block text-[18px] font-bold leading-tight tracking-[-0.02em] text-ink">
                {topic.name}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
