import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function RequireAuth({ adminOnly = false, children }) {
  const { isAuthenticated, isAdmin, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return <div className="container wide empty-state"><p>Checking your session…</p></div>
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
