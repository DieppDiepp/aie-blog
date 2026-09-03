import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
import type { ShikiTransformer } from "shiki";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { TagList } from "@/components/ui/Tag";
import { Thumbnail } from "@/components/post/Thumbnail";
import { Toc } from "@/components/post/Toc";
import { Suggested, PrevNext } from "@/components/post/Suggested";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { formatLongDate, readingTimeMinutes } from "@/lib/format";
import { extractToc } from "@/lib/toc";
import { getAuthor, DEFAULT_AUTHOR } from "@/lib/authors";
import { SITE_URL, SITE_NAME, SITE_AUTHOR } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

// Copy the fence language onto the <pre> as data-language so CodeBlock's header
// can name it (bash, yaml) instead of a bare "code". @shikijs/rehype does not
// emit that attribute on its own.
const attachLanguage: ShikiTransformer = {
  name: "attach-language",
  pre(node) {
    const lang = this.options.lang;
    if (lang && lang !== "text" && lang !== "plaintext") {
      node.properties = { ...node.properties, "data-language": lang };
    }
  },
};

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
  const images = post.cover ? [post.cover] : undefined;

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

// The drop cap is applied here, on the prose wrapper, rather than in
// mdx-components: only the article's FIRST paragraph gets one, and the MDX
// component map has no way to know which paragraph it is rendering.
const DROP_CAP =
  "[&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-3.5 [&>p:first-of-type]:first-letter:mt-1.5 [&>p:first-of-type]:first-letter:font-serif [&>p:first-of-type]:first-letter:text-[78px] [&>p:first-of-type]:first-letter:leading-[0.74] [&>p:first-of-type]:first-letter:text-accent";

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getAllPosts();
  const index = allPosts.findIndex((p) => p.slug === slug);
  // allPosts is newest first, so the "previous" post in reading order is the
  // newer neighbour and "next" is the older one.
  const prev = index > 0 ? allPosts[index - 1] : null;
  const next = index >= 0 && index < allPosts.length - 1 ? allPosts[index + 1] : null;

  const minutes = readingTimeMinutes(post.body);
  const tags = post.tags ?? [];
  const toc = extractToc(post.body);
  // Post frontmatter has no author field yet, so every post resolves to the
  // default author (see lib/authors.ts). The byline links to that author page.
  const author = getAuthor(DEFAULT_AUTHOR);
  const authorHref = `/authors/${author?.slug ?? DEFAULT_AUTHOR}`;

  // Structured data (schema.org BlogPosting): a machine-readable summary of the
  // article Google can use for richer search results. It restates fields the
  // page already shows, in the vocabulary crawlers understand.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.created_at,
    author: { "@type": "Person", name: SITE_AUTHOR, url: `${SITE_URL}${authorHref}` },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
    ...(post.cover ? { image: post.cover } : {}),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb trail={[{ href: "/blog", label: "Blog" }]} current={post.title} />

      {/* Title block. The chips sit above the h1 because they are a
          classification control, not a text eyebrow. */}
      <header className="border-b-2 border-rule px-14 pb-[34px] pt-[52px]">
        <TagList tags={tags} className="mb-5" />
        <h1 className="max-w-[900px] text-[62px] font-extrabold leading-[0.96] tracking-[-0.04em] text-ink [text-wrap:balance]">
          {post.title}
        </h1>
        {post.summary && (
          <p className="mt-5 max-w-[660px] font-serif text-[22px] font-light italic leading-[1.5] text-muted">
            {post.summary}
          </p>
        )}
        <div className="mt-7 flex flex-wrap items-center border-t border-hairline pt-4">
          <Link
            href={authorHref}
            className="group flex items-center gap-2 pr-5"
            aria-label={`Trang tác giả ${author?.name ?? SITE_AUTHOR}`}
          >
            <span className="relative block h-[22px] w-[22px] shrink-0 overflow-hidden border border-hairline bg-ink">
              {author?.avatar && (
                <Image src={author.avatar} alt="" fill sizes="22px" className="object-cover" />
              )}
            </span>
            <span className="text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-ink transition-colors group-hover:text-accent-deep">
              {author?.name ?? SITE_AUTHOR}
            </span>
          </Link>
          <span className="border-l border-hairline px-5 text-[11px] font-medium uppercase leading-none tracking-[0.12em] text-muted">
            {formatLongDate(post.created_at)}
          </span>
          <span className="border-l border-hairline px-5 text-[11px] font-medium uppercase leading-none tracking-[0.12em] text-muted">
            {minutes} phút đọc
          </span>
          {index >= 0 && (
            <span className="border-l border-hairline px-5 text-[11px] font-bold uppercase leading-none tracking-[0.12em] text-accent-deep">
              Bài {String(allPosts.length - index).padStart(2, "0")} / {String(allPosts.length).padStart(2, "0")}
            </span>
          )}
        </div>
      </header>

      {/* Full-bleed cover, with the summary repeated as a caption strip. */}
      {post.cover && (
        <>
          <div className="h-[500px] border-b-2 border-rule bg-ink">
            <Thumbnail src={post.cover} alt={post.title} fit="cover" priority />
          </div>
          {post.summary && (
            <p className="border-b-2 border-rule px-14 py-2.5 font-serif text-[12px] font-medium italic leading-relaxed text-muted">
              {post.summary}
            </p>
          )}
        </>
      )}

      <div className="grid lg:grid-cols-[320px_1fr]">
        {/* Rail: sticky table of contents and read-next (desktop only). */}
        <aside className="hidden border-r border-hairline py-9 pl-14 pr-8 lg:block">
          <div className="sticky top-[136px] flex flex-col gap-6">
            <Toc items={toc} scrollable />
            <Suggested posts={allPosts} currentSlug={slug} />
          </div>
        </aside>

        <article className="max-w-[920px] px-14 pb-14 pt-10 lg:pl-12">
          {/* Compact TOC for narrow screens, where the rail is hidden. */}
          {toc.length >= 2 && (
            <div className="mb-8 border-2 border-rule p-5 lg:hidden">
              <Toc items={toc} />
            </div>
          )}

          {post.body ? (
            <div className={DROP_CAP}>
              <MDXRemote
                source={post.body}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    // A dark Shiki theme, because fenced blocks render on the
                    // ink field supplied by CodeBlock. The transformer copies the
                    // fence language onto the <pre> as data-language so CodeBlock's
                    // header can name it (bash, yaml) instead of a bare "code".
                    rehypePlugins: [
                      [rehypeShiki, { theme: "github-dark", transformers: [attachLanguage] }],
                    ],
                  },
                }}
              />
            </div>
          ) : (
            <p className="font-serif text-[19px] leading-[1.72] text-muted">
              Bài viết này chưa có nội dung.
            </p>
          )}
        </article>
      </div>

      <PrevNext prev={prev} next={next} />
    </main>
  );
}
