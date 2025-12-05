import React, { useState } from 'react'
import { Box, TextField, Button, Typography, Paper, Alert, Link, CircularProgress, FormHelperText } from '@mui/material'
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
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const validateForm = (): boolean => {
    let isValid = true
    setUsernameError('')
    setPasswordError('')

    if (!username.trim()) {
      setUsernameError('Username or email is required')
      isValid = false
    }

    if (!password) {
      setPasswordError('Password is required')
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

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
      // Extract meaningful error message from different error sources
      let errorMessage = 'Network error. Please try again.'
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err?.response?.status === 401) {
        errorMessage = 'Invalid username or password'
      } else if (err?.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.'
      } else if (err?.response?.status === 500) {
        errorMessage = 'Server error. Please contact support.'
      } else if (err?.message?.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection.'
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        backgroundImage: 'url(/login-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', position: 'relative', zIndex: 2 }}>
        <Box textAlign="center" mb={3}>
          <Box mb={2}>
            <img src="/asml-logo.png" alt="ASML Logo" style={{ height: 80, width: 'auto' }} />
          </Box>
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
            onChange={(e) => {
              setUsername(e.target.value)
              setUsernameError('')
            }}
            onBlur={() => {
              if (!username.trim()) {
                setUsernameError('Username or email is required')
              }
            }}
            margin="normal"
            required
            autoFocus
            error={!!usernameError}
            helperText={usernameError}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setPasswordError('')
            }}
            onBlur={() => {
              if (!password) {
                setPasswordError('Password is required')
              }
            }}
            margin="normal"
            required
            error={!!passwordError}
            helperText={passwordError}
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
          {/* Optional ASML SSO login button if runtime/build env provides URL */}
          <Button
            fullWidth
            variant="outlined"
            size="large"
            sx={{ mb: 2 }}
            onClick={() => {
              const ssoUrl = (window as any)?.ENV?.VITE_ASML_SSO_URL || import.meta.env.VITE_ASML_SSO_URL
              if (ssoUrl) {
                window.location.href = ssoUrl
              } else {
                alert('ASML login is not configured.')
              }
            }}
          >
            ASML Login
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
