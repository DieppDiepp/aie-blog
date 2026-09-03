"use client";

import { useRef, useState } from "react";

// The frame around a fenced code block: an ink field with a header rule that
// carries the language on the left and a working copy button on the right.
// Shiki renders the highlighted <pre> itself; this only wraps it.
export function CodeBlock({
  lang,
  children,
}: {
  lang?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = ref.current?.querySelector("pre")?.textContent ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard permission denied: leave the label alone rather than lying.
    }
  };

  return (
    <div ref={ref} className="mt-6 bg-ink px-[22px] py-5">
      <div className="mb-3 flex items-center justify-between border-b border-[rgba(243,242,242,0.2)] pb-3">
        <span className="text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-accent">
          {lang ?? "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="text-[9.5px] font-semibold uppercase leading-none tracking-[0.16em] text-[rgba(243,242,242,0.45)] transition-colors hover:text-ink-invert"
        >
          {copied ? "Đã copy" : "Copy"}
        </button>
      </div>
      {children}
    </div>
  );
}
