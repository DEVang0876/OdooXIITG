import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Auth from '../services/auth'
import { toast } from 'react-toastify'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setMessage('Please enter email and password')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const { user } = await Auth.login(email, password)
      setMessage('Login successful')
      setMessageType('success')

      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'manager') navigate('/manager')
      else navigate('/employee')
    } catch (err) {
      console.error('Login error:', err)
      setMessage(err.response?.data?.message || err.message || 'Login failed')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <h1>Expense Manager</h1>
        <nav>
          <Link to="/login" className="btn-secondary">Login</Link>
          <Link to="/signup" className="btn-primary">Sign Up</Link>
        </nav>
      </header>

      <main className="login-main">
        <div className="login-container">
          <form onSubmit={submit}>
            <h2>Sign in</h2>

            {message && (
              <div className={`message ${messageType}`}>
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
              <Link to="/forgot">Forgot password?</Link>
            </div>

            <p className="signup-link">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </form>
        </div>

        <div className="right-panel">
          {/* Right content area - intentionally empty for clean design */}
        </div>
      </main>
    </div>
  )
}
