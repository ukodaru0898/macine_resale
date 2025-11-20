const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

// Sample data to populate Base.xlsx (only include blue columns or those expected in sheet)
const salesSheet = [
  { ID: 1, Year: 2024, Product: 'Widget A' },
  { ID: 2, Year: 2024, Product: 'Widget B' },
]

const costsSheet = [
  { ID: 1, Component: 'Motor', 'Base Cost': 1200 },
  { ID: 2, Component: 'Electronics', 'Base Cost': 450 },
]

const availabilitySheet = [
  { ID: 1, Location: 'Plant 1' },
  { ID: 2, Location: 'Plant 2' },
]

const maintenanceSheet = [
  { ID: 1, Machine: 'M-100', 'Last Service': '2024-06-30' },
  { ID: 2, Machine: 'M-200', 'Last Service': '2024-07-15' },
]

const logisticsSheet = [
  { ID: 1, Route: 'R1' },
  { ID: 2, Route: 'R2' },
]

const qualitySheet = [
  { ID: 1, Measure: 'Mold Tolerance' },
  { ID: 2, Measure: 'Finish Quality' },
]


// Add coreQInventery!A6:A12 (7 rows, 1 col)
const coreQInventerySheet = [
  {}, {}, {}, {}, {}, // rows 1-5 empty
  { 'Machine type': 'Type A' },
  { 'Machine type': 'Type B' },
  { 'Machine type': 'Type C' },
  { 'Machine type': 'Type D' },
  { 'Machine type': 'Type E' },
  { 'Machine type': 'Type F' },
  { 'Machine type': 'Type G' },
]

// Add outBase!B2:B8, C2:C8, D2:D8, E2:E8 (7 rows, cols B-E)
const outBaseSheet = [
  {}, // row 1 empty
  { 'QTC average BB price': 100, 'Units in qualified inventory': 10, 'Recommended from other inventory': 2, 'Recommended BB Price on Bundle': 105 },
  { 'QTC average BB price': 110, 'Units in qualified inventory': 12, 'Recommended from other inventory': 3, 'Recommended BB Price on Bundle': 115 },
  { 'QTC average BB price': 120, 'Units in qualified inventory': 14, 'Recommended from other inventory': 4, 'Recommended BB Price on Bundle': 125 },
  { 'QTC average BB price': 130, 'Units in qualified inventory': 16, 'Recommended from other inventory': 5, 'Recommended BB Price on Bundle': 135 },
  { 'QTC average BB price': 140, 'Units in qualified inventory': 18, 'Recommended from other inventory': 6, 'Recommended BB Price on Bundle': 145 },
  { 'QTC average BB price': 150, 'Units in qualified inventory': 20, 'Recommended from other inventory': 7, 'Recommended BB Price on Bundle': 155 },
  { 'QTC average BB price': 160, 'Units in qualified inventory': 22, 'Recommended from other inventory': 8, 'Recommended BB Price on Bundle': 165 },
]

const workbook = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(salesSheet), 'Sales')
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(costsSheet), 'Costs')
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(availabilitySheet), 'Availability')
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(maintenanceSheet), 'Maintenance')
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(logisticsSheet), 'Logistics')
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(qualitySheet), 'Quality')
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(coreQInventerySheet), 'coreQInventery')
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(outBaseSheet), 'outBase')

// Add Systems, Modules, Parts sheets for demand tables
const systemsSheet = [
  { ' System': '275D', Demand_12M: 5, Demand_24M: 12, Qinventory_12M: 1, Qinventory_24M: 3 },
  { ' System': '350C', Demand_12M: 3, Demand_24M: 8, Qinventory_12M: 2, Qinventory_24M: 4 },
  { ' System': '400A', Demand_12M: 7, Demand_24M: 15, Qinventory_12M: 3, Qinventory_24M: 6 },
]

const modulesSheet = [
  { Module: 'MOD-100', System: '275D', Demand_12M: 10, Demand_24M: 20, Qinventory_12M: 5, Qinventory_24M: 10 },
  { Module: 'MOD-200', System: '350C', Demand_12M: 8, Demand_24M: 18, Qinventory_12M: 4, Qinventory_24M: 8 },
  { Module: 'MOD-300', System: '400A', Demand_12M: 12, Demand_24M: 25, Qinventory_12M: 6, Qinventory_24M: 12 },
]

const partsSheet = [
  { Module: 'PART-A1', System: '275D', Module_1: 'MOD-100', Demand_12M: 15, Demand_24M: 30, Qinventory_12M: 8, Qinventory_24M: 15 },
  { Module: 'PART-B2', System: '350C', Module_1: 'MOD-200', Demand_12M: 12, Demand_24M: 28, Qinventory_12M: 6, Qinventory_24M: 12 },
  { Module: 'PART-C3', System: '400A', Module_1: 'MOD-300', Demand_12M: 18, Demand_24M: 35, Qinventory_12M: 9, Qinventory_24M: 18 },
]

XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(systemsSheet), 'Systems')
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(modulesSheet), 'Modules')
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(partsSheet), 'Parts')

const outDir = path.join(__dirname, '..', 'public', 'sample_data')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)

const outPath = path.join(outDir, 'Base.xlsx')
XLSX.writeFile(workbook, outPath)
console.log('Wrote sample Base.xlsx to:', outPath)
