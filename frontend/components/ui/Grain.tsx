// Paper grain: an SVG fractal-noise tile multiplied over its parent. Used in
// exactly two places (the home masthead and the poster band), never as a
// site-wide texture. Opacity is scaled by --grain so the whole effect can be
// switched off from tokens.css.
const NOISE =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter id%3D%22n%22%3E%3CfeTurbulence type%3D%22fractalNoise%22 baseFrequency%3D%220.9%22 numOctaves%3D%224%22%2F%3E%3C%2Ffilter%3E%3Crect width%3D%22100%25%22 height%3D%22100%25%22 filter%3D%22url(%23n)%22 opacity%3D%220.16%22%2F%3E%3C%2Fsvg%3E";

export function Grain({ opacity = 0.5 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `url("${NOISE}")`,
        mixBlendMode: "multiply",
        opacity: `calc(${opacity} * var(--grain, 1))`,
      }}
    />
  );
}
