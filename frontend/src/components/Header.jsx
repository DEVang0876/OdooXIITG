import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Auth from '../services/auth'

export default function Header() {
  const user = Auth.getUser()
  const navigate = useNavigate()

  const handleLogout = () => {
    Auth.logout()
    navigate('/login')
  }

  const getDashboardPath = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'admin': return '/admin'
      case 'manager': return '/manager'
      case 'employee': return '/employee'
      default: return '/'
    }
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to={getDashboardPath()} className="brand">
          Expense Manager
        </Link>
        <nav className="nav-links">
          {user && (
            <>
              <Link to={getDashboardPath()} className="nav-link">Dashboard</Link>
              {user.role === 'employee' && (
                <Link to="/employee/add" className="nav-link">Add Expense</Link>
              )}
              {user.role === 'manager' && (
                <Link to="/manager" className="nav-link">Approvals</Link>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className="nav-link">Admin</Link>
                  <Link to="/admin/rules" className="nav-link">Rules</Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
      <div className="header-right">
        {user ? (
          <>
            <div className="user-info">
              <span className="user-name">{user.firstName} {user.lastName}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button className="btn-link" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  )
}
