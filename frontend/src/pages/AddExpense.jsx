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
      console.log('Fetching categories...')
      const response = await API.get('/categories')
      console.log('Categories response:', response.data)

      // Handle nested response structure
      const data = response.data.data?.categories || response.data.data || response.data || []
      console.log('Processed categories data:', data)
      setCategories(Array.isArray(data) ? data : [])

      if (data.length === 0) {
        console.warn('No categories found, using fallback')
        // Set fallback categories if no categories found
        const fallbackCategories = [
          { _id: '68e0f13656b73e2763fbfacd', name: 'Office Supplies' },
          { _id: '68e0f13656b73e2763fbface', name: 'Travel' },
          { _id: '68e0f13656b73e2763fbfacf', name: 'Meals & Entertainment' },
          { _id: '68e0f13656b73e2763fbfad0', name: 'Software & Tools' },
          { _id: '68e0f13656b73e2763fbfad1', name: 'Training & Development' },
          { _id: '68e0f13656b73e2763fbfad2', name: 'Marketing' },
          { _id: '68e0f13656b73e2763fbfad3', name: 'Utilities' },
          { _id: '68e0f13656b73e2763fbfad4', name: 'Medical' }
        ]
        setCategories(fallbackCategories)
        setMessage('Using default categories.')
        setMessageType('info')
      }
    } catch (error) {
      console.error('Fetch categories error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)

      // Set fallback categories immediately
      const fallbackCategories = [
        { _id: '68e0f13656b73e2763fbfacd', name: 'Office Supplies' },
        { _id: '68e0f13656b73e2763fbface', name: 'Travel' },
        { _id: '68e0f13656b73e2763fbfacf', name: 'Meals & Entertainment' },
        { _id: '68e0f13656b73e2763fbfad0', name: 'Software & Tools' },
        { _id: '68e0f13656b73e2763fbfad1', name: 'Training & Development' },
        { _id: '68e0f13656b73e2763fbfad2', name: 'Marketing' },
        { _id: '68e0f13656b73e2763fbfad3', name: 'Utilities' },
        { _id: '68e0f13656b73e2763fbfad4', name: 'Medical' }
      ]
      setCategories(fallbackCategories)

      // Show error message based on the type of error
      if (error.response?.status === 403) {
        setMessage('Please verify your email to access categories. Using default categories.')
        setMessageType('warning')
      } else {
        setMessage('Could not load categories from server. Using default categories.')
        setMessageType('warning')
      }
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
      // If there's a file, use FormData, otherwise use JSON
      if (form.receipt) {
        const formData = new FormData()
        formData.append('title', form.title)
        formData.append('amount', parseFloat(form.amount))
        formData.append('category', form.category)
        formData.append('description', form.description || '')
        formData.append('date', form.date)
        formData.append('currency', 'USD')
        formData.append('paymentMethod', 'cash')
        formData.append('receipts', form.receipt) // Note: 'receipts' not 'receipt'

        console.log('Submitting expense with file (FormData)')

        await API.post('/expenses', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        // Use JSON when no file
        const data = {
          title: form.title,
          amount: parseFloat(form.amount),
          category: form.category,
          description: form.description || '',
          date: form.date,
          currency: 'USD',
          paymentMethod: 'cash'
        }

        console.log('Submitting expense without file (JSON):', data)

        await API.post('/expenses', data, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }

      setMessage('Expense submitted successfully')
      setMessageType('success')
      navigate('/employee')
    } catch (error) {
      console.error('Submit expense error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error details:', JSON.stringify(error.response?.data, null, 2))

      // Show detailed error message
      let errorMessage = 'Failed to submit expense'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.details) {
        errorMessage = `Validation error: ${JSON.stringify(error.response.data.details)}`
      }

      setMessage(errorMessage)
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
          {(Array.isArray(categories) ? categories : []).map(cat => (
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
