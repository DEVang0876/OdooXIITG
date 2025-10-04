import React, { useEffect, useState } from 'react'
import API from '../services/api'
import { toast } from 'react-toastify'
import UserForm from '../components/UserForm'
import { Link } from 'react-router-dom'
import SearchFilter from '../components/SearchFilter'
import AnalyticsTiles from '../components/AnalyticsTiles'
import { exportToCsv } from '../utils/exportCsv'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersResponse, analyticsResponse] = await Promise.all([
        API.get('/users'),
        API.get('/analytics/dashboard')
      ])
      setUsers(usersResponse.data.data || usersResponse.data)
      setAnalytics(analyticsResponse.data.data)
    } catch (error) {
      console.error('Fetch data error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    try {
      await API.delete(`/users/${id}`)
      toast.success('User deleted successfully')
      fetchData() // Refresh data
    } catch (error) {
      console.error('Delete user error:', error)
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const filteredUsers = users.filter(u =>
    !filter ||
    u.firstName?.toLowerCase().includes(filter.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(filter.toLowerCase()) ||
    u.email?.toLowerCase().includes(filter.toLowerCase()) ||
    u.role?.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading) {
    return <div className="page"><h2>Loading...</h2></div>
  }

  const overview = analytics?.overview || {}

  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <button className="btn-primary" onClick={() => setShowCreate(s => !s)}>{showCreate ? 'Close' : 'Add User'}</button>
        <Link to="/admin/rules" className="btn-small">Manage Rules</Link>
        <Link to="/admin/settings" className="btn-small">System Settings</Link>
        <button className="btn-small" onClick={() => exportToCsv('users.csv', users)}>Export CSV</button>
      </div>
      <AnalyticsTiles tiles={[
        { id: 1, title: 'Users', value: users.length, meta: 'Total registered' },
        { id: 2, title: 'Pending', value: overview.pendingCount || 0, meta: 'Pending approvals' },
        { id: 3, title: 'Approved', value: overview.approvedCount || 0, meta: 'Total approved' },
        { id: 4, title: 'Total Expenses', value: overview.totalExpenses || 0, meta: 'All expenses' }
      ]} />
      <SearchFilter onSearch={setFilter} placeholder="Search users by name, email or role" />
      {showCreate && <UserForm onDone={() => { setShowCreate(false); fetchData() }} />}
      {editing && <UserForm user={editing} onDone={() => { setEditing(null); fetchData() }} />}
      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Role</th><th>Manager</th><th>Email</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id}>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.role}</td>
                <td>{u.manager ? `${u.manager.firstName} ${u.manager.lastName}` : 'None'}</td>
                <td>{u.email}</td>
                <td>{u.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button className="btn-small" onClick={() => setEditing(u)}>Edit</button>
                  <button className="btn-small btn-danger" onClick={() => remove(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
