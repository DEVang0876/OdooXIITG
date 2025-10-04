import React, { useEffect, useState } from 'react'
import API from '../services/api'
import Auth from '../services/auth'
import SearchFilter from '../components/SearchFilter'
import ApprovalTimeline from '../components/ApprovalTimeline'
import AnalyticsTiles from '../components/AnalyticsTiles'
import { exportToCsv } from '../utils/exportCsv'
import { toast } from 'react-toastify'

export default function EmployeeDashboard() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await API.get('/expenses')
      const data = response.data.data || response.data || []
      setExpenses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fetch expenses error:', error)
      setExpenses([]) // Ensure it's always an array
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  const filtered = (Array.isArray(expenses) ? expenses : []).filter(e =>
    !filter ||
    e._id?.includes(filter) ||
    e.title?.toLowerCase().includes(filter.toLowerCase()) ||
    e.category?.toLowerCase().includes(filter.toLowerCase()) ||
    e.description?.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading) {
    return <div className="page"><h2>Loading...</h2></div>
  }

  return (
    <div className="page">
      <h2>My Expenses</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <AnalyticsTiles tiles={[
          { id: 1, title: 'Total', value: expenses.length, meta: 'Total expenses' },
          { id: 2, title: 'Approved', value: expenses.filter(e => e.status === 'approved').length, meta: 'Approved' },
          { id: 3, title: 'Pending', value: expenses.filter(e => e.status === 'pending').length, meta: 'Pending' }
        ]} />
        <div>
          <button className="btn-small" onClick={() => exportToCsv('expenses.csv', expenses)}>Export CSV</button>
        </div>
      </div>
      <SearchFilter onSearch={setFilter} placeholder="Filter by id, title or category" />
      <div className="card">
        <table className="table">
          <thead><tr><th>ID</th><th>Title</th><th>Date</th><th>Category</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((e) => (
              <React.Fragment key={e._id}>
                <tr>
                  <td>{e._id}</td>
                  <td>{e.title}</td>
                  <td>{new Date(e.date || e.createdAt).toLocaleDateString()}</td>
                  <td>{e.category}</td>
                  <td>${e.amount}</td>
                  <td>{e.status} <button className="btn-small" onClick={() => setExpanded(expanded === e._id ? null : e._id)}>{expanded === e._id ? 'Hide' : 'Details'}</button></td>
                </tr>
                {expanded === e._id && <tr><td colSpan={6}><div>Description: {e.description}</div></td></tr>}
              </React.Fragment>
            ))}
            {expenses.length === 0 && <tr><td colSpan={6} className="muted">No expenses yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
