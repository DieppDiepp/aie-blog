import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { getTopic, postsForTopic, TOPICS } from "@/lib/topics";
import { CompactRow } from "@/components/post/PostCard";
import { TopicStrip } from "@/components/topic/TopicGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Reveal } from "@/components/ui/Reveal";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return { title: "Không tìm thấy chủ đề" };
  return {
    title: topic.name,
    description: topic.blurb,
    alternates: { canonical: `/topics/${topic.slug}` },
  };
}

export default async function TopicPage({ params }: Params) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const posts = await getAllPosts();
  const items = postsForTopic(posts, topic);

  // The tag labels actually used by posts in this field, so the chip row
  // reflects the writing rather than the config.
  const labels = Array.from(
    new Set(
      items.flatMap((post) =>
        (post.tags ?? [])
          .filter((tag) => tag.variant !== "easy" && tag.variant !== "mid" && tag.variant !== "hard")
          .map((tag) => tag.label),
      ),
    ),
  );

  return (
    <main>
      <Breadcrumb trail={[{ href: "/topics", label: "Topics" }]} current={topic.name} />

      <section className="grid border-b-2 border-rule md:grid-cols-[1fr_260px]">
        <div className="border-r-2 border-rule px-14 pb-[34px] pt-11">
          <h1 className="text-[66px] font-extrabold leading-[0.92] tracking-[-0.04em] text-ink">
            {topic.name}
          </h1>
          <p className="mt-4 max-w-[560px] font-serif text-[21px] font-light italic leading-[1.5] text-muted">
            {topic.blurb}
          </p>
          {labels.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-[7px]">
              {labels.map((label) => (
                <Tag key={label} label={label} />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-end p-6">
          <span className="text-[52px] font-extrabold leading-none tracking-[-0.04em] text-ink">
            {String(items.length).padStart(2, "0")}
          </span>
          <span className="mt-2 text-[10px] font-semibold uppercase leading-[1.5] tracking-[0.16em] text-muted">
            Bài trong nhóm này
          </span>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="flex items-center justify-between border-b-2 border-rule px-14 py-14">
          <p className="max-w-[420px] font-serif text-[19px] leading-relaxed text-muted">
            Chủ đề này chưa có bài viết nào. Mình đang viết dần, bạn ghé lại sau nhé.
          </p>
          <Button href="/blog" variant="outline">
            Xem tất cả bài viết
          </Button>
        </div>
      ) : (
        <Reveal>
          <div className="border-b-2 border-rule">
            {items.map((post) => (
              <CompactRow key={post.slug} post={post} />
            ))}
          </div>
        </Reveal>
      )}

      <TopicStrip posts={posts} currentSlug={topic.slug} />
    </main>
  );
}
