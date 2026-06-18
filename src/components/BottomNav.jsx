import { NavLink } from 'react-router-dom'
import {
  FaHome,
  FaSearch,
  FaTicketAlt,
  FaUser,
  FaThLarge,
  FaPlusCircle,
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

// App-style bottom tab bar. Visible only on mobile (CSS). Tabs adapt to whether
// the visitor is logged out, a passenger, or a driver.
export default function BottomNav() {
  const { isAuthenticated, isDriver } = useAuth()

  let tabs
  if (!isAuthenticated) {
    tabs = [
      { to: '/', label: 'Home', icon: FaHome, end: true },
      { to: '/vehicles', label: 'Browse', icon: FaSearch },
      { to: '/login', label: 'Account', icon: FaUser },
    ]
  } else if (isDriver) {
    tabs = [
      { to: '/driver/dashboard', label: 'Dashboard', icon: FaThLarge },
      { to: '/vehicles', label: 'Browse', icon: FaSearch },
      { to: '/driver/post', label: 'Post', icon: FaPlusCircle },
      { to: '/profile', label: 'Account', icon: FaUser },
    ]
  } else {
    tabs = [
      { to: '/', label: 'Home', icon: FaHome, end: true },
      { to: '/vehicles', label: 'Browse', icon: FaSearch },
      { to: '/my-bookings', label: 'Bookings', icon: FaTicketAlt },
      { to: '/profile', label: 'Account', icon: FaUser },
    ]
  }

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className="bottom-nav-item">
          <Icon className="bottom-nav-icon" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
