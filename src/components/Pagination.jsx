import React from "react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showingFrom,
  showingTo,
  totalItems,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="p-4 sm:p-6 border-t border-indigo-900/30">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs sm:text-sm text-gray-400">
          Showing {showingFrom} to {showingTo} of {totalItems} entries
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-indigo-900/50 rounded-lg
                       text-indigo-300 hover:bg-indigo-900/20
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {[...Array(Math.min(totalPages, 5))].map((_, i) => {
            let page;
            if (totalPages <= 5) page = i + 1;
            else if (currentPage <= 3) page = i + 1;
            else if (currentPage >= totalPages - 2)
              page = totalPages - 4 + i;
            else page = currentPage - 2 + i;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-md border text-sm ${
                  currentPage === page
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-indigo-900/50 text-gray-400 hover:bg-indigo-900/20"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-indigo-900/50 rounded-lg
                       text-indigo-300 hover:bg-indigo-900/20
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
