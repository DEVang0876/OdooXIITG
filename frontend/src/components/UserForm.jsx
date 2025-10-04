import React, { useEffect, useState } from 'react'
import API from '../services/api'
import { toast } from 'react-toastify'
import Modal from './Modal'

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

export default function UserForm({ user: initial, onDone }) {
  const [user, setUser] = useState(initial || { firstName: '', lastName: '', email: '', password: '', role: 'employee', manager: '' })
  const [managers, setManagers] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUser(initial || { firstName: '', lastName: '', email: '', password: '', role: 'employee', manager: '' })
    fetchManagers()
  }, [initial])

  const fetchManagers = async () => {
    try {
      const response = await API.get('/users?role=manager')
      setManagers(response.data.data || response.data)
    } catch (error) {
      console.error('Fetch managers error:', error)
    }
  }

  const validate = () => {
    const e = {}
    if (!user.firstName?.trim()) e.firstName = 'First name required'
    if (!user.lastName?.trim()) e.lastName = 'Last name required'
    if (!user.email || !isValidEmail(user.email)) e.email = 'Valid email required'
    if (!user._id && (!user.password || user.password.length < 6)) e.password = 'Password min 6 chars'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const userData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        manager: user.manager || undefined
      }

      if (!user._id) {
        userData.password = user.password
        await API.post('/users', userData)
        toast.success('User created successfully')
      } else {
        await API.put(`/users/${user._id}`, userData)
        toast.success('User updated successfully')
      }
      onDone()
    } catch (error) {
      console.error('Save user error:', error)
      toast.error(error.response?.data?.message || 'Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onDone} title={user._id ? 'Edit User' : 'Add User'}>
      <div>
        <label>First Name</label>
        <input value={user.firstName || ''} onChange={(e) => setUser({ ...user, firstName: e.target.value })} />
        {errors.firstName && <div className="muted" style={{ color: 'red' }}>{errors.firstName}</div>}

        <label>Last Name</label>
        <input value={user.lastName || ''} onChange={(e) => setUser({ ...user, lastName: e.target.value })} />
        {errors.lastName && <div className="muted" style={{ color: 'red' }}>{errors.lastName}</div>}

        <label>Email</label>
        <input value={user.email || ''} onChange={(e) => setUser({ ...user, email: e.target.value })} />
        {errors.email && <div className="muted" style={{ color: 'red' }}>{errors.email}</div>}

        {!user._id && (
          <>
            <label>Password</label>
            <input type="password" value={user.password || ''} onChange={(e) => setUser({ ...user, password: e.target.value })} />
            {errors.password && <div className="muted" style={{ color: 'red' }}>{errors.password}</div>}
          </>
        )}

        <label>Role</label>
        <select value={user.role || 'employee'} onChange={(e) => setUser({ ...user, role: e.target.value })}>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>

        <label>Manager</label>
        <select value={user.manager || ''} onChange={(e) => setUser({ ...user, manager: e.target.value })}>
          <option value="">No Manager</option>
          {managers.map(m => (
            <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
          ))}
        </select>

        <div className="auth-actions">
          <button className="btn-primary" onClick={save} disabled={loading}>
            {loading ? 'Saving...' : (user._id ? 'Save' : 'Create')}
          </button>
          <button className="btn-secondary" onClick={onDone} disabled={loading}>Cancel</button>
        </div>
      </div>
    </Modal>
  )
}
