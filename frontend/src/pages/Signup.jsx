import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Auth from '../services/auth'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('employee')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !department) {
      setMessage('Please fill all required fields')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      await Auth.signup({ name, email, password, role, department })
      setMessage('Account created successfully! Please verify your email.')
      setMessageType('success')
      navigate('/verify-email', { state: { email } })
    } catch (error) {
      console.error('Signup error:', error)
      setMessage(error.response?.data?.message || error.message || 'Signup failed')
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
            <h2>Create account</h2>

            {message && (
              <div className={`message ${messageType}`}>
                {message}
              </div>
            )}

            <div>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

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

            <div>
              <label htmlFor="department">Department</label>
              <input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Enter your department"
                required
              />
            </div>

            <div>
              <label htmlFor="role">Role</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>

            <p className="signup-link">
              Already have an account? <Link to="/login">Sign in</Link>
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
