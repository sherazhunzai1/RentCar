import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { useRideAlert } from '../context/RideAlertContext'
import UserAvatar from './UserAvatar'
import Logo from './Logo'

// Top header. On desktop it shows the full horizontal nav; on mobile the links
// are hidden (CSS) and the app-style <BottomNav> takes over, leaving a slim
// brand-only header bar.
export default function Navbar() {
  const { isAuthenticated, isDriver, user, logout } = useAuth()
  const { totalUnread } = useChat()
  const { newRequestCount, newOfferCount } = useRideAlert()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const unreadBadge =
    totalUnread > 0 ? <span className="nav-unread-inline">{totalUnread > 9 ? '9+' : totalUnread}</span> : null
  const driverRequestBadge =
    newRequestCount > 0 ? (
      <span className="nav-unread-inline">{newRequestCount > 9 ? '9+' : newRequestCount}</span>
    ) : null
  const passengerOfferBadge =
    newOfferCount > 0 ? (
      <span className="nav-unread-inline">{newOfferCount > 9 ? '9+' : newOfferCount}</span>
    ) : null

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <Logo />
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/vehicles">Browse Vehicles</NavLink>

          {!isAuthenticated && (
            <>
              <NavLink to="/login" className="btn btn-outline nav-cta-outline">
                Login
              </NavLink>
              <Link to="/signup" className="btn btn-primary nav-cta">
                Sign Up
              </Link>
            </>
          )}

          {isAuthenticated && isDriver && (
            <>
              <NavLink to="/driver/requests">Requests{driverRequestBadge}</NavLink>
              <NavLink to="/driver/dashboard">Dashboard{unreadBadge}</NavLink>
              <Link to="/driver/post" className="btn btn-primary nav-cta">
                + Post Vehicle
              </Link>
            </>
          )}

          {isAuthenticated && !isDriver && (
            <>
              <NavLink to="/requests">Requests{passengerOfferBadge}</NavLink>
              <NavLink to="/my-bookings">My Bookings{unreadBadge}</NavLink>
            </>
          )}

          {isAuthenticated && (
            <div className="nav-user">
              <Link to="/profile" className="nav-user-chip">
                <UserAvatar src={user.avatarUrl} name={user.name} size="sm" className="nav-user-avatar" />
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
