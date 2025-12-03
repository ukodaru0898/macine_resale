import React, { useState, useEffect } from 'react'
import { Box, Button, Container, CircularProgress, Snackbar, Alert, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import { AccountCircle } from '@mui/icons-material'
import HeaderFilters from './components/HeaderFilters'
import { Legend } from './components/Legend'
import TableContainer from './components/TableContainer'
import Login from './components/Login'
import Register from './components/Register'
import { useTableData } from './hooks/useTableData'
import { composeCombinedCSV, parseBackendCSV, postCsvToBackend } from './utils/backend'
import { rowsToCSV, saveCSVFile } from './utils/csv'
import { readOptimizationResults, mapOutBBToSystemRec } from './utils/excel'

const App = () => {
  // Authentication state - MUST be declared before any conditional returns
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  
  // ALL hooks must be called unconditionally
  const { schemas, tables, importExcel, updateRowCell, recomputeTable, updateTableRows } = useTableData()
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(false)
  const [autoLoaded, setAutoLoaded] = useState(false)
  const [snack, setSnack] = useState<{ open: boolean; message?: string }>({ open: false })

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('session_token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      try {
        const userData = JSON.parse(user)
        setSessionToken(token)
        setCurrentUser(userData)
        setIsAuthenticated(true)
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem('session_token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  // Auto-load sample Base.xlsx from public/sample_data on mount (if present)
  useEffect(() => {
    if (autoLoaded || !isAuthenticated) return
    const loadDemo = async () => {
      try {
        const resp = await fetch('/sample_data/Base.xlsx')
        if (!resp.ok) return
        const buffer = await resp.arrayBuffer()
        const file = new File([buffer], 'Base.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        await importExcel(file)
        setAutoLoaded(true)
        setSnack({ open: true, message: 'Demo Base.xlsx auto-loaded' })
      } catch (e) {
        // ignore - demo file not present or network error
        console.debug('Auto-load demo Base.xlsx failed:', e)
      }
    }
    loadDemo()
  }, [autoLoaded, isAuthenticated, importExcel])

  // Handler functions - defined after all hooks
  const handleLoginSuccess = (user: any, token: string) => {
    setCurrentUser(user)
    setSessionToken(token)
    setIsAuthenticated(true)
    setSnack({ open: true, message: `Welcome back, ${user.full_name || user.username}!` })
  }

  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:5001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
        credentials: 'include',
      })
    } catch (e) {
      console.error('Logout error:', e)
    }
    
    localStorage.removeItem('session_token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setCurrentUser(null)
    setSessionToken(null)
    setAnchorEl(null)
    setSnack({ open: true, message: 'Logged out successfully' })
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLoadExcel = async (file: File) => {
    await importExcel(file)
  }

  // Show auth screens if not authenticated - AFTER all hooks
  if (!isAuthenticated) {
    if (showLogin) {
      return <Login 
        onLoginSuccess={handleLoginSuccess} 
        onSwitchToRegister={() => setShowLogin(false)} 
      />
    } else {
      return <Register 
        onRegisterSuccess={() => setShowLogin(true)} 
        onSwitchToLogin={() => setShowLogin(true)} 
      />
    }
  }

  const handleSaveInputs = async () => {
    // For each schema, build CSV and save
    for (const s of schemas) {
      const csv = rowsToCSV(tables[s.id] || [], s)
      await saveCSVFile(`${s.id}_inputs.csv`, csv)
    }
  }

  const handleOptimize = async () => {
    setLoading(true)
    try {
      // Get System Recommendation data
      const systemRecId = 'machine_recommendation'
      const systemRecData = tables[systemRecId] || []
      
      // Get System Demand, Modules Demand, and Parts Demand data
      const systemsData = tables['systems'] || []
      const modulesData = tables['modules'] || []
      const partsData = tables['parts'] || []
      
      // Get Max Buy Back Bundle Valuation data to save as User Input2
      const maxBuybackId = 'max_buyback'
      const maxBuybackData = tables[maxBuybackId] || []
      
      // Extract margin data from Max Buy Back table
      const marginData: Record<string, number> = {}
      maxBuybackData.forEach((row: any) => {
        const metric = String(row.metric || '').toLowerCase()
        const margin = Number(row.required_margin || 0)
        if (metric.includes('refurbishment')) {
          marginData.refurbishment = margin
        } else if (metric.includes('module')) {
          marginData.harvestingModule = margin
        } else if (metric.includes('parts')) {
          marginData.harvestingParts = margin
        } else if (metric.includes('total')) {
          marginData.total = margin
        }
      })

      // Post to backend - Python will:
      // 1. Copy Base.xlsx to MasterDB.xlsx
      // 2. Save System Recommendation as User Input1 and Max Buy Back as User Input2
      // 3. Save Systems, Modules, Parts demand data to MasterDB.xlsx
      // 4. Run optimizer script
      // 5. Results saved to MasterDB.xlsx
      const response = await postCsvToBackend(systemRecData, marginData, maxBuybackData, systemsData, modulesData, partsData)
      
      if (response.status !== 'success') {
        throw new Error(response.message || 'Optimization failed')
      }

      console.log('Backend response:', response)
      console.log('outbase_data:', response.outbase_data)
      console.log('outprofit_data:', response.outprofit_data)

      // Update System Recommendation table with data from MasterDB.xlsx
      const currentRows = tables[systemRecId] || []
      
      // Update each row with data from User Input1 (green columns) and OutBase (yellow columns)
      const updatedRows = currentRows.map((row: any, idx: number) => {
        const userInput1Row = response.user_input1_data?.[idx]
        const outbaseRow = response.outbase_data?.[idx]
        
        const updatedRow = { ...row }
        
        // Update green columns from User Input1
        if (userInput1Row) {
          updatedRow.offered_bundle = userInput1Row['Offered Bundle'] ?? row.offered_bundle
          updatedRow.units_in_sales_pipeline = userInput1Row['Units in sales pipeline'] ?? row.units_in_sales_pipeline
          updatedRow.deal_outcome_probability = userInput1Row['Deal outcome probability'] ?? row.deal_outcome_probability
          updatedRow.required_margin = userInput1Row['Required margin (%)'] ?? row.required_margin
        }
        
        // Update yellow columns from OutBase (generated sheet: out_bb1, out_bb, etc.)
        if (outbaseRow) {
          updatedRow.recommended_from_other_inventory = outbaseRow['recommended from inventory'] || 0
          updatedRow.recommended_buy_12m = outbaseRow['Recommended Buy'] || 0
          updatedRow.recommended_bb_price_on_bundle = outbaseRow['Recommended BB Price'] || 0
        }
        
        return updatedRow
      })
      
      // Update the table with new data
      updateTableRows(systemRecId, updatedRows)

      // Update Max Buy Back Bundle Valuation table from OutProfit
      if (response.outprofit_data && response.user_input2_data) {
        const maxBuybackId = 'max_buyback'
        // Exclude any 'Total' metric rows entirely
        const filtered = response.outprofit_data.filter((row: any) => String(row.Metric || '').toLowerCase() !== 'total')
        const buybackRows = filtered.map((row: any, idx: number) => {
          const userInput2Row = response.user_input2_data[idx]
          return {
            id: `${idx}`,
            metric: row.Metric || '',
            valuation: row.Max_BBB_Valuation || 0,
            required_margin: userInput2Row?.['Required Margin'] || 0
          }
        })
        updateTableRows(maxBuybackId, buybackRows)
      }

      // Update Expected Profit on Bundle table from OutProfit
      if (response.outprofit_data) {
        const expectedProfitId = 'expected_profit'
        
        // The outprofit_data contains all rows from out_tot1 sheet
        // Filter to remove any rows without Metric or with invalid data
        const validRows = response.outprofit_data.filter((row: any) => {
          return row.Metric && row.Metric !== 'null' && row.Metric !== null
        })
        
        // Remove any 'Total' metric rows (user request)
        const filteredRows = validRows.filter((row: any) => String(row.Metric || '').toLowerCase().trim() !== 'total')
        
        const profitRows = filteredRows.map((row: any, idx: number) => {
          return {
            id: `${idx}`,
            metric: row.Metric || '',
            valuation: row.Profit || 0,
            margin: row.Margin_toGet || 0
          }
        })
        updateTableRows(expectedProfitId, profitRows)
      }

      // Show success message - results are saved to MasterDB.xlsx
      setSnack({ 
        open: true, 
        message: 'Optimization completed successfully! All tables updated with results from MasterDB.xlsx.' 
      })
    } catch (e: any) {
      console.error('Optimize failed', e)
      setSnack({ open: true, message: `Optimization failed: ${e.message}` })
    } finally {
      setLoading(false)
    }
  }

  const handleCellEdit = (tableId: string, rowId: string | number, field: string, value: any) => {
    updateRowCell(tableId, rowId, field, value)
  }

  const handleCloseSnack = () => setSnack({ open: false })

  return (
    <Container maxWidth="lg">
      <Box my={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <div style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Customer</div>
          <select style={{ 
            padding: '8px 12px', 
            fontSize: '14px', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            minWidth: '150px'
          }}>
            <option value="AA">AA</option>
            <option value="BB">BB</option>
            <option value="CC">CC</option>
          </select>
        </Box>
        <Box textAlign="center" flex={1}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
            <img src="/asml-logo.png" alt="ASML" style={{ height: '50px' }} />
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>Buy Back Optimiser</h1>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" gap={1}>
          {/* User Profile Menu */}
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="body2" color="textSecondary">
              {currentUser?.full_name || currentUser?.username}
            </Typography>
            <IconButton onClick={handleMenuOpen} color="primary">
              <AccountCircle fontSize="large" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  {currentUser?.email}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
          
          <Box display="flex" flexDirection="column" gap={1} padding={2} border="1px solid #ccc" borderRadius="4px">
            <Box display="flex" alignItems="center" gap={1}>
              <Box width="40px" height="20px" bgcolor="rgb(254, 209, 0)" />
              <span style={{ fontSize: '14px' }}>Results</span>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width="40px" height="20px" bgcolor="rgb(15, 35, 140)" />
              <span style={{ fontSize: '14px' }}>DB data</span>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box width="40px" height="20px" bgcolor="rgb(52, 178, 51)" />
              <span style={{ fontSize: '14px' }}>User captured data</span>
            </Box>
          </Box>
        </Box>
      </Box>

      <TableContainer 
        schemas={schemas} 
        tables={tables} 
        onCellEdit={handleCellEdit}
        onSaveInputs={handleSaveInputs}
        onOptimize={handleOptimize}
        loading={loading}
      />

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={handleCloseSnack}>
        <Alert severity="info" onClose={handleCloseSnack} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default App
