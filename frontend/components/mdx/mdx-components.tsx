import type { MDXComponents } from "mdx/types";
import { Children, isValidElement } from "react";
import Image from "next/image";
import { slugify } from "@/lib/toc";

// Flatten heading children into a plain string so we can derive a stable anchor
// id that matches the table of contents.
function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

// Element styling for article bodies rendered from MDX. Keeps prose in the
// site's sans body font (set globally on <body>) and reserves serif for
// headings, matching the rest of the design system.
export const mdxComponents: MDXComponents = {
  h2: ({ children, ...props }) => (
    <h2
      id={slugify(textOf(children))}
      className="mt-12 scroll-mt-24 font-serif text-[26px] font-medium leading-snug tracking-[-0.015em] text-ink first:mt-0 md:text-[28px]"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      id={slugify(textOf(children))}
      className="mt-9 scroll-mt-24 font-serif text-[21px] font-medium leading-snug tracking-[-0.01em] text-ink md:text-[22px]"
      {...props}
    >
      {children}
    </h3>
  ),
  // A standalone image renders as a block <figure> (see `img` below). Markdown
  // wraps such an image in a paragraph, which would nest <figure> inside <p>
  // (invalid HTML, hydration mismatch). When a paragraph's only child is an
  // image, drop the <p> wrapper and let the figure stand on its own.
  p: ({ children, ...props }) => {
    const kids = Children.toArray(children);
    if (
      kids.length === 1 &&
      isValidElement(kids[0]) &&
      (kids[0].props as { src?: unknown }).src !== undefined
    ) {
      return <>{children}</>;
    }
    return (
      <p className="mt-6 text-[18px] leading-[1.78] text-ink-body first:mt-0 md:text-[18.5px]" {...props}>
        {children}
      </p>
    );
  },
  ul: (props) => (
    <ul className="mt-6 list-disc space-y-2 pl-6 text-[18px] leading-[1.7] text-ink-body" {...props} />
  ),
  ol: (props) => (
    <ol className="mt-6 list-decimal space-y-2 pl-6 text-[18px] leading-[1.7] text-ink-body" {...props} />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  strong: (props) => <strong className="font-semibold text-ink" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-6 border-l-2 pl-5 text-[17px] italic leading-relaxed text-muted"
      style={{ borderColor: "var(--accent-line)" }}
      {...props}
    />
  ),
  hr: () => <hr className="my-12 border-hairline" />,
  a: (props) => (
    <a
      className="text-accent underline decoration-hairline underline-offset-4 transition-colors hover:text-accent-hover"
      {...props}
    />
  ),
  // Article images live on the media CDN (R2), not in the repo. Use next/image
  // (lazy by default) so there is no <img> LCP warning; SVG diagrams are served
  // `unoptimized` (no point optimizing vectors, and it avoids dangerouslyAllowSVG).
  // width/height are nominal: the responsive style keeps each SVG's own aspect.
  // The alt text doubles as a caption.
  img: ({ src, alt }) =>
    typeof src === "string" ? (
      <figure className="my-8">
        <Image
          src={src}
          alt={alt ?? ""}
          width={1600}
          height={900}
          unoptimized
          className="mx-auto rounded-card border border-hairline bg-surface"
          style={{ width: "100%", height: "auto" }}
        />
        {alt ? (
          <figcaption className="mt-2.5 text-center text-[13px] leading-snug text-muted">
            {alt}
          </figcaption>
        ) : null}
      </figure>
    ) : null,
  // Inline code gets a small pill. Nested inside <pre>, it is reset to plain
  // text below so a fenced block doesn't render a pill-inside-a-card.
  code: (props) => (
    <code
      className="rounded-[5px] bg-[rgba(22,24,29,0.05)] px-[6px] py-[2px] font-mono text-[0.88em] text-ink-body"
      {...props}
    />
  ),
  // Shiki emits its own <pre class="shiki" style="background/color"> with colored
  // token spans. Keep the frame (border, rounded, padding, scroll) and merge
  // Shiki's class + inline style so its theme colors win. The [&>code] resets
  // neutralize the inline-code pill when a <code> sits inside a fenced block.
  pre: ({ className, ...props }) => (
    <pre
      className={`mt-6 overflow-x-auto rounded-card border border-hairline p-5 font-mono text-[14px] leading-[1.65] [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[14px] [&>code]:font-normal ${className ?? ""}`}
      {...props}
    />
  ),
  table: (props) => (
    <div className="mt-6 overflow-x-auto rounded-card border border-hairline">
      <table className="w-full border-collapse text-[15.5px]" {...props} />
    </div>
  ),
  thead: (props) => <thead className="border-b border-hairline text-left" {...props} />,
  th: (props) => (
    <th
      className="px-4 py-3 font-mono text-[12px] font-medium uppercase tracking-[0.04em] text-muted"
      {...props}
    />
  ),
  td: (props) => <td className="border-t border-hairline px-4 py-3 align-top text-ink-body" {...props} />,
};
