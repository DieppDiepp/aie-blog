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

// One distinct hue per field, muted enough to sit on paper without feeling
// industrial. Keys are topic slugs; Hệ thống keeps the site's blue accent.
const ROOT_COLORS: Record<string, string> = {
  "he-thong": "#2f5fe0",
  toan: "#c2673f",
  "machine-learning": "#1f9b7a",
  "deep-learning": "#7c5cd6",
  llm: "#c2952f",
  other: "#8b9199",
};
const FALLBACK = "#8b9199";
const colorOf = (slug: string) => ROOT_COLORS[slug] ?? FALLBACK;

// Post physics. Roots don't move (they anchor the corners); posts orbit their
// root and repel each other.
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

  const [size, setSize] = useState({ w: 960, h: 600 });
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
        r: n.kind === "topic" ? 13 : 5.5,
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

  const hexPoints = geom.corners.map((c) => `${c.x},${c.y}`).join(" ");

  return (
    <div ref={wrapRef} className="relative h-[66vh] min-h-[480px] w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size.w} ${size.h}`}
        className="h-full w-full touch-none select-none"
        role="group"
        aria-label="Bản đồ tri thức: sáu chủ đề ở sáu góc, các bài viết nối vào chủ đề của mình"
      >
        <defs>
          <filter id="graph-soft" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>

        {/* colored glow behind each corner */}
        <g style={{ mixBlendMode: "multiply" }}>
          {geom.corners.map((c) => {
            const slug = c.id.replace("topic:", "");
            const on = !activeCluster || activeCluster === slug;
            return (
              <circle
                key={`glow-${c.id}`}
                cx={c.x}
                cy={c.y}
                r={activeCluster === slug ? 66 : 52}
                fill={colorOf(slug)}
                opacity={on ? (activeCluster === slug ? 0.16 : 0.08) : 0.03}
                filter="url(#graph-soft)"
                style={{ transition: "opacity 250ms, r 250ms" }}
              />
            );
          })}
        </g>

        {/* hexagon frame + spokes */}
        <g>
          {geom.corners.map((c) => (
            <line
              key={`spoke-${c.id}`}
              x1={geom.cx}
              y1={geom.cy}
              x2={c.x}
              y2={c.y}
              stroke="var(--hairline)"
              strokeWidth={1}
              opacity={0.4}
            />
          ))}
          <polygon
            points={hexPoints}
            fill="none"
            stroke="var(--hairline)"
            strokeWidth={1.25}
          />
        </g>

        {/* edges */}
        <g>
          {data.edges.map((e, i) => {
            const p = byId.get(e.source);
            const q = byId.get(e.target);
            if (!p || !q) return null;
            const cluster = p.kind === "post" ? p.cluster : q.cluster;
            const active = !activeCluster || activeCluster === cluster;
            return (
              <line
                key={i}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke={colorOf(cluster)}
                strokeWidth={activeCluster === cluster ? 1.7 : 1}
                strokeOpacity={active ? (activeCluster === cluster ? 0.85 : 0.32) : 0.1}
                style={{ transition: "stroke-opacity 250ms, stroke-width 250ms" }}
              />
            );
          })}
        </g>

        {/* nodes */}
        <g>
          {arr.map((n) => {
            const isTopic = n.kind === "topic";
            const color = colorOf(n.cluster);
            const on = !activeCluster || activeCluster === n.cluster;
            const corner = homes.current.get(n.id);
            // Root label sits just outside its corner, pushed radially outward.
            const outX = corner ? corner.x - geom.cx : 0;
            const outY = corner ? corner.y - geom.cy : 0;
            const outLen = Math.hypot(outX, outY) || 1;
            const lx = (outX / outLen) * (n.r + 16);
            const ly = (outY / outLen) * (n.r + 16);
            const anchor = outX > 40 ? "start" : outX < -40 ? "end" : "middle";
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
                    <circle
                      r={n.r}
                      fill={color}
                      fillOpacity={activeCluster === n.cluster ? 0.26 : 0.16}
                      stroke={color}
                      strokeWidth={1.8}
                      style={{ transition: "fill-opacity 250ms" }}
                    />
                    <circle r={3.2} fill={color} />
                    <text
                      x={lx}
                      y={ly}
                      dy={Math.abs(outY) > Math.abs(outX) ? (outY > 0 ? 14 : -6) : 4}
                      textAnchor={anchor}
                      fill="var(--ink)"
                      style={{
                        fontFamily: "var(--font-serif), Georgia, serif",
                        fontSize: 15,
                        fontWeight: 500,
                        pointerEvents: "none",
                      }}
                    >
                      {n.label}
                    </text>
                  </>
                ) : (
                  <circle
                    r={hover === n.id ? 7.5 : 5.5}
                    fill={color}
                    fillOpacity={0.9}
                    stroke="var(--bg)"
                    strokeWidth={1.4}
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
    </div>
  );
}

// A small readable label near a hovered post node. It flips below the node when
// there's no room above, and stays clamped inside the SVG so the frame never
// clips the title.
function HoverChip({ node, size }: { node: SimNode; size: { w: number; h: number } }) {
  const label = node.label.length > 60 ? `${node.label.slice(0, 59)}…` : node.label;
  const w = Math.min(label.length * 7 + 24, size.w - 16);
  const h = 26;

  const x = Math.max(8, Math.min(size.w - w - 8, node.x - w / 2));
  const above = node.y - node.r - 12 - h;
  const y = above < 8 ? node.y + node.r + 12 : above;
  const cx = x + w / 2;

  return (
    <g pointerEvents="none">
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={7}
        fill="var(--surface)"
        stroke="var(--hairline)"
      />
      <text
        x={cx}
        y={y + h / 2}
        dy={4}
        textAnchor="middle"
        fill="var(--ink)"
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {label}
      </text>
    </g>
  );
}
