import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Auth from '../services/auth'

export default function ResetPassword(){
  const [search] = useSearchParams()
  const token = search.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return alert('Passwords do not match')
    try{
      await Auth.resetPassword(token, password)
      alert('Password reset. Please login')
      navigate('/login')
    }catch(err){
      alert(err.message)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2>Reset Password</h2>
        <label>New Password</label>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <label>Confirm Password</label>
        <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
        <div className="auth-actions"><button className="btn-primary" type="submit">Reset</button></div>
      </form>
    </div>
  )
}
