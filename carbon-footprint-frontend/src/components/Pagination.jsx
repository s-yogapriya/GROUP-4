import React from 'react';

export default function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  // Keep the control compact while always exposing actual page numbers.
  const pages = totalPages <= 7
    ? Array.from({ length: totalPages }, (_, i) => i + 1)
    : Array.from(new Set([1, safePage - 1, safePage, safePage + 1, totalPages].filter(p => p >= 1 && p <= totalPages))).sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">Showing {start}–{end} of {total} records</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <label className="mr-1 text-xs text-slate-500">Rows:</label>
        <select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))}
          className="mr-2 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200">
          {[5, 10, 15, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button disabled={safePage === 1} onClick={() => onPageChange(safePage - 1)}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 disabled:opacity-40">Previous</button>
        {pages.map((p, index) => {
          const previous = pages[index - 1];
          const gap = previous && p - previous > 1;
          return (
            <React.Fragment key={p}>
              {gap && <span className="px-1 text-xs text-slate-600">…</span>}
              <button onClick={() => onPageChange(p)}
                className={`min-w-8 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${p === safePage ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'}`}>
                {p}
              </button>
            </React.Fragment>
          );
        })}
        <button disabled={safePage === totalPages} onClick={() => onPageChange(safePage + 1)}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
