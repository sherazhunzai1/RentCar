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
import { useChat } from '../context/ChatContext'

// App-style bottom tab bar. Visible only on mobile (CSS). Tabs adapt to whether
// the visitor is logged out, a passenger, or a driver. The bookings/dashboard
// tab carries an unread-message badge.
export default function BottomNav() {
  const { isAuthenticated, isDriver } = useAuth()
  const { totalUnread } = useChat()

  let tabs
  if (!isAuthenticated) {
    tabs = [
      { to: '/', label: 'Home', icon: FaHome, end: true },
      { to: '/vehicles', label: 'Browse', icon: FaSearch },
      { to: '/login', label: 'Account', icon: FaUser },
    ]
  } else if (isDriver) {
    tabs = [
      { to: '/driver/dashboard', label: 'Dashboard', icon: FaThLarge, badge: true },
      { to: '/vehicles', label: 'Browse', icon: FaSearch },
      { to: '/driver/post', label: 'Post', icon: FaPlusCircle },
      { to: '/profile', label: 'Account', icon: FaUser },
    ]
  } else {
    tabs = [
      { to: '/', label: 'Home', icon: FaHome, end: true },
      { to: '/vehicles', label: 'Browse', icon: FaSearch },
      { to: '/my-bookings', label: 'Bookings', icon: FaTicketAlt, badge: true },
      { to: '/profile', label: 'Account', icon: FaUser },
    ]
  }

  const badgeText = totalUnread > 9 ? '9+' : totalUnread

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {tabs.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink key={to} to={to} end={end} className="bottom-nav-item">
          <span className="bottom-nav-icon-wrap">
            <Icon className="bottom-nav-icon" />
            {badge && totalUnread > 0 && <span className="nav-unread">{badgeText}</span>}
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
