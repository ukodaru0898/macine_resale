import React from 'react'
import { Box, Typography } from '@mui/material'

export const Legend = () => {
  return (
    <Box display="flex" gap={2} alignItems="center" padding={2}>
      <Box display="flex" gap={1} alignItems="center">
        <Box width={16} height={16} bgcolor="#D9EFFF" borderRadius={2} />
        <Typography>Blue: Read-only</Typography>
      </Box>

      <Box display="flex" gap={1} alignItems="center">
        <Box width={16} height={16} bgcolor="#D9FFD9" borderRadius={2} />
        <Typography>Green: Editable</Typography>
      </Box>

      <Box display="flex" gap={1} alignItems="center">
        <Box width={16} height={16} bgcolor="#FFF7BF" borderRadius={2} />
        <Typography>Yellow: Computed</Typography>
      </Box>
    </Box>
  )
}

export default Legend
