import React, { useState } from 'react'

export default function ApprovalDetails() {
  const [note, setNote] = useState('')
  const approve = () => alert('Approved (mock)')
  const reject = () => alert('Rejected (mock)')
  return (
    <div className="page">
      <h2>Approval Details</h2>
      <div className="card">
        <p><b>ID:</b> EXP-002</p>
        <p><b>Employee:</b> Alice</p>
        <p><b>Amount:</b> $8.00</p>
        <label>Remarks</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="auth-actions">
          <button className="btn-secondary" onClick={reject}>Reject</button>
          <button className="btn-primary" onClick={approve}>Approve</button>
        </div>
      </div>
    </div>
  )
}
