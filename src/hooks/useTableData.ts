import { useEffect, useState } from 'react'
import { ALL_SCHEMAS, MACHINE_RECOMMENDATION_SCHEMA } from '../schemas/tables'
import { TableSchema, RowData } from '../types'
import { computeRows } from '../utils/compute'
import { readExcelFile, excelToRows } from '../utils/excel'

export function useTableData() {
  const [schemas] = useState<TableSchema[]>(ALL_SCHEMAS)

  const [excelTables, setExcelTables] = useState<Record<string, any[]>>({})
  const [tables, setTables] = useState<Record<string, RowData[]>>({})
  const STORAGE_KEY = 'optimization_ui_tables_v2'

  useEffect(() => {
    // initialize empty rows for each schema
    const initial: Record<string, RowData[]> = {}
    schemas.forEach((s: TableSchema) => {
      initial[s.id] = []
    })
    setTables(initial)
  }, [schemas])

  // load from localStorage if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, RowData[]>
        // ensure keys exist for all schemas
        const merged: Record<string, RowData[]> = {}
        schemas.forEach((s) => {
          merged[s.id] = parsed[s.id] ?? []
        })
        setTables(merged)
      }
    } catch (e) {
      // ignore parse errors
      console.debug('no persisted tables', e)
    }
  }, [])

  const importExcel = async (file: File) => {
    const sheets = await readExcelFile(file)
    setExcelTables(sheets)

    // Helpers for tolerant mapping
    const findKey = (keys: string[], patterns: RegExp[]) => {
      for (const p of patterns) {
        const found = keys.find((k) => p.test(k))
        if (found) return found
      }
      return undefined
    }

    const getSheetByName = (name: string) => {
      if (sheets[name]) return sheets[name]
      const low = name.toLowerCase()
      const key = Object.keys(sheets).find((k) => k.toLowerCase() === low)
      return key ? sheets[key] : []
    }

    // For each schema, map the sheet data to rows
    const next: Record<string, RowData[]> = {}
    schemas.forEach((s) => {
      // handle Systems / Modules / Parts specially
      if (['systems', 'modules', 'parts'].includes(s.id)) {
        const sheetRows = getSheetByName(s.sheetName) || []
        
        // Filter out rows that are clearly headers or empty
        const dataRows = sheetRows.filter((r: any) => {
          const firstValue = Object.values(r)[0]
          const firstValueStr = String(firstValue || '').toLowerCase().trim()
          // Skip if first column looks like a header
          return firstValueStr !== 'system' && 
                 firstValueStr !== 'module' && 
                 firstValueStr !== 'part' &&
                 firstValueStr !== '' &&
                 firstValue != null
        })
        
        const rows = dataRows.map((r: any, idx: number) => {
          const keys = Object.keys(r)
          const itemKey = keys[0] || 'Item'

          const demand12Key = findKey(keys, [/demand\s*12/i, /12\s*m/i, /demand.*12/i, /demand_12/i])
          const demand24Key = findKey(keys, [/demand\s*24/i, /24\s*m/i, /demand.*24/i, /demand_24/i])
          const finish12Key = findKey(keys, [/qinventory.*12/i, /finished.*12/i, /finished.*12m/i, /finished\s*12/i, /finished_12/i, /finished inventory 12/i, /inventory.*12/i])
          const finish24Key = findKey(keys, [/qinventory.*24/i, /finished.*24/i, /finished.*24m/i, /finished\s*24/i, /finished_24/i, /inventory.*24/i])

          // fallback positional mapping
          const demand12 = demand12Key ? r[demand12Key] : (keys[1] ? r[keys[1]] : '')
          const demand24 = demand24Key ? r[demand24Key] : (keys[2] ? r[keys[2]] : '')
          const finished12 = finish12Key ? r[finish12Key] : (keys[3] ? r[keys[3]] : '')
          const finished24 = finish24Key ? r[finish24Key] : (keys[4] ? r[keys[4]] : '')

          return {
            id: `${idx}`,
            item: String(r[itemKey] ?? '').trim(),
            demand_12m: Number(demand12 ?? 0),
            demand_24m: Number(demand24 ?? 0),
            finished_12m: Number(finished12 ?? 0),
            finished_24m: Number(finished24 ?? 0),
            required_12m: 0,
            required_24m: 0,
          }
        })
        next[s.id] = computeRows(rows, s)
        return
      }
      if (s.id === 'machine_recommendation') {
        // Use CoreQInventory and OutBase sheets (case-insensitive lookup)
        const coreQ = getSheetByName('CoreQInventory') || []
        const outBase = getSheetByName('OutBase') || []

        // Get machine types from CoreQInventory column 'System'
        const machineTypes = coreQ
          .map((r: any) => r['System'])
          .filter((v: any) => v && String(v).toLowerCase() !== 'system')

        // QTC average BB price from OutBase column B
        const qtcPrices = outBase
          .map((r: any) => r['QTC average BB price'])
          .filter((v: any) => v !== undefined && v !== '')

        // Recommended Buy for 12 M from OutBase column C
        const recBuy12M = outBase
          .map((r: any) => {
            const val = r['Recommended Buy for 12 M']
            return val !== undefined && val !== '' ? Math.round(val * 100) / 100 : val
          })
          .filter((v: any) => v !== undefined && v !== '')

        // Units in qualified inventory from CoreQInventory column B (CoreInventory)
        const unitsQualified = coreQ
          .map((r: any) => {
            const val = r['CoreInventory'] || r['coreinventory']
            return val !== undefined && val !== '' && val !== 'CoreInventory' && val !== 'coreinventory' ? Math.round(Number(val) * 100) / 100 : undefined
          })
          .filter((v: any) => v !== undefined && v !== '')

        // Recommended from other inventory - same as Recommended Buy for 12 M
        const recFromOther = outBase
          .map((r: any) => {
            const val = r['Recommended Buy for 12 M']
            return val !== undefined && val !== '' ? Math.round(val * 100) / 100 : val
          })
          .filter((v: any) => v !== undefined && v !== '')

        // Recommended BB Price on Bundle from OutBase column E
        const recBbPrice = outBase
          .map((r: any) => r['Recommended BB Price on Bundle'])
          .filter((v: any) => v !== undefined && v !== '')

        const rowCount = Math.max(machineTypes.length, qtcPrices.length, recBuy12M.length, unitsQualified.length, recFromOther.length, recBbPrice.length)
        const rows = Array.from({ length: rowCount }).map((_, i) => ({
          id: `${i}`,
          machine_type: machineTypes[i] ?? '',
          offered_bundle: 0,
          qtc_avg_bb_price: qtcPrices[i] ?? '',
          units_in_sales_pipeline: 0,
          // Do not prefill from DB/Excel; user enters this
          units_in_qualified_inventory: 0,
          recommended_from_other_inventory: recFromOther[i] ?? '',
          spacer1: '',
          recommended_buy_12m: recBuy12M[i] ?? '',
          required_margin: 40,
          recommended_bb_price_on_bundle: recBbPrice[i] ?? '',
        }))
        next[s.id] = computeRows(rows, s)
      } else if (s.id === 'max_buyback') {
        // Max Buy Back Bundle Valuation - exclude any 'Total' metric rows per user request
        const outProfit = getSheetByName('OutProfit') || []
        const buybackRows = outProfit.filter((r: any) => {
          const type = String(r.type || '').toLowerCase().trim()
          const metric = String(r.Metric || '').toLowerCase().trim()
          return type.includes('buy back') && metric != 'total'
        })
        const rows = buybackRows.map((r: any, idx: number) => {
          const valuationVal = r.Valuation !== undefined && r.Valuation !== null && r.Valuation !== '' ? Number(r.Valuation) : 0
          return {
            id: `${idx}`,
            metric: r.Metric || '',
            valuation: isNaN(valuationVal) ? 0 : valuationVal,
            required_margin: 40,
          }
        })
        next[s.id] = computeRows(rows, s)
      } else if (s.id === 'expected_profit') {
        // Expected Profit on Bundle - get all rows from OutProfit sheet where type='Profit'
        const outProfit = getSheetByName('OutProfit') || []
        
        // Get all Profit type rows
        const profitRows = outProfit.filter((r: any) => {
          const type = String(r.type || '').toLowerCase().trim()
          return type === 'profit'
        })
        
        const rows = profitRows.map((r: any, idx: number) => {
          // Base.xlsx OutProfit sheet has: Margin column (profit values) and Valuation column (margin % values)
          // UI Expected Profit table: Profit column and Margin (%) column
          // So: Excel Margin -> UI Profit, Excel Valuation -> UI Margin
          
          // Handle the Margin column - could be number, null, or 'null' string, or empty string
          // Also remove commas from formatted numbers like "8,448"
          let marginFromExcel = 0
          const marginValue = r.Margin
          if (marginValue !== undefined && marginValue !== null && marginValue !== 'null' && marginValue !== 'mnull' && marginValue !== '') {
            const cleanedValue = String(marginValue).replace(/,/g, '')
            const parsed = Number(cleanedValue)
            marginFromExcel = isNaN(parsed) ? 0 : parsed
          }
          
          // Handle the Valuation column
          let valuationFromExcel = 0
          const valuationValue = r.Valuation
          if (valuationValue !== undefined && valuationValue !== null && valuationValue !== 'null' && valuationValue !== '') {
            const cleanedValue = String(valuationValue).replace(/,/g, '')
            const parsed = Number(cleanedValue)
            valuationFromExcel = isNaN(parsed) ? 0 : parsed
          }
          
          return {
            id: `${idx}`,
            metric: r.Metric || '',
            valuation: marginFromExcel,  // Excel Margin -> UI Profit column
            margin: valuationFromExcel,  // Excel Valuation -> UI Margin column
          }
        })
        next[s.id] = rows  // Don't call computeRows, just use the data as-is
      } else if (s.id === 'conversion_matrix') {
        // Conversion Matrix - read from 'Conversion matrix ' sheet (note trailing space)
        const convMatrix = getSheetByName('Conversion matrix ') || getSheetByName('Conversion matrix') || []
        const rows = convMatrix.map((r: any, idx: number) => ({
          id: `${idx}`,
          delta: r['Delta_{i,j}'] || r['Delta'] || '',
          '275d': r['275D'] !== undefined && r['275D'] !== null ? Number(r['275D']) : undefined,
          '350c': r['350C'] !== undefined && r['350C'] !== null ? Number(r['350C']) : undefined,
          '450f': r['450F'] !== undefined && r['450F'] !== null ? Number(r['450F']) : undefined,
          '850f': r['850F'] !== undefined && r['850F'] !== null ? Number(r['850F']) : undefined,
          '1150f': r['1150F'] !== undefined && r['1150F'] !== null ? Number(r['1150F']) : undefined,
        }))
        next[s.id] = computeRows(rows, s)
      } else {
        const rows = excelToRows(sheets[s.sheetName] || [], s)
        next[s.id] = computeRows(rows, s)
      }
    })
    setTables(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (e) {
      console.warn('persist tables failed', e)
    }
  }

  const updateTableRows = (tableId: string, newRows: RowData[]) => {
    setTables((prev: Record<string, RowData[]>) => {
      const out = { ...prev, [tableId]: newRows }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
      } catch (e) {
        console.warn('persist tables failed', e)
      }
      return out
    })
  }

  const updateRowCell = (tableId: string, rowId: string | number, field: string, value: any) => {
    const schema = schemas.find((s: TableSchema) => s.id === tableId)!
    setTables((prev: Record<string, RowData[]>) => {
      const t = prev[tableId] || []
      const next = t.map((r) => {
        if (`${r.id}` === `${rowId}`) {
          const n = { ...r, [field]: value }
          // recompute based on schema
          return computeRows([n], schema)[0]
        }
        return r
      })
      const out = { ...prev, [tableId]: next }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
      } catch (e) {
        console.warn('persist tables failed', e)
      }
      return out
    })
  }

  const recomputeTable = (tableId: string) => {
    const schema = schemas.find((s: TableSchema) => s.id === tableId)!
    setTables((prev: Record<string, RowData[]>) => {
      const out = { ...prev, [tableId]: computeRows(prev[tableId] || [], schema) }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
      } catch (e) {
        console.warn('persist tables failed', e)
      }
      return out
    })
  }

  const clearPersisted = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.warn('clear persist failed', e)
    }
  }

  return {
    schemas,
    tables,
    importExcel,
    updateTableRows,
    updateRowCell,
    recomputeTable,
    clearPersisted,
  }
}
