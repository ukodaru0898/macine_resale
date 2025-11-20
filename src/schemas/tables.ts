// System Recommendation Table
export const MACHINE_RECOMMENDATION_SCHEMA: TableSchema = {
  id: 'machine_recommendation',
  name: 'System Recommendation',
  sheetName: 'MachineRecommendation', // not used for import, will be filled programmatically
  columns: [
    { field: 'machine_type', headerName: 'Machine type', width: 180, color: 'blue' },
    { field: 'offered_bundle', headerName: 'Customer excess for sale', width: 120, color: 'green', type: 'number' },
    { field: 'units_in_sales_pipeline', headerName: 'Expected Buy Back', width: 130, color: 'green', type: 'number' },
    { field: 'units_in_qualified_inventory', headerName: 'Units in qualified inventory', width: 150, color: 'blue', type: 'number' },
    { field: 'recommended_from_other_inventory', headerName: 'Recommend from other inventory', width: 150, color: 'yellow', type: 'number' },
    { field: 'spacer1', headerName: '', width: 20, color: 'none' },
    { field: 'recommended_buy_12m', headerName: 'Recommend Buy for 12 M', width: 160, color: 'yellow', type: 'number' },
    { field: 'required_margin', headerName: 'Required margin (%)', width: 130, color: 'green', type: 'number' },
    { field: 'qtc_avg_bb_price', headerName: 'QTC average BB price', width: 160, color: 'blue', type: 'number' },
    { field: 'recommended_bb_price_on_bundle', headerName: 'Max Buy Back Bundle Valuation', width: 180, color: 'yellow', type: 'number' },
  ]
}

// Helper small schemas for Systems / Modules / Parts
const makeDemandSchema = (id: string, name: string, sheetName: string): TableSchema => ({
  id,
  name,
  sheetName,
  columns: [
    { field: 'item', headerName: 'Item', width: 280, color: 'blue' },
    { field: 'demand_12m', headerName: 'Demand 12M', width: 140, color: 'green', type: 'number' },
    { field: 'demand_24m', headerName: 'Demand 24M', width: 140, color: 'green', type: 'number' },
    { field: 'finished_12m', headerName: 'Finished Inventory 12M', width: 180, color: 'green', type: 'number' },
    { field: 'finished_24m', headerName: 'Finished Inventory 24M', width: 180, color: 'green', type: 'number' },
    { field: 'required_12m', headerName: 'Required 12M', width: 140, color: 'yellow', type: 'number', compute: (r: any) => {
      const d = Number(r['demand_12m'] || 0)
      const f = Number(r['finished_12m'] || 0)
      return Math.max(0, Math.round((d - f) * 100) / 100)
    }},
    { field: 'required_24m', headerName: 'Required 24M', width: 140, color: 'yellow', type: 'number', compute: (r: any) => {
      const d = Number(r['demand_24m'] || 0)
      const f = Number(r['finished_24m'] || 0)
      return Math.max(0, Math.round((d - f) * 100) / 100)
    }},
  ],
})

export const SYSTEMS_SCHEMA = makeDemandSchema('systems', 'System Demand', 'Systems')
export const MODULES_SCHEMA = makeDemandSchema('modules', 'Modules Demand', 'Modules')
export const PARTS_SCHEMA = makeDemandSchema('parts', 'Parts Demand', 'Parts')

// Adjust item header names to match sheets
SYSTEMS_SCHEMA.columns[0].headerName = 'System'
MODULES_SCHEMA.columns[0].headerName = 'Module'
PARTS_SCHEMA.columns[0].headerName = 'Part'

// Conversion Matrix table
export const CONVERSION_MATRIX_SCHEMA: TableSchema = {
  id: 'conversion_matrix',
  name: 'Conversion Matrix',
  sheetName: 'Conversion matrix ',
  columns: [
    { field: 'delta', headerName: 'Delta_{i,j}', width: 180, color: 'blue' },
    { field: '275d', headerName: '275D', width: 120, color: 'blue', type: 'number' },
    { field: '350c', headerName: '350C', width: 120, color: 'blue', type: 'number' },
    { field: '450f', headerName: '450F', width: 120, color: 'blue', type: 'number' },
    { field: '850f', headerName: '850F', width: 120, color: 'blue', type: 'number' },
    { field: '1150f', headerName: '1150F', width: 120, color: 'blue', type: 'number' },
  ],
}

// Max Buy Back Bundle Valuation table (from OutProfit, type='Buy Back')
export const MAX_BUYBACK_SCHEMA: TableSchema = {
  id: 'max_buyback',
  name: 'Max Buy Back Bundle Valuation (K)',
  sheetName: 'OutProfit',
  columns: [
    { field: 'valuation', headerName: 'Valuation', width: 140, color: 'yellow', type: 'number' },
    { field: 'required_margin', headerName: 'Required Margin (%)', width: 160, color: 'green', type: 'number' },
  ],
}

// Expected Profit on Bundle table (from OutProfit, type='Total')
export const EXPECTED_PROFIT_SCHEMA: TableSchema = {
  id: 'expected_profit',
  name: 'Expected Profit on Bundle',
  sheetName: 'OutProfit',
  columns: [
    { field: 'valuation', headerName: 'Profit', width: 200, color: 'yellow', type: 'number' },
    { field: 'margin', headerName: 'Margin (%)', width: 140, color: 'yellow', type: 'number' },
  ],
}

import { TableSchema } from '../types'

// Example table definitions - can be expanded to 6 tables
// Generalizable schema so you can add new columns by updating this file
export const TABLE_SCHEMAS: TableSchema[] = [
  {
    id: 'table1',
    name: 'Sales Table',
    sheetName: 'Sales',
    columns: [
      { field: 'id', headerName: 'ID', width: 80, color: 'blue' },
      { field: 'year', headerName: 'Year', width: 100, color: 'blue' },
      { field: 'product', headerName: 'Product', width: 160, color: 'blue' },
      { field: 'input_qty', headerName: 'Input Qty', width: 120, type: 'number', color: 'green' },
      { field: 'input_price', headerName: 'Input Price', width: 120, type: 'number', color: 'green' },
      {
        field: 'revenue',
        headerName: 'Revenue',
        width: 140,
        type: 'number',
        color: 'yellow',
        compute: (row: any) => {
          const q = Number(row['input_qty'] || 0)
          const p = Number(row['input_price'] || 0)
          return Math.round(q * p * 100) / 100
        },
      },
    ],
  },
  {
    id: 'table2',
    name: 'Costs Table',
    sheetName: 'Costs',
    columns: [
      { field: 'id', headerName: 'ID', width: 80, color: 'blue' },
      { field: 'component', headerName: 'Component', width: 160, color: 'blue' },
      { field: 'base_cost', headerName: 'Base Cost', width: 120, color: 'blue' },
      { field: 'adjustment', headerName: 'Adjustment', width: 120, color: 'green', type: 'number' },
      { field: 'total_cost', headerName: 'Total Cost', width: 140, type: 'number', color: 'yellow', compute: (row: any) => (Number(row['base_cost'] || 0) + Number(row['adjustment'] || 0)) },
    ],
  },
  // Add more schemas for 4 more tables below - keep the same pattern
  {
    id: 'table3',
    name: 'Availability Table',
    sheetName: 'Availability',
    columns: [
      { field: 'id', headerName: 'ID', width: 80, color: 'blue' },
      { field: 'location', headerName: 'Location', width: 160, color: 'blue' },
      { field: 'available', headerName: 'Available', width: 120, color: 'green', type: 'number' },
      { field: 'gap', headerName: 'Gap', width: 120, color: 'yellow', type: 'number', compute: (r: any) => Math.max(0, 100 - Number(r.available || 0)) },
    ],
  },
  {
    id: 'table4',
    name: 'Maintenance',
    sheetName: 'Maintenance',
    columns: [
      { field: 'id', headerName: 'ID', width: 80, color: 'blue' },
      { field: 'mach', headerName: 'Machine', width: 160, color: 'blue' },
      { field: 'last_service', headerName: 'Last Service', width: 120, color: 'blue' },
      { field: 'service_interval', headerName: 'Service Interval (days)', width: 160, color: 'green', type: 'number' },
      { field: 'days_to_service', headerName: 'Days to Service', width: 160, type: 'number', color: 'yellow', compute: (r: any) => Math.max(0, Number(r.service_interval || 0) - 30) },
    ],
  },
  // Two more placeholder tables
  {
    id: 'table5',
    name: 'Logistics',
    sheetName: 'Logistics',
    columns: [
      { field: 'id', headerName: 'ID', width: 80, color: 'blue' },
      { field: 'route', headerName: 'Route', width: 160, color: 'blue' },
      { field: 'vehicle_count', headerName: 'Vehicle Count', width: 160, color: 'green', type: 'number' },
      { field: 'capacity', headerName: 'Capacity', width: 160, type: 'number', color: 'yellow', compute: (r: any) => Number(r.vehicle_count || 0) * 100 },
    ],
  },
  {
    id: 'table6',
    name: 'Quality',
    sheetName: 'Quality',
    columns: [
      { field: 'id', headerName: 'ID', width: 80, color: 'blue' },
      { field: 'measure', headerName: 'Measure', width: 160, color: 'blue' },
      { field: 'passed', headerName: 'Passed', width: 160, color: 'green', type: 'number' },
      { field: 'tested', headerName: 'Tested', width: 160, color: 'green', type: 'number' },
      { field: 'pass_rate', headerName: 'Pass Rate', width: 160, color: 'yellow', type: 'number', compute: (r: any) => {
        const tested = Number(r.tested || 0)
        if (!tested) return 0
        return Math.round((Number(r.passed || 0) / tested) * 10000) / 100
      } },
    ],
  },
]

// Export all active schemas: recommendation + systems/modules/parts + conversion matrix + buyback/profit
export const ALL_SCHEMAS: TableSchema[] = [
  MACHINE_RECOMMENDATION_SCHEMA,
  MAX_BUYBACK_SCHEMA,
  EXPECTED_PROFIT_SCHEMA,
  SYSTEMS_SCHEMA,
  MODULES_SCHEMA,
  PARTS_SCHEMA,
  CONVERSION_MATRIX_SCHEMA,
]
