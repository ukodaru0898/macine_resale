export type ColumnType = 'blue' | 'green' | 'yellow' | 'none'

export interface ColumnDefinition {
  field: string
  headerName: string
  width?: number
  type?: 'number' | 'string'
  color?: ColumnType
  // compute function for yellow columns - optional
  compute?: (row: any) => any
}

export interface TableSchema {
  id: string
  name: string
  sheetName: string
  columns: ColumnDefinition[]
}

export type RowData = Record<string, any>
