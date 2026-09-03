"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Thumbnail } from "@/components/post/Thumbnail";

type Item = { slug: string; title: string; cover?: string };

// The featured slot on the home masthead. It cycles through the recent posts
// every 5s, crossfading the cover. No dark overlay: the cover fills the frame
// and the title sits on its own ink caption bar. Rotation pauses on hover and
// is skipped entirely under prefers-reduced-motion.
const INTERVAL_MS = 5000;

export function MastheadFeature({ posts }: { posts: Item[] }) {
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const n = posts.length;

  useEffect(() => {
    if (n <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!paused.current) setActive((prev) => (prev + 1) % n);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [n]);

  if (n === 0) return <div className="min-h-[420px] bg-ink" />;

  return (
    <div
      className="relative block min-h-[420px] overflow-hidden bg-ink"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      {posts.map((post, idx) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          aria-hidden={idx !== active}
          tabIndex={idx === active ? 0 : -1}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            idx === active ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Thumbnail src={post.cover} alt={post.title} fit="cover" priority={idx === 0} />
          <span className="absolute inset-x-0 bottom-0 block bg-ink px-5 py-4 text-[15px] font-semibold leading-tight tracking-[-0.01em] text-ink-invert">
            {post.title}
          </span>
        </Link>
      ))}

      {n > 1 && (
        <div className="absolute right-5 top-5 z-10 flex gap-1.5">
          {posts.map((post, idx) => (
            <button
              key={post.slug}
              type="button"
              aria-label={`Xem bài ${idx + 1}`}
              aria-current={idx === active}
              onClick={() => setActive(idx)}
              className="h-[3px] w-7 transition-colors"
              style={{
                background:
                  idx === active ? "var(--ink-invert)" : "rgba(243,242,242,0.4)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
