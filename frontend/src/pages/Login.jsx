import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Auth from '../services/auth'
import Store from '../services/mockStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    // Diagnostics: normalize and log email, check mockStore directly for debugging
    try {
      const normalized = (email||'').trim().toLowerCase()
      console.log('[Login] normalized email:', normalized)
      // direct inspection of mock store to help debug issues seen in the browser
      // importing here to avoid adding a permanent dependency at top-level test harness
      const Store = (await import('../services/mockStore')).default
      const found = Store.getUserByEmail(normalized)
      console.log('[Login] mockStore lookup:', found)

      const { user } = await Auth.login(email, password)
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'manager') navigate('/manager')
      else navigate('/employee')
    } catch (err) {
      // Provide more actionable feedback to the user and log full error
      console.error('[Login] login error', err)
      alert(err.message || 'Login failed - check console for details')
    }
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
          <button type="button" className="btn-secondary" onClick={async () => {
            try {
              const { user } = await Auth.login('admin@example.com', 'admin123')
              if (user.role === 'admin') navigate('/admin')
              else if (user.role === 'manager') navigate('/manager')
              else navigate('/employee')
            } catch (err) {
              alert(err.message || 'Demo login failed')
            }
          }}>Sign in as demo admin</button>
          <button type="button" className="btn-link" onClick={() => {
            Store.ensureDefaultData()
            // reload so any UI that reads localStorage picks up fresh data
            alert('Demo data reset — reload the page to continue')
            window.location.reload()
          }}>Reset demo data</button>
          <Link to="/forgot">Forgot?</Link>
        </div>
        <div className="muted">Don't have an account? <Link to="/signup">Sign up</Link></div>
      </form>
    </div>
  )
}
