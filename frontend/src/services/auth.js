import API from './api'

const Auth = {
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password })
    const { token, user } = response.data.data || response.data
    if (token) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    }
    return { token, user }
  },
  signup: async ({ name, email, password, role, department }) => {
    // Split name into firstName and lastName
    const [firstName, ...lastNameParts] = name.split(' ')
    const lastName = lastNameParts.join(' ') || ''
    const response = await API.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
      role: role || 'employee',
      department
    })
    return response.data
  },
  logout: async () => {
    try {
      await API.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  getUser: () => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  },
  isAuthenticated: () => !!localStorage.getItem('token'),
  forgotPassword: async (email) => {
    // Assuming there's a forgot password endpoint, adjust if different
    const response = await API.post('/auth/forgot-password', { email })
    return response.data
  },
  resetPassword: async (token, newPassword) => {
    const response = await API.post('/auth/reset-password', { token, password: newPassword })
    return response.data
  },
  verifyEmail: async ({ email, otp }) => {
    const response = await API.post('/auth/verify-email', { email, otp })
    return response.data
  },
  resendVerification: async (email) => {
    const response = await API.post('/auth/resend-otp', { email })
    return response.data
  }
}

export default Auth
