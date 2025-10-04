import React from 'react'

export default function Modal({ children, onClose, title }){
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}} onClick={onClose}>
      <div style={{width:600,maxWidth:'95%',background:'#fff',padding:16,borderRadius:8}} onClick={(e)=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <h3 style={{margin:0}}>{title}</h3>
          <button className="btn-small" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}
