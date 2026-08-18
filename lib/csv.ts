interface CsvColumn<T> {
  header: string
  accessor: (row: T) => string | number | null | undefined
}

export function escapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function exportCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]) {
  const BOM = '﻿'
  const header = columns.map(c => escapeCell(c.header)).join(',')
  const body = rows.map(row =>
    columns.map(c => escapeCell(String(c.accessor(row) ?? ''))).join(',')
  ).join('\n')

  const blob = new Blob([BOM + header + '\n' + body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function csvFilename(prefix: string): string {
  return `${prefix}_${new Date().toISOString().slice(0, 10)}.csv`
}
