import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Auth from '../services/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    const { user } = await Auth.login(email, password)
    if (user.role === 'admin') navigate('/admin')
    else if (user.role === 'manager') navigate('/manager')
    else navigate('/employee')
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2>Sign in</h2>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="auth-actions">
          <button className="btn-primary" type="submit">Login</button>
          <Link to="/forgot">Forgot?</Link>
        </div>
        <div className="muted">Don't have an account? <Link to="/signup">Sign up</Link></div>
      </form>
    </div>
  )
}
