import React, { useState } from 'react'
import Store from '../services/mockStore'
import { toast } from 'react-toastify'

export default function ApprovalModal({ expense, approver, onClose, onUpdated }){
  const [note, setNote] = useState('')
  if (!expense) return null
  const approve = ()=>{
    try{ Store.approveExpense(expense.id, approver, 'approve', note); toast.success('Approved'); onUpdated(); onClose() }catch(e){ toast.error(e.message) }
  }
  const reject = ()=>{
    try{ Store.approveExpense(expense.id, approver, 'reject', note); toast.info('Rejected'); onUpdated(); onClose() }catch(e){ toast.error(e.message) }
  }
  return (
    <div className="card">
      <h3>Approval - {expense.id}</h3>
      <p><b>Employee:</b> {expense.email}</p>
      <p><b>Desc:</b> {expense.desc}</p>
      <p><b>Amount:</b> {expense.amount}</p>
      <label>Remarks</label>
      <textarea value={note} onChange={(e)=>setNote(e.target.value)} />
      <div className="auth-actions"><button className="btn-secondary" onClick={reject}>Reject</button><button className="btn-primary" onClick={approve}>Approve</button><button className="btn-small" onClick={onClose}>Close</button></div>
    </div>
  )
}
