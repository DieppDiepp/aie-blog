"use client";

import { useEffect, useRef, useState } from "react";
import type { TocItem } from "@/lib/toc";

// Table of contents with scroll-spy. The active section is derived from each
// heading's position relative to a fixed offset (sticky header height plus a
// little), and the active row is marked with an accent rule on its left edge
// and a faint accent tint. When used in the sticky rail (`scrollable`), the
// list caps its height and scrolls on its own so a long outline never
// overflows the viewport.
export function Toc({
  items,
  scrollable = false,
}: {
  items: TocItem[];
  scrollable?: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const listRef = useRef<HTMLOListElement>(null);

  // Track which heading is currently at the top of the reading area.
  useEffect(() => {
    if (items.length < 2) return;
    const OFFSET = 130; // ink strip + masthead + double rule, plus breathing room

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
      <span className="block border-b-2 border-rule pb-3 text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-ink">
        Mục lục
      </span>
      <ol
        ref={listRef}
        className={`m-0 list-none p-0 ${scrollable ? "max-h-[52vh] overflow-y-auto pr-1" : ""}`}
      >
        {items.map((item, i) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                data-id={item.id}
                href={`#${item.id}`}
                aria-current={active ? "location" : undefined}
                className={`flex gap-2.5 border-l-2 py-2.5 pl-2.5 text-[12.5px] leading-snug transition-colors duration-300 ${
                  item.level === 3 ? "pl-5" : ""
                } ${
                  active
                    ? "border-accent bg-accent-tint-soft font-semibold text-ink"
                    : "border-transparent font-medium text-muted hover:text-ink"
                }`}
              >
                <span className={active ? "text-accent" : ""}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
