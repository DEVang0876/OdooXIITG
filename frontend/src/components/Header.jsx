import React from 'react'
import Auth from '../services/auth'

export default function Header() {
  const user = Auth.getUser()
  const handleLogout = () => {
    Auth.logout()
    window.location.href = '/login'
  }
  return (
    <header className="app-header">
      <div className="brand">Expense Manager</div>
      <div className="header-right">
        <div className="user">{user?.name || 'Guest'}</div>
        <button className="btn-link" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  )
}
