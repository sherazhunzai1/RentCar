import { NavLink } from 'react-router-dom'
import {
  FaHome,
  FaSearch,
  FaTicketAlt,
  FaUser,
  FaThLarge,
  FaPlusCircle,
  FaHandHoldingUsd,
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { useRideAlert } from '../context/RideAlertContext'

// App-style bottom tab bar. Visible only on mobile (CSS). Tabs adapt to whether
// the visitor is logged out, a passenger, or a driver. The bookings/dashboard
// tab carries an unread-message badge; driver Requests shows new request count.
export default function BottomNav() {
  const { isAuthenticated, isDriver } = useAuth()
  const { totalUnread } = useChat()
  const { newRequestCount, newOfferCount } = useRideAlert()

  let tabs
  if (!isAuthenticated) {
    tabs = [
      { to: '/', label: 'Home', icon: FaHome, end: true },
      { to: '/vehicles', label: 'Browse', icon: FaSearch },
      { to: '/login', label: 'Account', icon: FaUser },
    ]
  } else if (isDriver) {
    tabs = [
      {
        to: '/driver/requests',
        label: 'Requests',
        icon: FaHandHoldingUsd,
        driverRequestBadge: true,
      },
      { to: '/driver/dashboard', label: 'Dashboard', icon: FaThLarge, chatBadge: true },
      { to: '/driver/post', label: 'Post', icon: FaPlusCircle },
      { to: '/profile', label: 'Account', icon: FaUser },
    ]
  } else {
    tabs = [
      { to: '/', label: 'Home', icon: FaHome, end: true },
      {
        to: '/requests',
        label: 'Requests',
        icon: FaHandHoldingUsd,
        passengerOfferBadge: true,
      },
      { to: '/my-bookings', label: 'Bookings', icon: FaTicketAlt, chatBadge: true },
      { to: '/profile', label: 'Account', icon: FaUser },
    ]
  }

  const chatBadgeText = totalUnread > 9 ? '9+' : totalUnread
  const driverBadgeText = newRequestCount > 9 ? '9+' : newRequestCount
  const offerBadgeText = newOfferCount > 9 ? '9+' : newOfferCount

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {tabs.map(({ to, label, icon: Icon, end, chatBadge, driverRequestBadge, passengerOfferBadge }) => (
        <NavLink key={to} to={to} end={end} className="bottom-nav-item">
          <span className="bottom-nav-icon-wrap">
            <Icon className="bottom-nav-icon" />
            {chatBadge && totalUnread > 0 && <span className="nav-unread">{chatBadgeText}</span>}
            {driverRequestBadge && newRequestCount > 0 && (
              <span className="nav-unread">{driverBadgeText}</span>
            )}
            {passengerOfferBadge && newOfferCount > 0 && (
              <span className="nav-unread">{offerBadgeText}</span>
            )}
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
