import { TableSchema, RowData } from '../types'

/**
 * Compute yellow cells for a row based on schema columns
 * - If column has compute function, call it with the row
 * - Otherwise leave as-is
 */
export const computeRow = (row: RowData, schema: TableSchema): RowData => {
  const newRow = { ...row }
  schema.columns.forEach((c) => {
    if (c.color === 'yellow') {
      if (typeof c.compute === 'function') {
        try {
          newRow[c.field] = c.compute(newRow)
        } catch (e) {
          console.error('compute error for', c.field, e)
          newRow[c.field] = ''
        }
      }
    }
  })
  return newRow
}

/**
 * Compute yellow cells for all rows
 */
export const computeRows = (rows: RowData[], schema: TableSchema) => rows.map((r) => computeRow(r, schema))
