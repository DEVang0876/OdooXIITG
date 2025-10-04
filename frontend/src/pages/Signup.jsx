import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Auth from '../services/auth'
import { toast } from 'react-toastify'

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
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2>Create account</h2>
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
        <label>Full Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <label>Department</label>
        <input
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <div className="auth-actions">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </div>
        <div className="muted">Already have an account? <Link to="/login">Sign in</Link></div>
      </form>
    </div>
  )
}
