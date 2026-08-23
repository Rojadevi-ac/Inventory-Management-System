import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem('ims_token')
  if (!token) return <Navigate to="/login" replace />

  // Role-based guard
  if (roles && roles.length > 0) {
    try {
      const user = JSON.parse(localStorage.getItem('ims_user') || 'null')
      if (!user || !roles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />
      }
    } catch {
      return <Navigate to="/login" replace />
    }
  }

  return children
}
