/**
 * Format a date/timestamp string into readable 12-hour format.
 * @param {string|Date} dateStr
 * @returns {string} e.g. "19 Aug 2026, 02:30 PM"
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a date string into readable date-only format.
 * @param {string|Date} dateStr
 * @returns {string} e.g. "19 Aug 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
