import React, { useState } from 'react'
import { Box, TextField, Button, Typography, Paper, Alert, Link, CircularProgress } from '@mui/material'
import { authApi } from '../utils/backend'

interface RegisterProps {
  onRegisterSuccess: () => void
  onSwitchToLogin: () => void
}

interface FieldErrors {
  username: string
  email: string
  password: string
  confirmPassword: string
  full_name: string
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    company: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: '',
      })
    }
  }

  const validateUsername = (username: string): string => {
    if (!username.trim()) return 'Username is required'
    if (username.length < 3) return 'Username must be at least 3 characters'
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens'
    }
    return ''
  }

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required'
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return 'Please enter a valid email address'
    return ''
  }

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required'
    if (password.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: '',
      full_name: '',
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    setFieldErrors(newErrors)

    return Object.values(newErrors).every((err) => err === '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        company: formData.company,
      }
      console.log('Register payload:', payload)
      
      const data = await authApi.register(payload)

      if (data.status === 'success') {
        setSuccess(true)
        setTimeout(() => {
          onRegisterSuccess()
        }, 2000)
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      console.error('Error response:', err?.response?.data)
      
      // Extract meaningful error message
      let errorMsg = 'Registration failed. Please try again.'
      
      if (err?.response?.data?.message) {
        errorMsg = err.response.data.message
      } else if (err?.response?.status === 409) {
        errorMsg = 'Username or email already exists. Please use a different one.'
      } else if (err?.response?.status === 400) {
        errorMsg = 'Invalid input. Please check your information.'
      } else if (err?.response?.status === 500) {
        errorMsg = 'Server error. Please contact support.'
      } else if (err?.message?.includes('timeout')) {
        errorMsg = 'Connection timeout. Please check your internet connection.'
      } else if (err?.message) {
        errorMsg = err.message
      }
      
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            Buy Back Optimizer
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Create Account
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={() => {
              const error = validateUsername(formData.username)
              if (error) {
                setFieldErrors({ ...fieldErrors, username: error })
              }
            }}
            margin="normal"
            required
            autoFocus
            error={!!fieldErrors.username}
            helperText={fieldErrors.username || 'Letters, numbers, underscores, hyphens (min 3 chars)'}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => {
              const error = validateEmail(formData.email)
              if (error) {
                setFieldErrors({ ...fieldErrors, email: error })
              }
            }}
            margin="normal"
            required
            error={!!fieldErrors.email}
            helperText={fieldErrors.email || 'example@domain.com'}
          />

          <TextField
            fullWidth
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            onBlur={() => {
              if (!formData.full_name.trim()) {
                setFieldErrors({ ...fieldErrors, full_name: 'Full name is required' })
              }
            }}
            margin="normal"
            required
            error={!!fieldErrors.full_name}
            helperText={fieldErrors.full_name}
          />

          <TextField
            fullWidth
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={() => {
              const error = validatePassword(formData.password)
              if (error) {
                setFieldErrors({ ...fieldErrors, password: error })
              }
            }}
            margin="normal"
            required
            error={!!fieldErrors.password}
            helperText={fieldErrors.password || 'At least 6 characters'}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={() => {
              if (formData.password !== formData.confirmPassword) {
                setFieldErrors({ ...fieldErrors, confirmPassword: 'Passwords do not match' })
              }
            }}
            margin="normal"
            required
            error={!!fieldErrors.confirmPassword}
            helperText={fieldErrors.confirmPassword}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Account created successfully! Redirecting to login...
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || success}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>
        </form>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault()
                onSwitchToLogin()
              }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default Register
