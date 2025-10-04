import React, { useEffect, useState } from 'react'
import Store from '../services/mockStore'
import Auth from '../services/auth'
import SearchFilter from '../components/SearchFilter'
import ApprovalTimeline from '../components/ApprovalTimeline'
import AnalyticsTiles from '../components/AnalyticsTiles'
import { exportToCsv } from '../utils/exportCsv'

export default function EmployeeDashboard() {
  const user = Auth.getUser()
  const [expenses, setExpenses] = useState([])
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(null)
  useEffect(()=>{
    const all = Store.getExpenses()
    setExpenses(all.filter(e=>e.email===user?.email))
  }, [])

  const filtered = expenses.filter(e => !filter || e.id.includes(filter) || (e.desc||'').toLowerCase().includes(filter.toLowerCase()) || (e.category||'').toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="page">
      <h2>My Expenses</h2>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <AnalyticsTiles tiles={[{id:1,title:'Submitted',value:expenses.length,meta:'Total submitted'},{id:2,title:'Approved',value:expenses.filter(e=>e.status==='Approved').length,meta:'Approved'},{id:3,title:'Pending',value:expenses.filter(e=>e.status==='Waiting').length,meta:'Waiting'}]} />
        <div>
          <button className="btn-small" onClick={()=>exportToCsv('expenses.csv', expenses)}>Export CSV</button>
        </div>
      </div>
      <SearchFilter onSearch={setFilter} placeholder="Filter by id, description or category" />
      <div className="card">
        <table className="table">
          <thead><tr><th>ID</th><th>Description</th><th>Date</th><th>Category</th><th>Paid By</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((e) => (
              <React.Fragment key={e.id}>
                <tr><td>{e.id}</td><td>{e.desc}</td><td>{new Date(e.createdAt).toLocaleDateString()}</td><td>{e.category}</td><td>{e.paidBy}</td><td>{e.amount}</td><td>{e.status} <button className="btn-small" onClick={()=>setExpanded(expanded===e.id?null:e.id)}>{expanded===e.id? 'Hide':'Timeline'}</button></td></tr>
                {expanded===e.id && <tr><td colSpan={7}><ApprovalTimeline approvals={e.approvals} /></td></tr>}
              </React.Fragment>
            ))}
            {expenses.length===0 && <tr><td colSpan={7} className="muted">No expenses yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
