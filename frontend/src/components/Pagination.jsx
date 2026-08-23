import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-slate-500">
        Page <span className="text-slate-300 font-medium">{page}</span> of{' '}
        <span className="text-slate-300 font-medium">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 transition-colors"
        >
          <MdChevronLeft size={20} />
        </button>

        {pages[0] > 1 && (
          <>
            <PageBtn n={1} current={page} onClick={onPageChange} />
            {pages[0] > 2 && <span className="text-slate-600 px-1">…</span>}
          </>
        )}

        {pages.map((n) => (
          <PageBtn key={n} n={n} current={page} onClick={onPageChange} />
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="text-slate-600 px-1">…</span>
            )}
            <PageBtn n={totalPages} current={page} onClick={onPageChange} />
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 transition-colors"
        >
          <MdChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

function PageBtn({ n, current, onClick }) {
  return (
    <button
      onClick={() => onClick(n)}
      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150 ${
        n === current
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
          : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
      }`}
    >
      {n}
    </button>
  )
}
