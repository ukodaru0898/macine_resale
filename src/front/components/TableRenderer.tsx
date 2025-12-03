import React from 'react'
import { DataGrid, GridColDef, GridRenderCellParams, useGridApiRef } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import { TableSchema, RowData } from '../types'

import '../styles.css'

interface TableRendererProps {
  schema: TableSchema
  rows: RowData[]
  onCellEdit?: (rowId: string | number, field: string, value: any) => void
}

export const TableRenderer: React.FC<TableRendererProps> = ({ schema, rows, onCellEdit }) => {
  const apiRef = useGridApiRef()

  const isMachine = schema.id === 'machine_recommendation'

  // quick map of field -> color for click handling
  const fieldColorMap: Record<string, string> = {}
  schema.columns.forEach((c) => (fieldColorMap[c.field] = c.color))
  const columns: GridColDef[] = schema.columns.map((c) => {
    const isMachine = schema.id === 'machine_recommendation'
    
    // Check if this column should have red header
    const redHeaderFields = ['deal_outcome_probability', 'expected_pipeline_units']
    const hasRedHeader = redHeaderFields.includes(c.field)
    
    // Check if this column should have gray header
    const grayHeaderFields = ['qtc_avg_bb_price', 'units_in_sales_pipeline']
    const hasGrayHeader = grayHeaderFields.includes(c.field)
    
    const base: GridColDef = {
      field: c.field,
      headerName: c.headerName,
      width: c.width || 150,
      minWidth: 80,
      headerClassName: hasRedHeader ? 'red-header' : (hasGrayHeader ? 'gray-header' : undefined),
    }

    const renderCell = (params: GridRenderCellParams<any, any, any>) => {
      let bg = ''
      let textColor = 'white'
      const isTotal = params.row && `${params.row.id}` === 'total'
      const isEmptySeparator = params.row && `${params.row.id}` === 'empty-separator'
      const metricValue = String(params.row.metric || '').toLowerCase()
      const isTotalMetric = metricValue === 'total'
      const isTotalInBuybackOrProfit = isTotalMetric && (schema.id === 'max_buyback' || schema.id === 'expected_profit')
      
      // Total row in max_buyback/expected_profit tables (check by metric='Total')
      if (isTotalInBuybackOrProfit) {
        // Apply yellow color for valuation/profit columns
        if (c.color === 'yellow') {
          bg = 'rgb(254, 209, 0)' // ASML Yellow
          textColor = 'black'
        } else if (c.color === 'green') {
          // Show green for editable fields in Total row (e.g., required_margin in max_buyback)
          bg = 'rgb(52, 178, 51)' // ASML Green
          textColor = 'black'
        } else {
          bg = 'white' // White for other columns in Total row
          textColor = 'black'
        }
      } else if (isTotal) {
        // Other tables' total rows (System Recommendation) - white background
        bg = 'white'
        textColor = 'black'
      } else if (!isEmptySeparator) {
        // Don't apply background color to empty separator row
        if (c.color === 'blue') {
          bg = 'rgb(15, 35, 140)' // ASML Blue
          textColor = 'white'
        }
        if (c.color === 'green') {
          bg = 'rgb(52, 178, 51)' // ASML Green
          textColor = 'black'
        }
        if (c.color === 'yellow') {
          bg = 'rgb(254, 209, 0)' // ASML Yellow
          textColor = 'black'
        }
        if (c.color === 'none') {
          bg = '' // No background color
          textColor = 'black'
        }
      }
      
      let displayValue = params.value
      const isMaxBuyback = schema.id === 'max_buyback'
      const isExpectedProfit = schema.id === 'expected_profit'
      
        // Show margin values for Total row in Max Buy Back and Expected Profit tables
        if (isTotalMetric && ((isMaxBuyback && c.field === 'required_margin') || (isExpectedProfit && c.field === 'margin'))) {
          displayValue = params.value // Keep the display value instead of hiding it
        }
      
      return (
        <div
          className="table-cell"
          style={{
            width: '100%',
            height: '100%',
            background: bg,
            color: textColor,
            fontWeight: isTotal ? 700 : undefined,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 8,
          }}
        >
          {displayValue}
        </div>
      )
    }

    if (c.color === 'green') {
      // editable green fields
      return {
        ...base,
        editable: true,
        renderCell,
      }
    }

    return {
      ...base,
      editable: false,
      renderCell,
    }
  })

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <h3>{schema.name}</h3>
      {(() => {
        const dgProps: any = {
          autoHeight: true,
          rows: rows.map((r: any, idx: number) => ({ ...r, id: r.id ?? idx })),
          columns,
          apiRef,
          columnHeaderHeight: schema.id === 'max_buyback' || schema.id === 'expected_profit' ? 56 : 80,
          disableSelectionOnClick: true,
          hideFooter: true,
          disableColumnMenu: true,
          isCellEditable: (params: any) => {
            // Allow editing Total row in Max Buy Back table for required_margin field
            if (params.row && `${params.row.id}` === 'total') {
              if (schema.id === 'max_buyback' && params.field === 'required_margin') {
                return true
              }
              return false
            }
            return params.colDef && params.colDef.editable
          },
          onCellClick: (params: any, event: any) => {
            try {
              const fld = params.field
              const colColor = fieldColorMap[fld]
              // only start edit for green (editable) columns
              if (colColor === 'green' && apiRef && apiRef.current) {
                try {
                  ;(apiRef as any).current.setCellMode(params.id, fld, 'edit')
                } catch (err) {
                  // fallback: attempt to start editing via deprecated method if available
                  try {
                    ;(apiRef as any).current.startCellEdit?.(params.id, fld)
                  } catch (e) {
                    // ignore if not supported
                  }
                }
              }
            } catch (e) {
              // ignore
            }
          },
          // event when edits are committed (use processRowUpdate for newer MUI DataGrid)
          processRowUpdate: (newRow: any, oldRow: any) => {
            // Find changed fields
            const changedFields = Object.keys(newRow).filter(key => newRow[key] !== oldRow[key])
            if (changedFields.length > 0) {
              // Compute the row immediately with the schema's compute functions
              const computedRow = { ...newRow }
              schema.columns.forEach((col: any) => {
                if (col.compute && typeof col.compute === 'function') {
                  computedRow[col.field] = col.compute(computedRow)
                }
              })
              
              // Notify parent of the change with original values
              if (onCellEdit) {
                changedFields.forEach(field => {
                  onCellEdit(newRow.id, field, newRow[field])
                })
              }
              
              // Return the computed row so DataGrid displays it immediately
              return computedRow
            }
            return newRow
          },
          onProcessRowUpdateError: (error: any) => {
            console.error('Row update error:', error)
          },
        }
        // For Machine Recommendation, append a totals row summing numeric columns
        let displayRows = dgProps.rows
        if (isMachine && Array.isArray(displayRows) && displayRows.length > 0) {
          const totals: any = { id: 'total' }
          const startIdx = schema.columns.findIndex((c: any) => c.field === 'offered_bundle')
          // Fields that should not be summed in totals
          const noSumFields = ['deal_outcome_probability', 'required_margin', 'spacer1']
          
          schema.columns.forEach((col: any, idx: number) => {
            if (col.field === 'machine_type') {
              // Show "Total" label in machine_type column
              totals[col.field] = 'Total'
              return
            }
            if (idx < startIdx) {
              // keep columns before offered_bundle empty
              totals[col.field] = ''
              return
            }
            // Skip fields that shouldn't be summed (including spacer columns)
            if (noSumFields.includes(col.field) || col.field.startsWith('spacer')) {
              totals[col.field] = ''
              return
            }
            // for numeric columns starting from offered_bundle, sum values
            if (col.type === 'number') {
              const sum = displayRows.reduce((acc: number, r: any) => acc + Number(r[col.field] || 0), 0)
              totals[col.field] = Math.floor(sum)
            } else if (idx === startIdx) {
              // label cell at offered_bundle if not numeric
              totals[col.field] = 'Total'
            } else {
              totals[col.field] = 0
            }
          })
          displayRows = [...displayRows, totals]
        }

        return (
          <div style={{ width: '100%' }}>
            <DataGrid 
              {...dgProps} 
              rows={displayRows}
              getRowClassName={(params:any)=>{
                if(`${params.id}`==='total') return 'row-total'
                if(`${params.id}`==='empty-separator') return 'empty-separator'
                // Check for Total row by metric field
                const metricVal = String(params.row?.metric || '').toLowerCase()
                if(metricVal === 'total') return 'row-total'
                return ''
              }} 
            />
          </div>
        )
      })()}
    </Box>
  )
}

export default TableRenderer
