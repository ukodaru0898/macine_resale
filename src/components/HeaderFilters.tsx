import React from 'react'
import { Box, TextField, MenuItem, Button } from '@mui/material'

interface Props {
  program?: string
  product?: string
  model?: string
  onChange: (filters: { program?: string; product?: string; model?: string }) => void
  onLoadExcel?: (f: File) => void
}

export const HeaderFilters: React.FC<Props> = ({ onChange, onLoadExcel }) => {
  return (
    <Box display="flex" gap={2} alignItems="center" padding={2}>
      <TextField label="Program" size="small" onChange={(e) => onChange({ program: e.target.value })} />
      <TextField label="Product" size="small" onChange={(e) => onChange({ product: e.target.value })} />
      <TextField label="Model" size="small" onChange={(e) => onChange({ model: e.target.value })} />

      <Button variant="outlined" component="label">
        Load Base.xlsx
        <input
          type="file"
          hidden
          accept=".xlsx, .xls"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f && onLoadExcel) onLoadExcel(f)
          }}
        />
      </Button>
      <Button variant="outlined" onClick={async () => {
        // Try to fetch sample_data/Base.xlsx from server root (dev server will serve the file)
        try {
          const resp = await fetch('/sample_data/Base.xlsx')
          if (!resp.ok) return
          const buffer = await resp.arrayBuffer()
          const file = new File([buffer], 'Base.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          if (file && onLoadExcel) onLoadExcel(file)
        } catch (e) {
          console.error('Failed to load demo base:', e)
        }
      }}>
        Load Demo
      </Button>
    </Box>
  )
}

export default HeaderFilters
