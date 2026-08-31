// Post thumbnail. Renders the real image when a post supplies `src`, otherwise
// a calm placeholder box so layouts can be tuned before art exists. Swap in a
// real image later by setting `thumbnail` in a post's frontmatter.
export function Thumbnail({
  src,
  alt = "",
  className = "",
  rounded = "rounded-[12px]",
}: {
  src?: string;
  alt?: string;
  className?: string;
  rounded?: string;
}) {
  const base = `relative overflow-hidden ${rounded} ${className}`;

  if (src) {
    // Diagram covers are SVGs with their own #fcfcfa (--bg) background and must
    // always be shown WHOLE. Card containers use different aspect ratios
    // (grid 16/8, carousel 4/3, suggested/hero 16/9), so object-cover would
    // crop any cover whose ratio doesn't match that container — this is the
    // recurring "thumbnail cut on both sides" bug that came back every time a
    // cover was redesigned at a new ratio. object-contain fits the whole
    // diagram regardless of ratio; the letterbox is painted in --bg so it
    // blends into the cover's own background and is invisible. Do NOT switch
    // this back to object-cover.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        className={`${base} h-full w-full object-contain bg-[var(--bg)]`}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`${base} flex items-center justify-center border border-hairline`}
      style={{
        background:
          "linear-gradient(135deg, rgba(47,95,224,0.06), rgba(47,95,224,0.02) 60%), var(--surface)",
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2.5"
          stroke="var(--muted)"
          strokeWidth="1.3"
          opacity="0.5"
        />
        <circle cx="8.5" cy="9.5" r="1.6" fill="var(--muted)" opacity="0.5" />
        <path
          d="M4 17l5-4 4 3 3-2 4 3"
          stroke="var(--muted)"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
