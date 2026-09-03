import { COVERS_FIXED_RATIO } from "@/lib/site";

// Post cover. Renders the real image when a post supplies `src`, otherwise a
// square placeholder box so layouts can be tuned before art exists.
//
// About object-fit, and please read this before "fixing" it: covers are
// generated pipeline diagrams (SVG) that carry their own --bg ground, and they
// have historically been drawn at different ratios. Card frames here use
// several ratios too, so object-cover crops any cover whose ratio does not
// match its frame. That was the recurring "thumbnail cut on both sides" bug.
// object-contain fits the whole diagram regardless of ratio, and the letterbox
// is painted in --bg so it disappears into the cover's own ground.
//
// `fit="cover"` is honored ONLY when COVERS_FIXED_RATIO is true, i.e. once
// every cover has been regenerated at a fixed 16/9 on the --bg ground. Until
// then a full-bleed slot renders contained on a --bg ground, which still looks
// intentional because the letterbox matches the diagram.
export function Thumbnail({
  src,
  alt = "",
  className = "",
  fit = "contain",
  priority = false,
}: {
  src?: string;
  alt?: string;
  className?: string;
  fit?: "contain" | "cover";
  priority?: boolean;
}) {
  const base = `relative overflow-hidden ${className}`;
  const effective = fit === "cover" && COVERS_FIXED_RATIO ? "object-cover" : "object-contain";

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        className={`${base} h-full w-full bg-[var(--bg)] ${effective}`}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`${base} flex h-full w-full items-center justify-center border border-hairline bg-[var(--bg)]`}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" stroke="var(--muted)" strokeWidth="1.5" />
        <path
          d="M4 17l5-4 4 3 3-2 4 3"
          stroke="var(--muted)"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
        <rect x="7" y="8" width="3" height="3" fill="var(--muted)" />
      </svg>
    </div>
  );
}
