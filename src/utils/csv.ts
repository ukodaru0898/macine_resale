import { RowData, TableSchema } from '../types'

export const rowsToCSV = (rows: RowData[], schema: TableSchema) => {
  const headers = schema.columns.map((c) => c.headerName)
  const fields = schema.columns.map((c) => c.field)
  const lines = [headers.join(',')]
  rows.forEach((r) => {
    const line = fields
      .map((f) => {
        const v = r[f]
        if (v === null || v === undefined) return ''
        return typeof v === 'string' && v.includes(',') ? `"${v}"` : `${v}`
      })
      .join(',')
    lines.push(line)
  })
  return lines.join('\n')
}

export async function saveCSVFile(fileName: string, csv: string) {
  // Use File System Access API if available, else fallback to blob download
  // Browser support: latest Chrome/Edge/Opera; fallback works everywhere
  try {
    // @ts-ignore - showSaveFilePicker is not yet on lib.dom.d.ts sometimes
    if (window.showSaveFilePicker) {
      // ask user to pick a location
      // mime type text/csv
      // create file and write
      // This API requires user gesture (which this will be inside a click)
      const options = {
        suggestedName: fileName,
        types: [
          {
            description: 'CSV file',
            accept: { 'text/csv': ['.csv'] },
          },
        ],
      }
      // @ts-ignore
      const handle = await window.showSaveFilePicker(options)
      const writable = await handle.createWritable()
      await writable.write(csv)
      await writable.close()
      return true
    }
  } catch (err) {
    console.warn('FileSystem API not available or save cancelled:', err)
  }

  // Fallback - create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return true
}
