import React, { useState, useEffect } from 'react'
import API from '../services/api'
import Auth from '../services/auth'
import { useNavigate } from 'react-router-dom'
import ExpenseUploadForm from '../components/ExpenseUploadForm'

export default function AddExpense() {
  const user = Auth.getUser()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', date: '', category: '', amount: '', description: '', receipt: null })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories')
      setCategories(response.data.data || response.data)
    } catch (error) {
      console.error('Fetch categories error:', error)
      // Fallback to hardcoded categories
      setCategories([
        { _id: 'travel', name: 'Travel' },
        { _id: 'meals', name: 'Meals' },
        { _id: 'office', name: 'Office' },
        { _id: 'other', name: 'Other' }
      ])
    }
  }

  const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }))

  const handleFileChange = (e) => {
    setForm((s) => ({ ...s, receipt: e.target.files[0] }))
  }

  const submitExpense = async () => {
    if (!form.title || !form.amount || !form.category || !form.date) {
      setMessage('Please fill all required fields')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('amount', parseFloat(form.amount))
      formData.append('category', form.category)
      formData.append('description', form.description || '')
      formData.append('date', form.date)
      if (form.receipt) {
        formData.append('receipts', form.receipt)
      }

      await API.post('/expenses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setMessage('Expense submitted successfully')
      setMessageType('success')
      navigate('/employee')
    } catch (error) {
      console.error('Submit expense error:', error)
      setMessage(error.response?.data?.message || 'Failed to submit expense')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h2>Add Expense</h2>
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
      <form className="card form" onSubmit={(e) => e.preventDefault()}>
        <label>Title *</label>
        <input value={form.title} onChange={(e) => onChange('title', e.target.value)} required />

        <label>Expense Date *</label>
        <input type="date" value={form.date} onChange={(e) => onChange('date', e.target.value)} required />

        <label>Category *</label>
        <select value={form.category} onChange={(e) => onChange('category', e.target.value)} required>
          <option value="">Select</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        <label>Amount *</label>
        <input type="number" step="0.01" value={form.amount} onChange={(e) => onChange('amount', e.target.value)} required />

        <label>Description</label>
        <textarea value={form.description} onChange={(e) => onChange('description', e.target.value)} />

        <label>Upload Receipt</label>
        <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />

        <div className="auth-actions">
          <button className="btn-primary" type="button" onClick={submitExpense} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Expense'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: 20 }}>
        <h3>Or Upload Receipt for Automatic Processing</h3>
        <ExpenseUploadForm />
      </div>
    </div>
  )
}
