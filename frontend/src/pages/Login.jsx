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
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2>Sign in</h2>
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="auth-actions">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
          <Link to="/forgot">Forgot password?</Link>
        </div>
        <div className="muted">Don't have an account? <Link to="/signup">Sign up</Link></div>
      </form>
    </div>
  )
}
