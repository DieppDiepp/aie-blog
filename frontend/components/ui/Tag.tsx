import type { PostTag } from "@/lib/types";

// Small pill tag. "topic" is a neutral knowledge tag; the difficulty variants
// carry a low-saturation tint. Colors come from tokens.css.
const VARIANT_STYLE: Record<NonNullable<PostTag["variant"]>, React.CSSProperties> = {
  topic: { border: "1px solid var(--hairline)", color: "var(--muted)" },
  easy: { background: "var(--tag-easy-bg)", color: "var(--tag-easy-fg)" },
  mid: { background: "var(--tag-mid-bg)", color: "var(--tag-mid-fg)" },
  hard: { background: "var(--tag-hard-bg)", color: "var(--tag-hard-fg)" },
};

export function Tag({ label, variant = "topic" }: PostTag) {
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-[10px] py-1 font-mono text-[11px] leading-none"
      style={VARIANT_STYLE[variant]}
    >
      {label}
    </span>
  );
}

// Convenience row for a list of tags.
export function TagList({ tags }: { tags: PostTag[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <Tag key={tag.label} {...tag} />
      ))}
    </div>
  );
}
