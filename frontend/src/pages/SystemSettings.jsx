import React, { useEffect, useState } from 'react'
import Store from '../services/mockStore'
import { toast } from 'react-toastify'

export default function SystemSettings(){
  const [categories, setCategories] = useState([])
  const [newCat, setNewCat] = useState('')
  useEffect(()=> setCategories(Store.getCategories()), [])

  const add = ()=>{ if(!newCat) return; Store.addCategory(newCat); setCategories(Store.getCategories()); setNewCat(''); toast.success('Category added') }
  const del = (c)=>{ Store.deleteCategory(c); setCategories(Store.getCategories()); toast.info('Category removed') }

  return (
    <div className="page">
      <h2>System Settings</h2>
      <div className="card">
        <h3>Expense Categories</h3>
        <div style={{display:'flex',gap:8,marginBottom:8}}>
          <input placeholder="New category" value={newCat} onChange={(e)=>setNewCat(e.target.value)} />
          <button className="btn-primary" onClick={add}>Add</button>
        </div>
        <ul>
          {categories.map(c=> <li key={c}>{c} <button className="btn-small" onClick={()=>del(c)}>Delete</button></li>)}
        </ul>
      </div>
    </div>
  )
}
