import React, { useEffect, useState } from 'react'
import Store from '../services/mockStore'
import { toast } from 'react-toastify'

export default function ApprovalRules(){
  const [rules, setRules] = useState([])
  const [editing, setEditing] = useState(null)

  useEffect(()=> setRules((() => { try{return Store.getRules ? Store.getRules() : []}catch{return []}})()), [])

  const save = (rule) => {
    try{
      if (rule.id) Store.updateRule(rule.id, rule)
      else Store.createRule(rule)
      setRules(Store.getRules())
      toast.success('Rule saved')
      setEditing(null)
    }catch(err){ toast.error(err.message) }
  }

  const remove = (id) => {
    try{ Store.deleteRule(id); setRules(Store.getRules()); toast.success('Rule removed') }catch(err){toast.error(err.message)}
  }

  return (
    <div className="page">
      <h2>Approval Rules</h2>
      <div className="card">
        {!editing && <button className="btn-primary" onClick={()=>setEditing({category:'', approvers:[]})}>Create Rule</button>}
        {editing && (
          <div className="card">
            <label>Category</label>
            <input value={editing.category} onChange={(e)=>setEditing({...editing, category:e.target.value})} />
            <label>Approvers (comma separated)</label>
            <input value={editing.approvers.join(', ')} onChange={(e)=>setEditing({...editing, approvers: e.target.value.split(',').map(s=>s.trim())})} />
            <div className="auth-actions"><button className="btn-primary" onClick={()=>save(editing)}>Save</button><button className="btn-secondary" onClick={()=>setEditing(null)}>Cancel</button></div>
          </div>
        )}

        <table className="table">
          <thead><tr><th>Category</th><th>Approvers</th><th>Actions</th></tr></thead>
          <tbody>
            {rules.map(r => <tr key={r.id}><td>{r.category}</td><td>{r.approvers.join(', ')}</td><td><button className="btn-small" onClick={()=>setEditing(r)}>Edit</button><button className="btn-small" onClick={()=>remove(r.id)}>Delete</button></td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
