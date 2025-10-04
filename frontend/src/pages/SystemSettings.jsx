import React, { useEffect, useState } from 'react'
import API from '../services/api'
import { toast } from 'react-toastify'

export default function SystemSettings() {
  const [categories, setCategories] = useState([])
  const [newCat, setNewCat] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories')
      setCategories(response.data.data || response.data)
    } catch (error) {
      console.error('Fetch categories error:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const add = async () => {
    if (!newCat.trim()) return
    try {
      await API.post('/categories', { name: newCat.trim() })
      setNewCat('')
      toast.success('Category added successfully')
      fetchCategories()
    } catch (error) {
      console.error('Add category error:', error)
      toast.error(error.response?.data?.message || 'Failed to add category')
    }
  }

  const del = async (id) => {
    try {
      await API.delete(`/categories/${id}`)
      toast.info('Category removed successfully')
      fetchCategories()
    } catch (error) {
      console.error('Delete category error:', error)
      toast.error(error.response?.data?.message || 'Failed to delete category')
    }
  }

  if (loading) {
    return <div className="page"><h2>Loading...</h2></div>
  }

  return (
    <div className="page">
      <h2>System Settings</h2>
      <div className="card">
        <h3>Expense Categories</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input placeholder="New category" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
          <button className="btn-primary" onClick={add}>Add</button>
        </div>
        <ul>
          {categories.map(c => (
            <li key={c._id}>
              {c.name}
              <button className="btn-small btn-danger" onClick={() => del(c._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
