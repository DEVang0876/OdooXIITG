import React, { useEffect, useState } from 'react'
import API from '../services/api'
import { toast } from 'react-toastify'

export default function ApprovalRules() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories')
      // Handle nested response structure
      const data = response.data.data?.categories || response.data.data || response.data || []
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fetch categories error:', error)
      setCategories([]) // Ensure it's always an array
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="page"><h2>Loading...</h2></div>
  }

  return (
    <div className="page">
      <h2>Approval Rules</h2>
      <div className="card">
        <p>The expense approval system works based on organizational hierarchy:</p>
        <ul>
          <li><b>Employees</b> submit expenses for approval</li>
          <li><b>Managers</b> can approve/reject expenses from their direct subordinates</li>
          <li><b>Admins</b> can approve/reject any expense and manage users</li>
        </ul>

        <h3>Available Categories</h3>
        <p>Expenses can be categorized into the following types:</p>
        <ul>
          {(Array.isArray(categories) ? categories : []).map(c => (
            <li key={c._id}>
              <strong>{c.name}</strong>
              {c.description && <span> - {c.description}</span>}
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 20, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
          <h4>How Approvals Work</h4>
          <ol>
            <li>Employee creates an expense with a category and receipt</li>
            <li>Expense status is set to "pending"</li>
            <li>Manager receives notification and can view pending expenses</li>
            <li>Manager can approve or reject with optional comments</li>
            <li>Approved expenses cannot be modified</li>
            <li>Rejected expenses can be resubmitted by the employee</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
