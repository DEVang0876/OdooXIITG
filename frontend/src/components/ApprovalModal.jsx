import React, { useState } from 'react'

export default function ApprovalModal({ expense, onClose, onApprove, onReject }) {
  const [note, setNote] = useState('')
  if (!expense) return null

  const handleApprove = () => {
    if (onApprove) {
      onApprove(note)
      onClose()
    }
  }

  const handleReject = () => {
    if (onReject) {
      onReject(note || 'Rejected by manager')
      onClose()
    }
  }

  return (
    <div className="card">
      <h3>Approval - {expense._id || expense.id}</h3>
      <p><b>Employee:</b> {expense.user?.email || expense.email}</p>
      <p><b>Title:</b> {expense.title}</p>
      <p><b>Description:</b> {expense.description || expense.desc}</p>
      <p><b>Category:</b> {expense.category}</p>
      <p><b>Amount:</b> ${expense.amount}</p>
      <p><b>Date:</b> {new Date(expense.date || expense.createdAt).toLocaleDateString()}</p>
      {expense.receipt && <p><b>Receipt:</b> <a href={expense.receipt} target="_blank" rel="noopener noreferrer">View Receipt</a></p>}
      <label>Remarks</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional approval/rejection notes" />
      <div className="auth-actions">
        <button className="btn-secondary" onClick={handleReject}>Reject</button>
        <button className="btn-primary" onClick={handleApprove}>Approve</button>
        <button className="btn-small" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
