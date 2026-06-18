import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FaUserCircle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

// Top header. On desktop it shows the full horizontal nav; on mobile the links
// are hidden (CSS) and the app-style <BottomNav> takes over, leaving a slim
// brand-only header bar.
export default function Navbar() {
  const { isAuthenticated, isDriver, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

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
              <NavLink to="/login">Login</NavLink>
              <Link to="/signup" className="btn btn-primary nav-cta">
                Sign Up
              </Link>
            </>
          )}

          {isAuthenticated && isDriver && (
            <>
              <NavLink to="/driver/dashboard">Dashboard</NavLink>
              <Link to="/driver/post" className="btn btn-primary nav-cta">
                + Post Vehicle
              </Link>
            </>
          )}

          {isAuthenticated && !isDriver && <NavLink to="/my-bookings">My Bookings</NavLink>}

          {isAuthenticated && (
            <div className="nav-user">
              <Link to="/profile" className="nav-user-chip">
                <FaUserCircle />
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
