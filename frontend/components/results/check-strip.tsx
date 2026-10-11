// The signature element (DESIGN.md › Check strip): a dispensing-label band at the
// bottom of a recommendation card. Rendered only when `items` is non-empty.
export function CheckStrip({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-auto rounded-b-lg border-t border-dashed border-line-strong bg-background px-5 py-3">
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-data text-data-caps uppercase text-ink-muted">Checked against</span>
        <span className="text-body-sm text-ink">{items.join(" · ")}</span>
      </p>
    </div>
  );
}
