import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Route guard. Wrap any protected element in this and unauthenticated visitors
 * get bounced to the landing page instead.
 *
 * The location they were trying to reach rides along in router state so the
 * landing page can send them there after they log in — deep-linking straight to
 * a festival still works, it just detours through the login form.
 */
function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return children
}

export default RequireAuth
