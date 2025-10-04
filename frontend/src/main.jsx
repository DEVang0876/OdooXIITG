import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Ensure mock data seeded in dev so UI has expected users
if (import.meta.env.MODE !== 'production') {
  import('./services/mockStore').then(m => m.default.ensureDefaultData()).catch(() => {})
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
