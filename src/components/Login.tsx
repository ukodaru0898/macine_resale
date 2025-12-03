import React, { useState } from 'react'
import { Box, TextField, Button, Typography, Paper, Alert, Link, CircularProgress } from '@mui/material'
import { authApi } from '../utils/backend'

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void
  onSwitchToRegister: () => void
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await authApi.login({ usernameOrEmail: username, password })

      if (data.status === 'success') {
        // Store session token in localStorage
        localStorage.setItem('session_token', data.session_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLoginSuccess(data.user, data.session_token)
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err: any) {
      setError(err?.message || 'Network error. Please check backend URL.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            Buy Back Optimizer
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Sign In
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username or Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
            autoFocus
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </form>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault()
                onSwitchToRegister()
              }}
            >
              Create Account
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default Login
