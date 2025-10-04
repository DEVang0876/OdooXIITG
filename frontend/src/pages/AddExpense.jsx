import React, { useState } from 'react'
import Store from '../services/mockStore'
import Auth from '../services/auth'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export default function AddExpense() {
  const user = Auth.getUser()
  const navigate = useNavigate()
  const [form, setForm] = useState({ desc: '', date: '', category: '', paidBy: 'Self', amount: '', remarks: '', email: user?.email })

  const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }))

  const saveDraft = () => {
    const item = Store.createExpense({ ...form })
    toast.success('Saved draft')
    navigate('/employee')
  }

  const submitExpense = () => {
    const item = Store.createExpense({ ...form })
    Store.submitExpense(item.id)
    toast.success('Submitted for approval')
    navigate('/employee')
  }

  return (
    <div className="page">
      <h2>Add Expense</h2>
      <form className="card form" onSubmit={(e)=>e.preventDefault()}>
        <label>Description</label>
        <input value={form.desc} onChange={(e) => onChange('desc', e.target.value)} />
        <label>Expense Date</label>
        <input type="date" value={form.date} onChange={(e) => onChange('date', e.target.value)} />
        <label>Category</label>
        <select value={form.category} onChange={(e) => onChange('category', e.target.value)}>
          <option value="">Select</option>
          <option>Travel</option>
          <option>Meals</option>
          <option>Office</option>
        </select>
        <label>Paid By</label>
        <select value={form.paidBy} onChange={(e) => onChange('paidBy', e.target.value)}>
          <option>Self</option>
          <option>Company</option>
        </select>
        <label>Amount</label>
        <input type="number" value={form.amount} onChange={(e) => onChange('amount', e.target.value)} />
        <label>Remarks</label>
        <textarea value={form.remarks} onChange={(e) => onChange('remarks', e.target.value)} />
        <label>Upload Receipt</label>
        <input type="file" />
        <div className="auth-actions">
          <button className="btn-secondary" type="button" onClick={saveDraft}>Save as Draft</button>
          <button className="btn-primary" type="button" onClick={submitExpense}>Submit</button>
        </div>
      </form>
    </div>
  )
}
