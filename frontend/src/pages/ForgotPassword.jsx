import React, { useState } from 'react'
import Auth from '../services/auth'

export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const [info, setInfo] = useState(null)
  const submit = async (e) => {
    e.preventDefault()
    try{
      const token = await Auth.forgotPassword(email)
      setInfo(`Reset token (dev): ${token}`)
    }catch(err){
      setInfo(err.message)
    }
  }
  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2>Forgot Password</h2>
        <label>Email</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} />
        <div className="auth-actions"><button className="btn-primary" type="submit">Request Reset</button></div>
        {info && <p className="muted">{info}</p>}
      </form>
    </div>
  )
}
