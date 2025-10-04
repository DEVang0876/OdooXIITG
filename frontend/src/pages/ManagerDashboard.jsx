import React, { useEffect, useState } from 'react'
import Store from '../services/mockStore'
import Auth from '../services/auth'
import { toast } from 'react-toastify'
import SearchFilter from '../components/SearchFilter'
import ApprovalModal from '../components/ApprovalModal'

export default function ManagerDashboard() {
  const user = Auth.getUser()
  const [pendings, setPendings] = useState([])
  useEffect(()=>{
    if (!user) return
    setPendings(Store.getPendingForApprover(user.name))
  }, [])
  const [filter, setFilter] = useState('')
  const filtered = pendings.filter(p => !filter || p.id.includes(filter) || (p.email||'').toLowerCase().includes(filter.toLowerCase()) || (p.category||'').toLowerCase().includes(filter.toLowerCase()))
  const [selected, setSelected] = useState(null)

  const approve = (id) => {
    try{
      Store.approveExpense(id, user.name, 'approve', 'OK')
      setPendings(Store.getPendingForApprover(user.name))
      toast.success('Approved')
    }catch(err){ toast.error(err.message) }
  }

  const reject = (id) => {
    try{
      Store.approveExpense(id, user.name, 'reject', 'Rejected')
      setPendings(Store.getPendingForApprover(user.name))
      toast.info('Rejected')
    }catch(err){ toast.error(err.message) }
  }

  return (
    <div className="page">
      <h2>Pending Approvals</h2>
      <SearchFilter onSearch={setFilter} placeholder="Filter by id, employee or category" />
      <div className="card">
        <table className="table">
          <thead><tr><th>ID</th><th>Employee</th><th>Category</th><th>Amount</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}><td>{p.id}</td><td>{p.email}</td><td>{p.category}</td><td>{p.amount}</td><td><button className="btn-small" onClick={()=>setSelected(p)}>View</button></td></tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={5} className="muted">No pending approvals</td></tr>}
          </tbody>
        </table>
      </div>
      {selected && <div style={{marginTop:12}}><ApprovalModal expense={selected} approver={user.name} onClose={()=>setSelected(null)} onUpdated={()=>setPendings(Store.getPendingForApprover(user.name))} /></div>}
    </div>
  )
}
