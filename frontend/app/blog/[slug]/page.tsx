import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { TagList } from "@/components/ui/Tag";
import { Thumbnail } from "@/components/post/Thumbnail";
import { Toc } from "@/components/post/Toc";
import { Suggested } from "@/components/post/Suggested";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { formatLongDate, readingTimeMinutes } from "@/lib/format";
import { extractToc } from "@/lib/toc";
import { SITE_URL, SITE_NAME, SITE_AUTHOR } from "@/lib/site";

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
  if (!post) return { title: "Không tìm thấy bài viết" };

  const url = `${SITE_URL}/blog/${slug}`;
  // Use the post's own cover image for social cards when it has one.
  const images = post.thumbnail ? [post.thumbnail] : undefined;

  return {
    title: post.title,
    description: post.summary,
    // Canonical: tell Google this apex URL is the one true address for the
    // page, even if it is reached via www or with tracking params.
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      url,
      publishedTime: post.created_at,
      authors: [SITE_AUTHOR],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getAllPosts();
  const minutes = readingTimeMinutes(post.body);
  const tags = post.tags ?? [];
  const toc = extractToc(post.body);

  // Structured data (schema.org BlogPosting): a machine-readable summary of the
  // article Google can use for richer search results. It restates fields the
  // page already shows, in the vocabulary crawlers understand.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.created_at,
    author: { "@type": "Person", name: SITE_AUTHOR },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
    ...(post.thumbnail ? { image: post.thumbnail } : {}),
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* breadcrumb */}
      <div className="mb-10 flex items-center gap-2 font-mono text-[12.5px] text-muted">
        <Link href="/blog" className="hover:text-ink">
          Blog
        </Link>
        <span className="text-hairline">/</span>
        <span className="truncate text-ink">{post.title}</span>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_248px] lg:gap-14">
        {/* main column */}
        <div className="min-w-0">
          <article className="max-w-2xl">
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
                <span className="font-mono text-[13px]">{minutes} min read</span>
              </div>
              <TagList tags={tags} />
            </div>

            {/* lead thumbnail (placeholder until a real image is set) */}
            <Thumbnail
              src={post.thumbnail}
              alt={post.title}
              className="mt-8 aspect-[16/9] w-full"
            />

            {/* compact TOC for narrow screens, where the rail is hidden */}
            {toc.length >= 2 && (
              <div className="mt-8 rounded-card border border-hairline p-5 lg:hidden">
                <Toc items={toc} />
              </div>
            )}

            {/* body, rendered from the post's MDX source */}
            <div className="mt-8">
              {post.body ? (
                <MDXRemote
                  source={post.body}
                  components={mdxComponents}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      // Shiki gives fenced code blocks VS Code quality colors
                      // (light-plus is VS Code's default light theme).
                      rehypePlugins: [[rehypeShiki, { theme: "light-plus" }]],
                    },
                  }}
                />
              ) : (
                <p className="text-[18px] leading-[1.78] text-muted">
                  Bài viết này chưa có nội dung.
                </p>
              )}
            </div>
          </article>

          {/* footer */}
          <div className="mt-16 max-w-2xl border-t border-hairline pt-8">
            <Link
              href="/blog"
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
              Back to Blog
            </Link>
          </div>
        </div>

        {/* rail: sticky table of contents + suggested reading (desktop only) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-10">
            <Toc items={toc} scrollable />
            <Suggested posts={allPosts} currentSlug={slug} />
          </div>
        </aside>
      </div>
    </main>
  );
}
