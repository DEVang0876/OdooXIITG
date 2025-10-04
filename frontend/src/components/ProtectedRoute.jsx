import { Navigate } from 'react-router-dom'
import Auth from '../services/auth'

export default function ProtectedRoute({ children, roles }) {
  const user = Auth.getUser()
  if (!Auth.isAuthenticated()) return <Navigate to="/login" replace />
  if (roles && roles.length && !roles.includes(user?.role)) return <Navigate to="/" replace />
  return children
}
