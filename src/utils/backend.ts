import axios from 'axios'
import { TableSchema, RowData } from '../types'

/**
 * Create a combined CSV for all tables with table identifier
 */
export const composeCombinedCSV = (tables: Record<string, RowData[]>, schemas: TableSchema[]) => {
  const lines: string[] = []
  schemas.forEach((s) => {
    const rows = tables[s.id] || []
    // header line
    const header = ['table_id', 'row_id', ...s.columns.map((c) => c.field)]
    lines.push(header.join(','))
    rows.forEach((r) => {
      const line = [s.id, r.id, ...s.columns.map((c) => r[c.field] ?? '')].join(',')
      lines.push(line)
    })
  })
  return lines.join('\n')
}

/**
 * Parse a csv string produced by {{optimize.py}} output
 * Expect format: table_id,row_id,<...fields>
 * Return map of tableId => rows (by id)
 */
export const parseBackendCSV = (csv: string, schemas: TableSchema[]) => {
  const lines = csv.split('\n').filter(Boolean)
  const result: Record<string, Record<string, RowData>> = {}
  let headers: string[] | null = null
  let curTable = ''
  let schemaMap: Record<string, TableSchema> = {}
  schemas.forEach((s) => (schemaMap[s.id] = s))

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const cells = line.split(',')
    if (!headers || headers[0] !== 'table_id') {
      headers = cells
      // skip to next
      continue
    }
    // Now parse
    const tableId = cells[0]
    const rowId = cells[1]
    const schema = schemaMap[tableId]
    if (!schema) continue
    if (!result[tableId]) result[tableId] = {}
    const row: RowData = {}
    schema.columns.forEach((c, idx) => {
      const val = cells[2 + idx]
      row[c.field] = val
    })
    result[tableId][rowId] = row
  }

  return result
}

/**
 * Post System Recommendation data to Python backend to trigger optimization
 * The backend will:
 * 1. Copy Base.xlsx to MasterDB.xlsx
 * 2. Save System Recommendation data as User Input1 and Max Buy Back as User Input2
 * 3. Save Systems, Modules, Parts demand data to MasterDB.xlsx
 * 4. Run the optimizer script
 * 5. Return results from MasterDB.xlsx
 */
export const postCsvToBackend = async (
  systemRecommendationData: RowData[], 
  marginData: Record<string, number>,
  maxBuybackData?: RowData[],
  systemsData?: RowData[],
  modulesData?: RowData[],
  partsData?: RowData[]
) => {
  // Use environment variable for backend URL (Render deployment) or /api/ for Docker/local
  const backendUrl = import.meta.env.VITE_BACKEND_URL || ''
  const url = backendUrl ? `${backendUrl}/api/optimize` : '/api/optimize'
  
  try {
    const payload = {
      systemRecommendation: systemRecommendationData,
      maxBuyback: maxBuybackData || [],
      systems: systemsData || [],
      modules: modulesData || [],
      parts: partsData || [],
      refurbishmentMargin: marginData.refurbishment || 20,
      harvestingModuleMargin: marginData.harvestingModule || 25,
      harvestingPartsMargin: marginData.harvestingParts || 30,
      totalMargin: marginData.total || 22
    }

    const resp = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 90000, // 90 second timeout for optimization
    })
    
    return resp.data
  } catch (error) {
    console.error('Error calling Python backend:', error)
    throw new Error('Failed to run optimization. Please check the backend logs.')
  }
}
