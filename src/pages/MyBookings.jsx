import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaArrowRight,
  FaRegCalendarAlt,
  FaRegClock,
  FaChair,
  FaTicketAlt,
  FaTimesCircle,
} from 'react-icons/fa'
import EmptyState from '../components/EmptyState'
import { getBookingsByUser, cancelBooking } from '../services/bookingService'
import { getVehicleType } from '../data/constants'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import Seo from '../components/Seo'

export default function MyBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    getBookingsByUser(user.id)
      .then(setBookings)
      .finally(() => setLoading(false))
  }, [user.id])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? Your seats will be released.')) return
    setCancelling(id)
    try {
      const updated = await cancelBooking(id)
      setBookings((list) => list.map((b) => (b.id === id ? updated : b)))
    } finally {
      setCancelling(null)
    }
  }

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="container section dashboard">
      <Seo title="My Bookings" path="/my-bookings" noindex />
      <div className="dashboard-head">
        <div>
          <h1>My Bookings</h1>
          <p>Track and manage all your trips in one place.</p>
        </div>
        <Link to="/vehicles" className="btn btn-primary">
          Book a Trip
        </Link>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={FaTicketAlt}
          title="No bookings yet"
          message="When you book a seat, your tickets will show up here."
          action={
            <Link to="/vehicles" className="btn btn-primary">
              Browse vehicles
            </Link>
          }
        />
      ) : (
        <div className="booking-list">
          {bookings.map((b) => {
            const type = getVehicleType(b.vehicleType)
            const TypeIcon = type.icon
            const cancelled = b.status === 'cancelled'
            return (
              <div key={b.id} className={`card booking-row ${cancelled ? 'is-cancelled' : ''}`}>
                <div className="booking-row-main">
                  <div className="booking-row-top">
                    <div className="vehicle-type-badge">
                      <TypeIcon />
                      <span>{type.label}</span>
                    </div>
                    <span className={`status-pill ${cancelled ? 'cancelled' : 'confirmed'}`}>
                      {cancelled ? 'Cancelled' : 'Confirmed'}
                    </span>
                  </div>

                  <h3>{b.vehicleName}</h3>

                  <div className="route checkout-route">
                    <div className="route-point">
                      <span className="dot from" />
                      <span>{b.fromCity}</span>
                    </div>
                    <FaArrowRight className="route-arrow" />
                    <div className="route-point">
                      <span className="dot to" />
                      <span>{b.toCity}</span>
                    </div>
                  </div>

                  <div className="details-when">
                    <span><FaRegCalendarAlt /> {formatDate(b.date)}</span>
                    <span><FaRegClock /> {formatTime(b.time)}</span>
                    <span>
                      <FaChair />{' '}
                      {b.bookingType === 'whole'
                        ? `Whole vehicle (${b.seats.length})`
                        : `Seats ${b.seats.join(', ')}`}
                    </span>
                  </div>
                </div>

                <div className="booking-row-side">
                  <div className="booking-ref-small">
                    Ref <strong>{b.bookingRef}</strong>
                  </div>
                  <div className="booking-amount">{formatCurrency(b.totalAmount)}</div>
                  {!cancelled && (
                    <button
                      className="btn btn-danger-ghost btn-sm"
                      onClick={() => handleCancel(b.id)}
                      disabled={cancelling === b.id}
                    >
                      <FaTimesCircle /> {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
