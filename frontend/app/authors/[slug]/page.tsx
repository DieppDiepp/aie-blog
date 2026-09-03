import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AUTHORS, getAuthor, postsByAuthor } from "@/lib/authors";
import { getProjectsByAuthor } from "@/lib/projects";
import { getAllPosts } from "@/lib/posts";
import { AuthorHero } from "@/components/author/AuthorHero";
import { AuthorProjectRow, AuthorPostRow } from "@/components/author/AuthorRows";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export async function generateStaticParams() {
  return AUTHORS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) return {};
  return {
    title: author.fullName,
    description: author.role,
    alternates: { canonical: `/authors/${author.slug}` },
    openGraph: {
      type: "profile",
      title: author.fullName,
      description: author.role,
      url: `/authors/${author.slug}`,
      images: author.avatar ? [author.avatar] : undefined,
    },
  };
}

// One author, read as a portfolio: who they are, then their projects with the
// numbers, then their posts. Nothing else. No awards shelf, no timeline: the
// projects carry the proof.
export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  const [projects, allPosts] = await Promise.all([getProjectsByAuthor(slug), getAllPosts()]);
  const posts = postsByAuthor(allPosts, slug);

  // Structured data: a Person entity for this author, so the byline links on
  // articles resolve to a machine-readable profile.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.fullName,
    alternateName: author.name,
    description: author.role,
    url: `${SITE_URL}/authors/${author.slug}`,
    ...(author.avatar ? { image: `${SITE_URL}${author.avatar}` } : {}),
    worksFor: { "@type": "Organization", name: SITE_NAME },
    sameAs: [author.links?.linkedin, author.links?.github].filter(Boolean),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb trail={[{ href: "/projects", label: "Tác giả" }]} current={author.name} />

      <AuthorHero author={author} postCount={posts.length} projectCount={projects.length} />

      <section className="grid gap-11 border-b-2 border-rule px-14 py-[42px] md:grid-cols-2">
        {author.bio.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="m-0 font-serif text-[18px] leading-[1.7] text-ink-body">
            {paragraph}
          </p>
        ))}
      </section>

      <div className="flex items-center justify-between border-b-2 border-rule bg-ink px-14 py-4 text-ink-invert">
        <h2 className="m-0 text-[15px] font-extrabold uppercase leading-none tracking-[0.16em]">
          Dự án của {author.name}
        </h2>
        <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-[rgba(243,242,242,0.55)]">
          {String(projects.length).padStart(2, "0")} dự án
        </span>
      </div>

      {projects.length > 0 ? (
        projects.map((project, i) => (
          <Reveal key={project.slug}>
            <AuthorProjectRow project={project} last={i === projects.length - 1} />
          </Reveal>
        ))
      ) : (
        <div className="border-b-2 border-rule px-14 py-12">
          <p className="m-0 font-serif text-[18px] leading-relaxed text-muted">
            Tác giả này chưa đăng dự án nào.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between border-b-2 border-rule px-14 py-4">
        <h2 className="m-0 text-[15px] font-extrabold uppercase leading-none tracking-[0.16em] text-ink">
          Bài viết của {author.name}
        </h2>
        <Link
          href="/blog"
          className="text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-accent-deep no-underline"
        >
          Xem cả blog →
        </Link>
      </div>

      {posts.length > 0 && (
        <div className="border-b-2 border-rule">
          {posts.map((post, i) => (
            <AuthorPostRow
              key={post.slug}
              post={post}
              index={i + 1}
              last={i === posts.length - 1}
            />
          ))}
        </div>
      )}

      <section className="flex flex-col items-start justify-between gap-10 bg-ink px-14 py-10 text-ink-invert md:flex-row md:items-end">
        <p className="m-0 max-w-[660px] font-serif text-[28px] italic leading-snug">
          Nếu bạn cũng đang làm một dự án và muốn kể lại nó cho đàng hoàng, blog
          luôn mở cho tác giả mới.
          <span className="mt-4 block text-[12px] font-bold uppercase not-italic leading-none tracking-[0.2em]">
            Founder, AI Engineer Blog
          </span>
        </p>
        <Button href="/projects" variant="primary">
          Gửi dự án →
        </Button>
      </section>
    </main>
  );
}
