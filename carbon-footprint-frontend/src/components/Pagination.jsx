import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

/**
 * Client-side pagination controls.
 * @param {Array} items - Full filtered list to paginate
 * @param {Object} other - Any other param to reset page on (e.g. searchQuery/statusFilter)
 */
const Pagination = ({ items, pageSizeOption = 'pageSize', onPaginated, resetKey }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [resetKey, pageSize]);

  const totalItems = Array.isArray(items) ? items.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginated = Array.isArray(items) ? items.slice(startIndex, endIndex) : [];

  useEffect(() => {
    if (onPaginated) onPaginated(paginated);
  }, [safePage, pageSize, resetKey]);

  if (totalItems === 0) {
    return (
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
        <span>Showing 0–0 of 0 items</span>
      </div>
    );
  }

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages <= 7 || i === 1 || i === totalPages || (i >= safePage - 1 && i <= safePage + 1)) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
      pageNumbers.push('...');
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs text-slate-400">
      <span>
        Showing <span className="text-white font-semibold">{startIndex + 1}</span>–
        <span className="text-white font-semibold">{endIndex}</span> of{' '}
        <span className="text-white font-semibold">{totalItems}</span> items
      </span>

      <div className="flex items-center gap-3">
        {/* Page size selector */}
        <label className="flex items-center gap-1.5 text-slate-400">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 rounded-md px-1.5 py-1 text-xs text-slate-200 outline-none focus:border-emerald-500"
          >
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={safePage === 1}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pageNumbers.map((p, idx) =>
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-slate-600">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded font-semibold transition-all ${
                  p === safePage
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={safePage === totalPages}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
