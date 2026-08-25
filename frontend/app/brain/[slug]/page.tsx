import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { Header } from "@/components/site/Header";
import { TagList } from "@/components/ui/Tag";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { formatLongDate, readingTimeMinutes } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

// Prerender every published post at build time (see ADR-0004: a post ships
// as a commit and a build, not an on-demand write). A slug outside this
// list (e.g. a draft opened by direct link) still renders on request.
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return { title: post ? post.title : "Không tìm thấy bài viết" };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const minutes = readingTimeMinutes(post.body);
  const tags = post.tags ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 md:py-24">
        {/* breadcrumb */}
        <div className="mb-12 flex items-center gap-2 font-mono text-[12.5px] text-muted">
          <Link href="/brain" className="hover:text-ink">
            Brain
          </Link>
          <span className="text-hairline">/</span>
          <span className="truncate text-ink">{post.title}</span>
        </div>

        <article>
          <h1 className="text-balance font-serif text-[36px] font-medium leading-[1.06] tracking-[-0.022em] text-ink md:text-[48px]">
            {post.title}
          </h1>

          {post.summary && (
            <p className="mt-6 font-serif text-[20px] italic leading-[1.55] text-muted md:text-[21px]">
              {post.summary}
            </p>
          )}

          {/* byline */}
          <div className="mt-8 flex flex-col gap-4 border-b border-hairline pb-8">
            <div className="flex items-center gap-4 text-[14px] text-muted">
              <span className="font-medium text-ink">Nguyên</span>
              <span className="inline-block h-3 w-px bg-hairline" />
              <span className="font-mono text-[13px]">{formatLongDate(post.created_at)}</span>
              <span className="inline-block h-3 w-px bg-hairline" />
              <span className="font-mono text-[13px]">{minutes} phút đọc</span>
            </div>
            <TagList tags={tags} />
          </div>

          {/* body, rendered from the post's MDX source */}
          <div className="mt-4">
            {post.body ? (
              <MDXRemote
                source={post.body}
                components={mdxComponents}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              />
            ) : (
              <p className="text-[18px] leading-[1.78] text-muted">
                Bài viết này chưa có nội dung.
              </p>
            )}
          </div>
        </article>

        {/* footer */}
        <div className="mt-16 border-t border-hairline pt-8">
          <Link
            href="/brain"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-accent hover:text-accent-hover"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M13 8H4M7.5 4l-4 4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Quay lại Brain
          </Link>
        </div>
      </main>
    </div>
  );
}
