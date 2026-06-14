import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Guards routes that require authentication and, optionally, a specific role.
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Remember where the user was headed so we can return them after login.
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (role && user.role !== role) {
    return (
      <div className="container narrow access-denied">
        <h2>Wrong account type</h2>
        <p>
          This page is for <strong>{role}s</strong>, but you are signed in as a{' '}
          <strong>{user.role}</strong>.
        </p>
        <Navigate to={user.role === 'driver' ? '/driver/dashboard' : '/vehicles'} replace />
      </div>
    )
  }

  return children
}
