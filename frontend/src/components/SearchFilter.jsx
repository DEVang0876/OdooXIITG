import React, { useState } from 'react'

export default function SearchFilter({ onSearch, placeholder='Search...' }){
  const [q, setQ] = useState('')
  const submit = (e) => { e.preventDefault(); onSearch(q) }
  return (
    <form onSubmit={submit} style={{display:'flex',gap:8,marginBottom:8}}>
      <input placeholder={placeholder} value={q} onChange={(e)=>setQ(e.target.value)} />
      <button className="btn-primary" type="submit">Search</button>
      <button type="button" className="btn-secondary" onClick={()=>{ setQ(''); onSearch('') }}>Clear</button>
    </form>
  )
}
