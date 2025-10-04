import React from 'react'

export default function ApprovalTimeline({ approvals=[] }){
  if (!approvals || approvals.length===0) return <div className="card muted">No approvals configured</div>
  return (
    <div className="card">
      <h4>Approval Timeline</h4>
      <ol style={{paddingLeft:16}}>
        {approvals.map((a, idx) => (
          <li key={idx} style={{marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div><b>{a.approver}</b> <span style={{color:'#666'}}>— {a.status}</span></div>
              {a.remarks && <div style={{color:'#666'}}>{a.remarks}</div>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
