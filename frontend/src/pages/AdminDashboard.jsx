import React, { useEffect, useState } from 'react'
import Store from '../services/mockStore'
import { toast } from 'react-toastify'
import UserForm from '../components/UserForm'
import { Link } from 'react-router-dom'
import SearchFilter from '../components/SearchFilter'
import AnalyticsTiles from '../components/AnalyticsTiles'
import { exportToCsv } from '../utils/exportCsv'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  useEffect(()=>{ setUsers(Store.getUsers()) }, [])

  const remove = (id) => {
    try{
      Store.deleteUser(id)
      setUsers(Store.getUsers())
      toast.success('User deleted')
    }catch(err){ toast.error(err.message) }
  }

  const [editing, setEditing] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      <div style={{display:'flex',gap:10,marginBottom:12}}>
        <button className="btn-primary" onClick={()=>setShowCreate(s=>!s)}>{showCreate? 'Close':'Add User'}</button>
        <Link to="/admin/rules" className="btn-small">Manage Rules</Link>
        <Link to="/admin/settings" className="btn-small">System Settings</Link>
        <button className="btn-small" onClick={()=>exportToCsv('users.csv', Store.getUsers())}>Export CSV</button>
      </div>
      <AnalyticsTiles tiles={[{id:1,title:'Users',value:Store.getUsers().length,meta:'Total registered'},{id:2,title:'Pending Requests',value:Store.getExpenses().filter(e=>e.status==='Waiting').length,meta:'Waiting approvals'},{id:3,title:'Approved',value:Store.getExpenses().filter(e=>e.status==='Approved').length,meta:'Total approved'}]} />
      <SearchFilter onSearch={(q)=>{ const all = Store.getUsers(); setUsers(q? all.filter(u=>u.name.toLowerCase().includes(q.toLowerCase())||u.email.toLowerCase().includes(q.toLowerCase())||u.role.toLowerCase().includes(q.toLowerCase())):all) }} placeholder="Search users" />
      {showCreate && <UserForm onDone={()=>{ setShowCreate(false); setUsers(Store.getUsers()) }} />}
      {editing && <UserForm user={editing} onDone={()=>{ setEditing(null); setUsers(Store.getUsers()) }} />}
      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Role</th><th>Manager</th><th>Email</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.role}</td>
                <td>{u.manager}</td>
                <td>{u.email}</td>
                <td>
                  <button className="btn-small" onClick={()=>setEditing(u)}>Edit</button>
                  <button className="btn-small" onClick={() => remove(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
