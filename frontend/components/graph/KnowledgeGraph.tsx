"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GraphData } from "@/lib/graph";

type SimNode = {
  id: string;
  kind: "topic" | "post";
  label: string;
  href: string;
  cluster: string; // root slug this node belongs to
  r: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fixed: boolean; // roots are pinned to their hexagon corner
};

// This graph is monochrome by design: the old version gave each field its own
// hue, which fought the rest of the system. Here a topic is a filled ink
// SQUARE, a post is an outlined circle, topic-to-topic links are accent, and
// topic-to-post links are thin ink. Emphasis comes from weight and opacity,
// never from color.
const TOPIC_SIZE = 24; // square side, in SVG units
const POST_R = 7;

// Post physics. Roots don't move (they anchor the corners); posts orbit their
// root and repel each other. These four constants are tuned, leave them alone.
const REP = 950;
const REST = 66;
const SPRING = 0.085;
const DAMP = 0.85;

export function KnowledgeGraph({ data }: { data: GraphData }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodes = useRef<SimNode[]>([]);
  const homes = useRef<Map<string, { x: number; y: number }>>(new Map());
  const alpha = useRef(1);
  const raf = useRef(0);
  const drag = useRef<{ id: string; moved: boolean } | null>(null);

  const [size, setSize] = useState({ w: 1280, h: 560 });
  const [, setTick] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const router = useRouter();

  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const n of data.nodes) map.set(n.id, new Set());
    for (const e of data.edges) {
      map.get(e.source)?.add(e.target);
      map.get(e.target)?.add(e.source);
    }
    return map;
  }, [data]);

  const step = () => {
    const arr = nodes.current;
    const a = alpha.current;

    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const p = arr[i];
        const q = arr[j];
        let dx = q.x - p.x;
        let dy = q.y - p.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.01) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
          d2 = 0.01;
        }
        const d = Math.sqrt(d2);
        const f = (REP * a) / d2;
        p.vx -= (dx / d) * f;
        p.vy -= (dy / d) * f;
        q.vx += (dx / d) * f;
        q.vy += (dy / d) * f;
      }
    }

    for (const e of data.edges) {
      const p = arr.find((n) => n.id === e.source);
      const q = arr.find((n) => n.id === e.target);
      if (!p || !q) continue;
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const k = ((d - REST) / d) * SPRING * a;
      p.vx += dx * k;
      p.vy += dy * k;
      q.vx -= dx * k;
      q.vy -= dy * k;
    }

    let maxV = 0;
    for (const n of arr) {
      if (n.fixed) {
        const home = homes.current.get(n.id);
        if (home) {
          n.x = home.x;
          n.y = home.y;
        }
        n.vx = 0;
        n.vy = 0;
        continue;
      }
      n.vx *= DAMP;
      n.vy *= DAMP;
      n.x += n.vx;
      n.y += n.vy;
      const pad = n.r + 26;
      n.x = Math.max(pad, Math.min(size.w - pad, n.x));
      n.y = Math.max(pad, Math.min(size.h - pad, n.y));
      maxV = Math.max(maxV, Math.abs(n.vx) + Math.abs(n.vy));
    }

    alpha.current = Math.max(a * 0.985, 0);
    return maxV;
  };

  // Hexagon geometry: 6 corners, one per topic, pointy top.
  const geom = useMemo(() => {
    const cx = size.w / 2;
    const cy = size.h / 2;
    const R = Math.min(size.w, size.h) * 0.37;
    const topics = data.nodes.filter((n) => n.kind === "topic");
    const corners = topics.map((t, i) => {
      const ang = (-90 + (i * 360) / Math.max(topics.length, 1)) * (Math.PI / 180);
      return { id: t.id, x: cx + Math.cos(ang) * R, y: cy + Math.sin(ang) * R, ang };
    });
    return { cx, cy, R, corners };
  }, [size.w, size.h, data]);

  useEffect(() => {
    const homeMap = new Map<string, { x: number; y: number }>();
    for (const c of geom.corners) homeMap.set(c.id, { x: c.x, y: c.y });
    homes.current = homeMap;

    const clusterOf = (id: string) => {
      const n = data.nodes.find((x) => x.id === id);
      if (n?.kind === "topic") return id.replace("topic:", "");
      const t = [...(neighbors.get(id) ?? [])].find((nid) => nid.startsWith("topic:"));
      return t ? t.replace("topic:", "") : "other";
    };

    nodes.current = data.nodes.map((n) => {
      const cluster = clusterOf(n.id);
      const home = homeMap.get(n.id);
      const anchor = home ?? homeMap.get(`topic:${cluster}`) ?? { x: geom.cx, y: geom.cy };
      const seed = home
        ? { x: home.x, y: home.y }
        : {
            x: anchor.x + (anchor.x < geom.cx ? 40 : -40) + (Math.random() - 0.5) * 40,
            y: anchor.y + (anchor.y < geom.cy ? 40 : -40) + (Math.random() - 0.5) * 40,
          };
      return {
        id: n.id,
        kind: n.kind,
        label: n.label,
        href: n.href,
        cluster,
        r: n.kind === "topic" ? TOPIC_SIZE / 2 : POST_R,
        x: seed.x,
        y: seed.y,
        vx: 0,
        vy: 0,
        fixed: n.kind === "topic",
      };
    });

    alpha.current = 1;
    for (let i = 0; i < 160; i++) step();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTick((t) => t + 1);
      return;
    }
    const loop = () => {
      const maxV = step();
      setTick((t) => t + 1);
      if (maxV > 0.08 || drag.current) raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, geom]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (box) setSize({ w: Math.round(box.width), h: Math.round(box.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const reheat = () => {
    alpha.current = Math.max(alpha.current, 0.5);
    cancelAnimationFrame(raf.current);
    const loop = () => {
      const maxV = step();
      setTick((t) => t + 1);
      if (maxV > 0.08 || drag.current) raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  };

  const toSvg = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * size.w,
      y: ((clientY - rect.top) / rect.height) * size.h,
    };
  };

  const onPointerDown = (e: React.PointerEvent, n: SimNode) => {
    if (n.kind === "topic") return; // roots stay at their corner
    e.preventDefault();
    drag.current = { id: n.id, moved: false };
    reheat();
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const node = nodes.current.find((n) => n.id === d.id);
      if (!node) return;
      const p = toSvg(e.clientX, e.clientY);
      if (Math.abs(p.x - node.x) + Math.abs(p.y - node.y) > 3) d.moved = true;
      node.x = p.x;
      node.y = p.y;
      setTick((t) => t + 1);
    };
    const onUp = () => {
      if (!drag.current) return;
      window.setTimeout(() => {
        drag.current = null;
      }, 0);
      reheat();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h]);

  const open = (href: string) => {
    if (drag.current?.moved) return;
    router.push(href);
  };

  const arr = nodes.current;
  const byId = new Map(arr.map((n) => [n.id, n]));
  const hoverNode = hover ? byId.get(hover) : null;
  const activeCluster = hoverNode ? hoverNode.cluster : null;

  return (
    <section className="relative border-b-2 border-rule">
      {/* The 40px grid ground: a drafting sheet, not a canvas. */}
      <div
        ref={wrapRef}
        className="relative h-[560px] w-full"
        style={{
          backgroundImage:
            "linear-gradient(rgba(32,30,29,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(32,30,29,0.09) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size.w} ${size.h}`}
          className="h-full w-full touch-none select-none"
          role="group"
          aria-label="Bản đồ tri thức: sáu chủ đề ở sáu góc, các bài viết nối vào chủ đề của mình"
        >
          {/* edges */}
          <g>
            {data.edges.map((e, i) => {
              const p = byId.get(e.source);
              const q = byId.get(e.target);
              if (!p || !q) return null;
              const bothTopics = p.kind === "topic" && q.kind === "topic";
              const cluster = p.kind === "post" ? p.cluster : q.cluster;
              const on = !activeCluster || activeCluster === cluster;
              return (
                <line
                  key={i}
                  x1={p.x}
                  y1={p.y}
                  x2={q.x}
                  y2={q.y}
                  stroke={bothTopics ? "var(--accent)" : "var(--ink)"}
                  strokeWidth={bothTopics ? 2 : 1}
                  strokeOpacity={on ? (activeCluster === cluster ? 0.7 : 0.35) : 0.1}
                  style={{ transition: "stroke-opacity 250ms" }}
                />
              );
            })}
          </g>

          {/* nodes */}
          <g>
            {arr.map((n) => {
              const isTopic = n.kind === "topic";
              const on = !activeCluster || activeCluster === n.cluster;
              const corner = homes.current.get(n.id);
              // A topic label sits just outside its corner, pushed radially out.
              const outX = corner ? corner.x - geom.cx : 0;
              const outY = corner ? corner.y - geom.cy : 0;
              const outLen = Math.hypot(outX, outY) || 1;
              const lx = (outX / outLen) * (n.r + 18);
              const ly = (outY / outLen) * (n.r + 18);
              const anchor = outX > 40 ? "start" : outX < -40 ? "end" : "middle";
              const hot = activeCluster === n.cluster;

              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  role="link"
                  tabIndex={0}
                  aria-label={n.label}
                  className="cursor-pointer outline-none"
                  style={{ opacity: on ? 1 : 0.28, transition: "opacity 250ms" }}
                  onPointerDown={(e) => onPointerDown(e, n)}
                  onPointerEnter={() => setHover(n.id)}
                  onPointerLeave={() => setHover((h) => (h === n.id ? null : h))}
                  onClick={() => open(n.href)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(n.href);
                    }
                  }}
                >
                  {isTopic ? (
                    <>
                      <rect
                        x={-TOPIC_SIZE / 2}
                        y={-TOPIC_SIZE / 2}
                        width={TOPIC_SIZE}
                        height={TOPIC_SIZE}
                        fill="var(--ink)"
                      />
                      {hot && (
                        <rect
                          x={-TOPIC_SIZE / 2 - 2}
                          y={-TOPIC_SIZE / 2 - 2}
                          width={TOPIC_SIZE + 4}
                          height={TOPIC_SIZE + 4}
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth={2}
                        />
                      )}
                      <text
                        x={lx}
                        y={ly}
                        dy={Math.abs(outY) > Math.abs(outX) ? (outY > 0 ? 14 : -6) : 4}
                        textAnchor={anchor}
                        fill="var(--ink)"
                        style={{
                          fontFamily: "var(--font-archivo), system-ui, sans-serif",
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: 1.4,
                          textTransform: "uppercase",
                          pointerEvents: "none",
                        }}
                      >
                        {n.label.toUpperCase()}
                      </text>
                    </>
                  ) : (
                    <circle
                      r={hover === n.id ? POST_R + 2 : POST_R}
                      fill="var(--bg)"
                      stroke="var(--ink)"
                      strokeWidth={2}
                      style={{ transition: "r 150ms" }}
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* hover label for a post, on top of everything */}
          {hoverNode && hoverNode.kind === "post" && (
            <HoverChip node={hoverNode} size={size} />
          )}
        </svg>

        {/* Legend: a framed block, bottom left, aligned to the page gutter. */}
        <div className="absolute bottom-5 left-14 flex items-center gap-5 border-2 border-rule bg-bg px-4 py-3">
          <LegendItem label="Chủ đề">
            <span className="block h-[11px] w-[11px] bg-ink" />
          </LegendItem>
          <LegendItem label="Bài viết">
            <span className="block h-[11px] w-[11px] rounded-full border-2 border-ink" />
          </LegendItem>
          <LegendItem label="Liên kết chủ đề">
            <span className="block h-0.5 w-4 bg-accent" />
          </LegendItem>
        </div>

        <p className="absolute bottom-5 right-14 text-[11px] font-medium uppercase leading-none tracking-[0.1em] text-muted">
          Kéo nút để sắp lại, rê chuột để làm nổi vùng, bấm để mở
        </p>
      </div>
    </section>
  );
}

function LegendItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-ink">
      {children}
      {label}
    </span>
  );
}

// A small readable label near a hovered post node. It flips below the node when
// there's no room above, and stays clamped inside the SVG so the frame never
// clips the title.
function HoverChip({ node, size }: { node: SimNode; size: { w: number; h: number } }) {
  const label = node.label.length > 60 ? `${node.label.slice(0, 59)}…` : node.label;
  const w = Math.min(label.length * 7 + 24, size.w - 16);
  const h = 28;

  const x = Math.max(8, Math.min(size.w - w - 8, node.x - w / 2));
  const above = node.y - node.r - 12 - h;
  const y = above < 8 ? node.y + node.r + 12 : above;

  return (
    <g pointerEvents="none">
      <rect x={x} y={y} width={w} height={h} fill="var(--ink)" />
      <text
        x={x + 12}
        y={y + h / 2}
        dy={4}
        fill="var(--ink-invert)"
        style={{
          fontFamily: "var(--font-archivo), system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {label}
      </text>
    </g>
  );
}
