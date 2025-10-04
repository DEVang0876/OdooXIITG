import API from './api'
import Store from './mockStore'

const Auth = {
  login: async (email, password) => {
    // Local mock auth using mockStore
    const user = Store.getUserByEmail(email)
    if (!user) throw new Error('User not found')
    if (user.password !== password) throw new Error('Invalid credentials')
    const token = `mock-token-${user.id}`
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role, manager: user.manager }))
    return { token, user }
  },
  signup: async ({ name, email, password, role, manager }) => {
    const user = Store.createUser({ name, email, password, role, manager })
    return user
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  getUser: () => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  },
  isAuthenticated: () => !!localStorage.getItem('token'),
  forgotPassword: async (email) => {
    const user = Store.getUserByEmail(email)
    if (!user) throw new Error('User not found')
    const token = Store.createResetToken(email)
    // In real app we'd email the token; here we return it for dev
    return token
  },
  resetPassword: async (token, newPassword) => {
    return Store.resetPassword(token, newPassword)
  }
}

export default Auth
