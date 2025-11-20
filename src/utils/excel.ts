import * as XLSX from 'xlsx'
import { TableSchema } from '../types'

/**
 * Read an Excel File and return a map of sheetName -> rows array
 */
export const readExcelFile = async (file: File) => {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer)
  const sheetNames = workbook.SheetNames
  const tables: Record<string, any[]> = {}
  sheetNames.forEach((s) => {
    const sheet = workbook.Sheets[s]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })
    // Normalize keys by trimming spaces
    const normalizedRows = rows.map((row: any) => {
      const normalized: any = {}
      Object.keys(row).forEach(key => {
        const trimmedKey = key.trim()
        normalized[trimmedKey] = row[key]
      })
      return normalized
    })
    tables[s] = normalizedRows
  })
  return tables
}

/**
 * Convert Excel sheet rows into table rows according to TableSchema
 * This will map only 'blue' columns from Excel data - green will be empty or preserved
 */
export const excelToRows = (sheetRows: any[], schema: TableSchema) => {
  return sheetRows.map((r, i) => {
    const row: any = { id: `${i}` }
    schema.columns.forEach((col) => {
      // if it's a blue column, try to get value from Excel row by headerName
      const key = col.field
      if (col.color === 'blue') {
        // Try mapping by field name or headerName
        row[key] = r[col.field] ?? r[col.headerName] ?? r[key] ?? ''
      } else {
        row[key] = row[key] ?? ''
      }
    })
    return row
  })
}

/**
 * Read Out_BB and Out_TOT sheets from Base.xlsx after optimization
 */
export interface OptimizationResults {
  out_bb: Record<string, any>[];
  out_tot: Record<string, any>[];
}

export async function readOptimizationResults(): Promise<OptimizationResults> {
  try {
    const response = await fetch('/sample_data/Base.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Helper to get sheet by name (case-insensitive)
    const getSheet = (name: string) => {
      const sheetNames = workbook.SheetNames;
      const found = sheetNames.find(s => s.toLowerCase() === name.toLowerCase());
      return found ? workbook.Sheets[found] : null;
    };

    // Read Out_BB sheet
    const outBBSheet = getSheet('Out_BB');
    const out_bb = outBBSheet ? XLSX.utils.sheet_to_json(outBBSheet) : [];

    // Read Out_TOT sheet
    const outTOTSheet = getSheet('Out_TOT');
    const out_tot = outTOTSheet ? XLSX.utils.sheet_to_json(outTOTSheet) : [];

    return { out_bb, out_tot };
  } catch (error) {
    console.error('Error reading optimization results:', error);
    throw error;
  }
}

/**
 * Map Out_BB results to System Recommendation table rows
 * Updates recommended_from_other_inventory and recommended_buy_12m
 */
export function mapOutBBToSystemRec(
  currentRows: any[],
  outBBData: Record<string, any>[]
): any[] {
  if (!outBBData.length) return currentRows;

  // Create a map of system -> optimization values
  const systemMap = new Map<string, any>();
  outBBData.forEach(row => {
    const system = row.System || row.system;
    if (system) {
      systemMap.set(system, row);
    }
  });

  // Update current rows with optimization results
  return currentRows.map(row => {
    const optData = systemMap.get(row.machine_type);
    if (optData) {
      return {
        ...row,
        recommended_from_other_inventory: optData.Recommended_From_Other_Inventory || 0,
        recommended_buy_12m: optData.Recommended_Buy_12M || 0,
      };
    }
    return row;
  });
}
