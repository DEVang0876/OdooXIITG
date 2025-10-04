import React from 'react'
import { NavLink } from 'react-router-dom'
import Auth from '../services/auth'

export default function Sidebar() {
  const user = Auth.getUser()
  const role = user?.role
  return (
    <aside className="sidebar">
      <nav>
        <NavLink to="/">Home</NavLink>
        {role === 'admin' && (
          <>
            <NavLink to="/admin">Admin Dashboard</NavLink>
            <NavLink to="/admin/rules">Approval Rules</NavLink>
          </>
        )}
        {role === 'employee' && (
          <>
            <NavLink to="/employee">My Expenses</NavLink>
            <NavLink to="/employee/add">Add Expense</NavLink>
          </>
        )}
        {role === 'manager' && (
          <>
            <NavLink to="/manager">Approvals</NavLink>
          </>
        )}
      </nav>
    </aside>
  )
}
