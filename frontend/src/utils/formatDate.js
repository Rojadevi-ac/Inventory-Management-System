const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function getActiveTimezone() {
  return localStorage.getItem('ims_timezone') || 'Asia/Kolkata'
}

/**
 * Robust date parser handling strings, numbers, Date objects, and ISO/MySQL formats.
 * @param {string|number|Date} val
 * @returns {Date|null}
 */
function parseDate(val) {
  if (val === null || val === undefined || val === '' || val === 'null' || val === 'undefined') {
    return null
  }
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val
  }
  if (typeof val === 'number') {
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d
  }

  let str = String(val).trim()
  if (!str) return null

  // 1. Try standard Date constructor
  let d = new Date(str)
  if (!isNaN(d.getTime())) return d

  // 2. Try replacing space with 'T' for MySQL format "YYYY-MM-DD HH:MM:SS"
  if (str.includes(' ') && !str.includes('T')) {
    d = new Date(str.replace(' ', 'T'))
    if (!isNaN(d.getTime())) return d
  }

  return null
}

/**
 * Format a date/timestamp string into 12-hour format using active application global timezone.
 * @param {string|number|Date} val
 * @param {string} [customTz]
 * @returns {string} e.g. "26 Aug 2026, 05:30 PM"
 */
export function formatDateTime(val, customTz = null) {
  const d = parseDate(val)
  if (!d) return '—'

  const targetTz = customTz || getActiveTimezone()

  try {
    return d.toLocaleString('en-IN', {
      timeZone: targetTz,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    const year = d.getFullYear()
    const month = MONTH_NAMES[d.getMonth()]
    const day = String(d.getDate()).padStart(2, '0')
    let hours = d.getHours()
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${day} ${month} ${year}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`
  }
}

/**
 * Format a date string into readable date-only format using active application global timezone.
 * @param {string|number|Date} val
 * @param {string} [customTz]
 * @returns {string} e.g. "26 Aug 2026"
 */
export function formatDate(val, customTz = null) {
  const d = parseDate(val)
  if (!d) return '—'

  const targetTz = customTz || getActiveTimezone()

  try {
    return d.toLocaleDateString('en-IN', {
      timeZone: targetTz,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    const year = d.getFullYear()
    const month = MONTH_NAMES[d.getMonth()]
    const day = String(d.getDate()).padStart(2, '0')
    return `${day} ${month} ${year}`
  }
}
