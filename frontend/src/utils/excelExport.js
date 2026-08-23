import * as XLSX from 'xlsx'

/**
 * Export data to Excel (.xlsx) file.
 * @param {string} title - Sheet name and filename base
 * @param {string[]} columns - Column headers
 * @param {any[][]} rows - Row data (array of arrays)
 * @param {string} [filename] - Optional override filename
 */
export function exportToExcel(title, columns, rows, filename) {
  const ws = XLSX.utils.aoa_to_sheet([columns, ...rows])

  // Auto-width columns
  const colWidths = columns.map((col, i) => {
    const maxLen = Math.max(
      col.length,
      ...rows.map(r => String(r[i] ?? '').length)
    )
    return { wch: Math.min(maxLen + 2, 40) }
  })
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31)) // sheet name max 31 chars

  const fname = filename || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, fname)
}
