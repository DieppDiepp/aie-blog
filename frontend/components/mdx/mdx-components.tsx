import type { MDXComponents } from "mdx/types";

// Element styling for article bodies rendered from MDX. Keeps prose in the
// site's sans body font (set globally on <body>) and reserves serif for
// headings, matching the rest of the design system.
export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2
      className="mt-12 font-serif text-[26px] font-medium leading-snug tracking-[-0.015em] text-ink first:mt-0 md:text-[28px]"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-9 font-serif text-[21px] font-medium leading-snug tracking-[-0.01em] text-ink md:text-[22px]"
      {...props}
    />
  ),
  p: (props) => (
    <p className="mt-6 text-[18px] leading-[1.78] text-ink-body first:mt-0 md:text-[18.5px]" {...props} />
  ),
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
  // Inline code gets a small pill. Nested inside <pre>, it is reset to plain
  // text below so a fenced block doesn't render a pill-inside-a-card.
  code: (props) => (
    <code
      className="rounded-[5px] bg-[rgba(22,24,29,0.05)] px-[6px] py-[2px] font-mono text-[0.88em] text-ink-body"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-6 overflow-x-auto rounded-card border border-hairline bg-surface p-5 font-mono text-[14px] leading-[1.65] text-ink-body [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit"
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
