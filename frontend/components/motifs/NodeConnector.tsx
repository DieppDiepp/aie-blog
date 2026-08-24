// Signature motif: a small node connected by a thin line. Reused across the
// site and it is the visual language of the Knowledge Graph.
export function NodeConnector({ className = "" }: { className?: string }) {
  return (
    <svg
      width="48"
      height="12"
      viewBox="0 0 48 12"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="48" y2="6" stroke="var(--hairline)" strokeWidth="1" />
      <circle cx="6" cy="6" r="4" fill="var(--accent)" />
    </svg>
  );
}
