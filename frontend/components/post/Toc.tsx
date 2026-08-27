"use client";

import { useEffect, useRef, useState } from "react";
import type { TocItem } from "@/lib/toc";

// Table of contents with scroll-spy. The active section is derived from each
// heading's position relative to a fixed offset (header height + a little), and
// the highlight glides between items via a color/border transition. When used
// in the sticky rail (`scrollable`), the list caps its height and scrolls on
// its own so a long outline never overflows the viewport.
export function Toc({
  items,
  scrollable = false,
}: {
  items: TocItem[];
  scrollable?: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const listRef = useRef<HTMLUListElement>(null);

  // Track which heading is currently at the top of the reading area.
  useEffect(() => {
    if (items.length < 2) return;
    const OFFSET = 110; // sticky header (~5rem) plus breathing room

    let raf = 0;
    const recompute = () => {
      let current = items[0]?.id ?? null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - OFFSET <= 0) current = item.id;
        else break;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        recompute();
      });
    };

    recompute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  // Keep the active row visible inside the rail's own scroll area, without ever
  // moving the page itself.
  useEffect(() => {
    if (!scrollable || !activeId) return;
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>(`[data-id="${activeId}"]`);
    if (!active) return;
    const top = active.offsetTop;
    const bottom = top + active.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top - 8;
    else if (bottom > list.scrollTop + list.clientHeight)
      list.scrollTop = bottom - list.clientHeight + 8;
  }, [activeId, scrollable]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Mục lục">
      <span className="block font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
        On this page
      </span>
      <ul
        ref={listRef}
        className={`mt-3 space-y-1.5 border-l border-hairline ${
          scrollable ? "max-h-[52vh] overflow-y-auto pr-1" : ""
        }`}
      >
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                data-id={item.id}
                href={`#${item.id}`}
                aria-current={active ? "location" : undefined}
                className={`-ml-px block border-l-2 py-0.5 text-[13.5px] leading-snug transition-all duration-300 ease-out ${
                  item.level === 3 ? "pl-6" : "pl-4"
                } ${
                  active
                    ? "border-accent font-medium text-ink"
                    : "border-transparent text-muted hover:border-accent-line hover:text-ink"
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
