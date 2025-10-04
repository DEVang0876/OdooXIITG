import React, { useEffect, useState } from 'react'
import Store from '../services/mockStore'
import { toast } from 'react-toastify'
import Modal from './Modal'

function isValidEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

export default function UserForm({ user: initial, onDone }){
  const [user, setUser] = useState(initial || { name:'', email:'', password:'', role:'employee', manager:'' })
  const [errors, setErrors] = useState({})
  useEffect(()=> setUser(initial || { name:'', email:'', password:'', role:'employee', manager:'' }), [initial])

  const validate = () => {
    const e = {}
    if (!user.name) e.name = 'Name required'
    if (!user.email || !isValidEmail(user.email)) e.email = 'Valid email required'
    if (!user.id && (!user.password || user.password.length < 6)) e.password = 'Password min 6 chars'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = () => {
    if (!validate()) return
    try{
      if (user.id) {
        Store.updateUser(user.id, user)
        toast.success('User updated')
      } else {
        Store.createUser(user)
        toast.success('User created')
      }
      onDone()
    }catch(err){ toast.error(err.message) }
  }

  return (
    <Modal onClose={onDone} title={user.id ? 'Edit User' : 'Add User'}>
      <div>
        <label>Name</label>
        <input value={user.name} onChange={(e)=>setUser({...user, name:e.target.value})} />
        {errors.name && <div className="muted" style={{color:'red'}}>{errors.name}</div>}
        <label>Email</label>
        <input value={user.email} onChange={(e)=>setUser({...user, email:e.target.value})} />
        {errors.email && <div className="muted" style={{color:'red'}}>{errors.email}</div>}
        <label>Password</label>
        <input type="password" value={user.password} onChange={(e)=>setUser({...user, password:e.target.value})} />
        {errors.password && <div className="muted" style={{color:'red'}}>{errors.password}</div>}
        <label>Role</label>
        <select value={user.role} onChange={(e)=>setUser({...user, role:e.target.value})}>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <label>Manager</label>
        <input value={user.manager} onChange={(e)=>setUser({...user, manager:e.target.value})} />
        <div className="auth-actions"><button className="btn-primary" onClick={save}>{user.id ? 'Save' : 'Create'}</button><button className="btn-secondary" onClick={onDone}>Cancel</button></div>
      </div>
    </Modal>
  )
}
