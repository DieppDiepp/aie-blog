import type { ProjectMetric } from "@/lib/project-types";

// The three-number strip under a project summary. A 2px rule on top, 1px
// dividers between cells, no boxes: the numbers are held by the grid, not by
// containers. `size` switches between the index row (28px numbers) and the
// author page row (22px), which is the only difference between the two.
export function MetricStrip({
  metrics,
  size = "lg",
  className = "",
}: {
  metrics: ProjectMetric[];
  size?: "lg" | "sm";
  className?: string;
}) {
  if (metrics.length === 0) return null;
  const big = size === "lg";

  return (
    <div
      className={`grid border-t-2 border-rule ${big ? "border-b border-hairline" : ""} md:grid-cols-3 ${className}`}
    >
      {metrics.map((metric, i) => (
        <div
          key={metric.label}
          className={`${i < metrics.length - 1 ? "border-r border-hairline" : ""} ${
            big ? "px-4 py-[15px] first:pl-0 last:pr-0" : "px-3.5 pb-0 pt-3 first:pl-0 last:pr-0"
          }`}
        >
          <span
            className={`block font-extrabold leading-none tracking-[-0.03em] ${
              big ? "text-[28px]" : "text-[22px]"
            } ${metric.accent ? "text-accent-deep" : "text-ink"}`}
          >
            {metric.value}
            {metric.unit && (
              <span className={`${big ? "text-[16px]" : "text-[14px]"} text-[rgba(32,30,29,0.5)]`}>
                {metric.unit}
              </span>
            )}
          </span>
          <span
            className={`mt-[5px] block font-semibold uppercase leading-[1.3] tracking-[0.14em] text-muted ${
              big ? "text-[9.5px]" : "text-[9px]"
            }`}
          >
            {metric.label}
          </span>
        </div>
      ))}
    </div>
  );
}
