import React, { useEffect, useState } from 'react'
import API from '../services/api'
import Auth from '../services/auth'
import { toast } from 'react-toastify'
import SearchFilter from '../components/SearchFilter'
import ApprovalModal from '../components/ApprovalModal'

export default function ManagerDashboard() {
  const user = Auth.getUser()
  const [pendings, setPendings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchPendingExpenses()
  }, [])

  const fetchPendingExpenses = async () => {
    try {
      const response = await API.get('/expenses?status=pending')
      const data = response.data.data || response.data || []
      setPendings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fetch pending expenses error:', error)
      setPendings([]) // Ensure it's always an array
      toast.error('Failed to load pending expenses')
    } finally {
      setLoading(false)
    }
  }

  const filtered = (Array.isArray(pendings) ? pendings : []).filter(p =>
    !filter ||
    p._id?.includes(filter) ||
    p.user?.email?.toLowerCase().includes(filter.toLowerCase()) ||
    p.category?.toLowerCase().includes(filter.toLowerCase()) ||
    p.title?.toLowerCase().includes(filter.toLowerCase())
  )

  const approve = async (id) => {
    try {
      await API.put(`/expenses/${id}/approve`)
      toast.success('Expense approved successfully')
      fetchPendingExpenses() // Refresh the list
    } catch (error) {
      console.error('Approve expense error:', error)
      toast.error(error.response?.data?.message || 'Failed to approve expense')
    }
  }

  const reject = async (id, reason) => {
    try {
      await API.put(`/expenses/${id}/reject`, { reason })
      toast.info('Expense rejected')
      fetchPendingExpenses() // Refresh the list
    } catch (error) {
      console.error('Reject expense error:', error)
      toast.error(error.response?.data?.message || 'Failed to reject expense')
    }
  }

  if (loading) {
    return <div className="page"><h2>Loading...</h2></div>
  }

  return (
    <div className="page">
      <h2>Pending Approvals</h2>
      <SearchFilter onSearch={setFilter} placeholder="Filter by id, employee, category or title" />
      <div className="card">
        <table className="table">
          <thead><tr><th>ID</th><th>Employee</th><th>Title</th><th>Category</th><th>Amount</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id}>
                <td>{p._id}</td>
                <td>{p.user?.email || 'Unknown'}</td>
                <td>{p.title}</td>
                <td>{p.category}</td>
                <td>${p.amount}</td>
                <td>
                  <button className="btn-small" onClick={() => setSelected(p)}>View</button>
                  <button className="btn-small btn-success" onClick={() => approve(p._id)}>Approve</button>
                  <button className="btn-small btn-danger" onClick={() => reject(p._id, 'Rejected by manager')}>Reject</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="muted">No pending approvals</td></tr>}
          </tbody>
        </table>
      </div>
      {selected && (
        <div style={{ marginTop: 12 }}>
          <ApprovalModal
            expense={selected}
            approver={user.name}
            onClose={() => setSelected(null)}
            onApprove={() => approve(selected._id)}
            onReject={(reason) => reject(selected._id, reason)}
          />
        </div>
      )}
    </div>
  )
}
