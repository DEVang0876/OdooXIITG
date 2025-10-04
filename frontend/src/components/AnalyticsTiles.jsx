import React from 'react'

export default function AnalyticsTiles({ tiles }) {
  const safeTiles = Array.isArray(tiles) ? tiles : []
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
      {safeTiles.map(t => (
        <div key={t.id} style={{ flex: '1 1 180px', background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 12, color: '#666' }}>{t.title}</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{t.value}</div>
          {t.meta && <div style={{ fontSize: 12, color: '#999' }}>{t.meta}</div>}
        </div>
      ))}
    </div>
  )
}
