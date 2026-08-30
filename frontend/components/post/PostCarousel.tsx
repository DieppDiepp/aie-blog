"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Post } from "@/lib/types";
import { Thumbnail } from "@/components/post/Thumbnail";
import { formatLongDate } from "@/lib/format";

// One card, styled after a classic editorial index: a square-cornered image, a
// centered serif title, and quiet letter-spaced meta beneath it. Category and
// date sit BELOW the title (never small text above a big title).
function CarouselCard({ post }: { post: Post }) {
  const category = post.tags?.[0]?.label;
  return (
    <Link
      href={`/blog/${post.slug}`}
      draggable={false}
      className="group/card flex w-[290px] shrink-0 flex-col sm:w-[330px]"
    >
      <Thumbnail
        src={post.thumbnail}
        alt={post.title}
        rounded="rounded-none"
        className="aspect-[4/3] w-full"
      />
      <div className="mt-5 px-2 text-center">
        <h3 className="font-serif text-[20px] font-medium leading-[1.25] tracking-[-0.01em] text-ink transition-colors group-hover/card:text-accent">
          {post.title}
        </h3>
        {category && (
          <span className="mt-2.5 block font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
            {category}
          </span>
        )}
        <span className="mt-1.5 block font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted opacity-80">
          {formatLongDate(post.created_at)}
        </span>
      </div>
    </Link>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={dir === "left" ? "M10 3l-5 5 5 5" : "M6 3l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// A calm strip of posts that steps forward one card every few seconds. The
// arrows only appear while the pointer is over the strip; hovering or dragging
// pauses the autoplay. Reduced-motion turns off the timer but keeps the manual
// controls. When the end is reached it eases back to the start.
export function PostCarousel({ posts }: { posts: Post[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  const step = () => {
    const el = scroller.current;
    const first = el?.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + 24 : 320; // 24 = gap-6
  };

  const advance = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const at = el.scrollLeft;
    if (dir > 0 && at >= max - 2) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (dir < 0 && at <= 2) {
      el.scrollTo({ left: max, behavior: "smooth" });
    } else {
      el.scrollBy({ left: dir * step(), behavior: "smooth" });
    }
  };

  // Autoplay: one gentle step every 3.5s, unless paused or reduced-motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!paused.current) advance(1);
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  // Drag to scroll. A real drag suppresses the click so it doesn't navigate.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let down = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;

    // No pointer capture: capturing would retarget the click away from the
    // card's <a>, so a plain tap would never navigate. Instead we track the
    // drag on the window and only suppress the click after a real drag.
    const onDown = (e: PointerEvent) => {
      down = true;
      moved = false;
      paused.current = true;
      startX = e.pageX;
      startScroll = el.scrollLeft;
      el.classList.add("cursor-grabbing");
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      if (Math.abs(e.pageX - startX) > 6) moved = true;
      el.scrollLeft = startScroll - (e.pageX - startX);
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      paused.current = false;
      el.classList.remove("cursor-grabbing");
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  if (posts.length === 0) return null;

  return (
    <div
      className="group relative"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div
        ref={scroller}
        className="flex cursor-grab touch-pan-y select-none gap-6 overflow-x-auto pb-2 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {posts.map((post) => (
          <CarouselCard key={post.slug} post={post} />
        ))}
      </div>

      <button
        type="button"
        aria-label="Bài trước"
        onClick={() => advance(-1)}
        className="absolute left-0 top-[33%] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface text-muted opacity-0 shadow-[0_10px_24px_-16px_rgba(22,24,29,0.45)] transition-all duration-200 hover:border-accent-line hover:text-accent focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Chevron dir="left" />
      </button>
      <button
        type="button"
        aria-label="Bài kế"
        onClick={() => advance(1)}
        className="absolute right-0 top-[33%] flex h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-hairline bg-surface text-muted opacity-0 shadow-[0_10px_24px_-16px_rgba(22,24,29,0.45)] transition-all duration-200 hover:border-accent-line hover:text-accent focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Chevron dir="right" />
      </button>
    </div>
  );
}
