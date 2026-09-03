// The ink band that opens a field's group on /projects. Two cells: the running
// number in accent, then the field name. Nothing else: the descriptive column
// this band used to carry was removed on purpose, a band is a divider and not
// a place to explain.
export function FieldBand({ index, name }: { index: number; name: string }) {
  return (
    <div className="grid items-center border-b-2 border-rule bg-ink text-ink-invert md:grid-cols-[96px_1fr]">
      <span className="py-5 pl-14 text-[34px] font-extrabold leading-none tracking-[-0.03em] text-accent">
        {String(index).padStart(2, "0")}
      </span>
      <h2 className="m-0 py-5 pl-6 pr-14 text-[24px] font-bold leading-tight tracking-[-0.02em]">
        {name}
      </h2>
    </div>
  );
}
