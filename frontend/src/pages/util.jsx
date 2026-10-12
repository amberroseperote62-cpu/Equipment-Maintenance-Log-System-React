export const fmt = (d) => new Date(d).toLocaleString();
export const ACTIONS = [
  "cleaned",
  "repaired",
  "modified",
  "inspected",
  "part_replaced",
];
export const STATUSES = [
  "working",
  "under_repair",
  "needs_replacement",
  "disposed",
];
export const label = (s) => s.replaceAll("_", " ");
export function Pager({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null;
  return (
    <div className="pager">
      <button
        disabled={meta.current_page <= 1}
        onClick={() => onPage(meta.current_page - 1)}
      >
        ← Prev
      </button>
      <span>
        Page {meta.current_page} of {meta.last_page}
      </span>
      <button
        disabled={meta.current_page >= meta.last_page}
        onClick={() => onPage(meta.current_page + 1)}
      >
        Next →
      </button>
    </div>
  );
}
