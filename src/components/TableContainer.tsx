import React from 'react'
import { Box, Grid, Button, CircularProgress } from '@mui/material'
import TableRenderer from './TableRenderer'
import { TableSchema } from '../types'

interface Props {
  schemas: TableSchema[]
  tables: Record<string, any[]>
  onCellEdit: (tableId: string, rowId: string | number, field: string, value: any) => void
  onSaveInputs?: () => void
  onOptimize?: () => void
  loading?: boolean
}

export const TableContainer: React.FC<Props> = ({ schemas, tables, onCellEdit, onSaveInputs, onOptimize, loading }) => {
  // Helper function to add total row
  const addTotalRow = (rows: any[], schema: TableSchema) => {
    if (!rows || rows.length === 0) return rows
    
    // For expected_profit, the Total row is already included from Excel with correct values
    if (schema.id === 'expected_profit') {
      return rows
    }
    
    // Filter out any existing Total rows from Excel
    const dataRows = rows.filter(r => String(r.metric).toLowerCase() !== 'total')
    
    // Calculate totals for numeric columns
    const total: any = { id: 'total', metric: 'Total' }
    schema.columns.forEach((col) => {
      if (col.type === 'number') {
        // Special case: required_margin in max_buyback table should always be 40 for Total row
        if (schema.id === 'max_buyback' && col.field === 'required_margin') {
          total[col.field] = 40
        } else {
          const sum = dataRows.reduce((acc, r) => {
            const val = Number(r[col.field] || 0)
            return acc + (isNaN(val) ? 0 : val)
          }, 0)
          total[col.field] = Math.floor(sum)
        }
      } else if (col.field !== 'metric') {
        total[col.field] = ''
      }
    })
    
    return [...dataRows, total]
  }
  
  return (
    <Box padding={2}>
      <Grid container direction="column" spacing={2}>
        {schemas.map((s, index) => {
          // Check if this is Max Buyback (index 1) or Expected Profit (index 2)
          const isMaxBuyback = index === 1
          const isExpectedProfit = index === 2
          
          // Skip Expected Profit here since we'll render it alongside Max Buyback
          if (isExpectedProfit) return null
          
          return (
            <React.Fragment key={s.id}>
              {isMaxBuyback ? (
                // Render Max Buyback and Expected Profit side by side
                <>
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box display="flex" gap={0}>
                          <Box flex={1}>
                            <TableRenderer
                              schema={s}
                              rows={addTotalRow(tables[s.id] ?? [], s)}
                              onCellEdit={(rowId: any, field: string, value: any) => onCellEdit(s.id, rowId, field, value)}
                            />
                          </Box>
                          <Box display="flex" flexDirection="column" justifyContent="flex-start" pt={7}>
                            <Box fontSize="14px" fontWeight="bold" mb={0.5} height="52px" display="flex" alignItems="center">
                              Metrics
                            </Box>
                            {addTotalRow(tables[s.id] ?? [], s).map((row: any, idx: number) => (
                              <Box key={idx} fontSize="14px" height="52px" display="flex" alignItems="center" px={1} fontWeight={row.id === 'total' ? 700 : undefined}>
                                {row.metric || ''}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box display="flex" gap={0}>
                          <Box flex={1}>
                            <TableRenderer
                              schema={schemas[2]} // Expected Profit schema
                              rows={addTotalRow(tables[schemas[2].id] ?? [], schemas[2])}
                              onCellEdit={(rowId: any, field: string, value: any) => onCellEdit(schemas[2].id, rowId, field, value)}
                            />
                          </Box>
                          <Box display="flex" flexDirection="column" justifyContent="flex-start" pt={7}>
                            <Box fontSize="14px" fontWeight="bold" mb={0.5} height="52px" display="flex" alignItems="center">
                              Metrics
                            </Box>
                            {addTotalRow(tables[schemas[2].id] ?? [], schemas[2]).map((row: any, idx: number) => (
                              <Box key={idx} fontSize="14px" height="52px" display="flex" alignItems="center" px={1} fontWeight={row.id === 'total' ? 700 : undefined}>
                                {row.metric || ''}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* Show buttons after these two tables */}
                  <Grid item xs={12}>
                    <Box display="flex" gap={2} my={2} justifyContent="center">
                      <Button 
                        variant="contained" 
                        onClick={onOptimize} 
                        disabled={loading}
                        className="optimize-button"
                        sx={{
                          backgroundColor: '#808080',
                          color: 'white',
                          padding: '10px 24px',
                          fontSize: '16px',
                          fontWeight: 600,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgb(15, 35, 140)',
                            transform: 'scale(1.05)',
                            boxShadow: '0 0 20px rgba(135, 206, 250, 0.6)',
                          },
                          '&:disabled': {
                            backgroundColor: '#cccccc',
                            color: '#666666',
                          }
                        }}
                      >
                        {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Optimise Bundle'}
                      </Button>
                    </Box>
                  </Grid>
                </>
              ) : (
                // Render other tables normally
                <Grid item xs={12}>
                  <TableRenderer
                    schema={s}
                    rows={tables[s.id] ?? []}
                    onCellEdit={(rowId: any, field: string, value: any) => onCellEdit(s.id, rowId, field, value)}
                  />
                </Grid>
              )}
            </React.Fragment>
          )
        })}
      </Grid>
    </Box>
  )
}

export default TableContainer
