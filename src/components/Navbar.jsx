import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function Navbar() {
  const { isAuthenticated, isDriver, user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const close = () => setOpen(false)

  const handleLogout = async () => {
    await logout()
    close()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <Logo />
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>
            Home
          </NavLink>
          <NavLink to="/vehicles" onClick={close}>
            Browse Vehicles
          </NavLink>

          {!isAuthenticated && (
            <>
              <NavLink to="/login" onClick={close}>
                Login
              </NavLink>
              <Link to="/signup" className="btn btn-primary nav-cta" onClick={close}>
                Sign Up
              </Link>
            </>
          )}

          {isAuthenticated && isDriver && (
            <>
              <NavLink to="/driver/dashboard" onClick={close}>
                Dashboard
              </NavLink>
              <Link to="/driver/post" className="btn btn-primary nav-cta" onClick={close}>
                + Post Vehicle
              </Link>
            </>
          )}

          {isAuthenticated && !isDriver && (
            <NavLink to="/my-bookings" onClick={close}>
              My Bookings
            </NavLink>
          )}

          {isAuthenticated && (
            <div className="nav-user">
              <Link to="/profile" className="nav-user-chip" onClick={close}>
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
