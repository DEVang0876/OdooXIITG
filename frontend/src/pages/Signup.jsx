import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Auth from '../services/auth'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('employee')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await Auth.signup({ name, email, password, role })
      navigate('/login')
    } catch {
      // ignore for now
      navigate('/login')
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2>Create account</h2>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <div className="auth-actions">
          <button className="btn-primary" type="submit">Sign up</button>
        </div>
      </form>
    </div>
  )
}
