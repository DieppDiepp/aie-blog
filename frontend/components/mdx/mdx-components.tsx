import type { MDXComponents } from "mdx/types";
import { Children, isValidElement } from "react";
import { slugify } from "@/lib/toc";
import { CodeBlock } from "./CodeBlock";

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

// Element styling for article bodies. Body copy is serif (Newsreader) at a
// generous measure; headings are small, wide-tracked, uppercase sans sitting
// under a 2px rule, so the article reads as a printed document rather than a
// web page. The drop cap on the first paragraph is applied by the article page,
// which owns the prose wrapper.
export const mdxComponents: MDXComponents = {
  h2: ({ children, ...props }) => (
    <h2
      id={slugify(textOf(children))}
      className="mt-11 scroll-mt-32 border-t-2 border-rule pt-4 text-[15px] font-extrabold uppercase leading-none tracking-[0.16em] text-ink first:mt-0"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      id={slugify(textOf(children))}
      className="mt-8 scroll-mt-32 text-[19px] font-bold leading-snug tracking-[-0.02em] text-ink"
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
      <p className="mt-5 font-serif text-[19px] leading-[1.72] text-ink-body first:mt-0" {...props}>
        {children}
      </p>
    );
  },
  ul: (props) => (
    <ul
      className="mt-5 list-disc space-y-2 pl-6 font-serif text-[19px] leading-[1.65] text-ink-body"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="mt-5 list-decimal space-y-2 pl-6 font-serif text-[19px] leading-[1.65] text-ink-body"
      {...props}
    />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  strong: (props) => <strong className="font-semibold text-ink" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  // Pull quote: an ink field, not an accent one. Accent stays reserved for the
  // page's few call-to-action surfaces. Inline code inside this ink field is
  // re-tinted light on dark: the default inline-code chip is dark on light, so
  // on the ink ground its text would vanish (see `code` below).
  blockquote: (props) => (
    <blockquote
      className="mt-8 bg-ink px-7 py-6 font-serif text-[21px] leading-[1.45] text-ink-invert [&>p]:mt-0 [&>p]:font-serif [&>p]:text-[21px] [&>p]:leading-[1.45] [&>p]:text-ink-invert [&_code]:bg-[rgba(243,242,242,0.18)] [&_code]:text-ink-invert"
      {...props}
    />
  ),
  // Section ornament: the one decorative flourish in the system, borrowed from
  // print. Written in MDX as a horizontal rule.
  hr: () => (
    <div className="my-11 flex items-center justify-center gap-3.5" aria-hidden>
      <span className="h-px w-[60px] bg-[rgba(32,30,29,0.3)]" />
      <span className="text-[14px] leading-none text-accent">◆</span>
      <span className="h-px w-[60px] bg-[rgba(32,30,29,0.3)]" />
    </div>
  ),
  a: (props) => (
    <a
      className="text-accent underline decoration-1 underline-offset-4 transition-colors hover:text-accent-hover"
      {...props}
    />
  ),
  // Article images live on the media CDN (R2), not in the repo. Diagram SVGs
  // are served as-is (no point optimizing vectors, and it avoids
  // dangerouslyAllowSVG). The alt text doubles as the caption.
  img: ({ src, alt }) =>
    typeof src === "string" ? (
      <figure className="mt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          className="w-full border-2 border-rule bg-[var(--bg)]"
        />
        {alt ? (
          <figcaption className="mt-2.5 border-l-2 border-accent pl-3 font-serif text-[14px] italic leading-relaxed text-muted">
            {alt}
          </figcaption>
        ) : null}
      </figure>
    ) : null,
  // Inline code: a square tinted box, never a pill.
  code: (props) => (
    <code
      className="bg-[rgba(32,30,29,0.08)] px-[5px] py-[2px] font-mono text-[0.84em] text-ink-body"
      {...props}
    />
  ),
  // Shiki emits its own <pre class="shiki" style="background/color"> with
  // colored token spans. CodeBlock supplies the ink frame and the copy button;
  // the <pre> keeps Shiki's inline theme colors but drops its own background so
  // the frame's ink shows through. The [&>code] resets neutralize the
  // inline-code box when a <code> sits inside a fenced block.
  pre: ({ className, style, ...props }) => {
    const lang = (props as { "data-language"?: string })["data-language"];
    return (
      <CodeBlock lang={lang}>
        <pre
          className={`overflow-x-auto font-mono text-[13.5px] leading-[1.75] !bg-transparent [&>code]:bg-transparent [&>code]:p-0 [&>code]:font-normal [&>code]:text-[13.5px] ${className ?? ""}`}
          style={{ ...style, background: "transparent" }}
          {...props}
        />
      </CodeBlock>
    );
  },
  table: (props) => (
    <div className="mt-6 overflow-x-auto border-2 border-rule">
      <table className="w-full border-collapse text-[15.5px]" {...props} />
    </div>
  ),
  thead: (props) => <thead className="border-b-2 border-rule text-left" {...props} />,
  th: (props) => (
    <th
      className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border-t border-hairline px-4 py-3 align-top font-serif text-ink-body" {...props} />
  ),
};
