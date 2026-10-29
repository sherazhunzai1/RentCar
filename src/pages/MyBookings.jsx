import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaArrowRight,
  FaRegCalendarAlt,
  FaRegClock,
  FaChair,
  FaTicketAlt,
  FaTimesCircle,
  FaHandHoldingUsd,
} from 'react-icons/fa'
import EmptyState from '../components/EmptyState'
import ChatButton from '../components/ChatButton'
import UserAvatar from '../components/UserAvatar'
import { getBookingsByUser, cancelBooking } from '../services/bookingService'
import { getVehicleType } from '../data/constants'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../context/ConfirmContext'
import { useToast } from '../context/ToastContext'
import Seo from '../components/Seo'

function statusMeta(b) {
  const cancelled = b.status === 'cancelled'
  const pending = b.status === 'pending'
  const failed = b.status === 'failed'
  const statusLabel = cancelled
    ? 'Cancelled'
    : pending
      ? 'Awaiting payment'
      : failed
        ? 'Payment failed'
        : 'Confirmed'
  const statusClass = cancelled || failed ? 'cancelled' : pending ? 'pending' : 'confirmed'
  return { cancelled, pending, failed, statusLabel, statusClass }
}

function BookingCard({ b, cancelling, onCancel, requestDeal }) {
  const type = getVehicleType(b.vehicleType)
  const TypeIcon = type.icon
  const { cancelled, failed, statusLabel, statusClass } = statusMeta(b)

  return (
    <div className={`card booking-row ${cancelled || failed ? 'is-cancelled' : ''}`}>
      <div className="booking-row-main">
        <div className="booking-row-top">
          <div className="vehicle-type-badge">
            <TypeIcon />
            <span>{type.label}</span>
          </div>
          {requestDeal && (
            <span className="status-pill status-open">Ride request</span>
          )}
          <span className={`status-pill ${statusClass}`}>{statusLabel}</span>
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
          <span>
            <FaRegCalendarAlt /> {formatDate(b.date)}
          </span>
          <span>
            <FaRegClock /> {formatTime(b.time)}
          </span>
          {requestDeal ? (
            <span>
              <FaChair />{' '}
              {(b.seats || []).length
                ? `${(b.seats || []).length} seat${(b.seats || []).length > 1 ? 's' : ''}`
                : 'Agreed trip'}
            </span>
          ) : (
            <span>
              <FaChair />{' '}
              {b.bookingType === 'whole'
                ? `Whole vehicle (${(b.seats || []).length} seats)`
                : (b.seats || []).length
                  ? (b.seats || []).map((n) => `Seat ${n}`).join(', ')
                  : 'No seats listed'}
            </span>
          )}
        </div>
        <div className="booking-party">
          <UserAvatar src={b.driverAvatarUrl} name={b.driverName || 'Driver'} size="sm" />
          <span>Driver</span>
          {b.driverName || 'Assigned driver'}
        </div>
      </div>

      <div className="booking-row-side">
        <div className="booking-ref-small">
          Ref <strong>{b.bookingRef}</strong>
        </div>
        <div className="booking-amount">{formatCurrency(b.totalAmount)}</div>
        {!cancelled && !failed && b.status === 'confirmed' && (
          <Link to={`/booking/confirmation/${b.id}`} className="btn btn-outline btn-sm">
            View ticket
          </Link>
        )}
        <ChatButton booking={b} label="Message driver" />
        {!cancelled && !failed && (
          <button
            className="btn btn-danger-ghost btn-sm"
            onClick={() => onCancel(b.id)}
            disabled={cancelling === b.id}
          >
            <FaTimesCircle /> {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function MyBookings() {
  const { user } = useAuth()
  const confirm = useConfirm()
  const toast = useToast()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    getBookingsByUser(user.id)
      .then(setBookings)
      .finally(() => setLoading(false))
  }, [user.id])

  const handleCancel = async (id) => {
    const ok = await confirm({
      title: 'Cancel booking?',
      message: 'Your seats will be released and this booking will be cancelled.',
      confirmLabel: 'Cancel booking',
      danger: true,
    })
    if (!ok) return
    setCancelling(id)
    try {
      const updated = await cancelBooking(id)
      setBookings((list) => list.map((b) => (b.id === id ? updated : b)))
      toast('Booking cancelled.', 'success')
    } catch (err) {
      toast(err.message || 'Could not cancel booking.', 'error')
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

  const requestBookings = bookings.filter((b) => b.rideRequestId)
  const confirmedRequests = requestBookings.filter((b) => b.status === 'confirmed')
  const otherRequestBookings = requestBookings.filter((b) => b.status !== 'confirmed')
  const seatBookings = bookings.filter((b) => !b.rideRequestId)
  const hasAny = bookings.length > 0

  return (
    <div className="container section dashboard">
      <Seo title="My Bookings" path="/my-bookings" noindex />
      <div className="dashboard-head">
        <div>
          <h1>My Bookings</h1>
          <p>Track seat bookings and confirmed ride-request deals in one place.</p>
        </div>
        <div className="dashboard-head-actions">
          <Link to="/requests" className="btn btn-outline">
            Ride requests
          </Link>
          <Link to="/vehicles" className="btn btn-primary">
            Book a Trip
          </Link>
        </div>
      </div>

      {!hasAny ? (
        <EmptyState
          icon={FaTicketAlt}
          title="No bookings yet"
          message="When you book a seat — or pay for an accepted ride request — your tickets show up here."
          action={
            <>
              <Link to="/vehicles" className="btn btn-primary">
                Browse vehicles
              </Link>
              <Link to="/requests/new" className="btn btn-outline">
                Request a ride
              </Link>
            </>
          }
        />
      ) : (
        <>
          <section className="dashboard-section">
            <div className="dashboard-section-head">
              <h2>Confirmed ride requests</h2>
              <Link to="/requests" className="btn btn-ghost btn-sm">
                Manage requests
              </Link>
            </div>
            {confirmedRequests.length === 0 ? (
              <EmptyState
                icon={FaHandHoldingUsd}
                title="No confirmed request deals"
                message="After a driver accepts your request and you pay, the confirmed deal appears here."
                action={
                  <Link to="/requests" className="btn btn-outline">
                    View my requests
                  </Link>
                }
              />
            ) : (
              <div className="booking-list">
                {confirmedRequests.map((b) => (
                  <BookingCard
                    key={b.id}
                    b={b}
                    requestDeal
                    cancelling={cancelling}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </section>

          {otherRequestBookings.length > 0 && (
            <section className="dashboard-section">
              <h2>Ride requests — pending / other</h2>
              <div className="booking-list">
                {otherRequestBookings.map((b) => (
                  <BookingCard
                    key={b.id}
                    b={b}
                    requestDeal
                    cancelling={cancelling}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="dashboard-section">
            <h2>Seat bookings</h2>
            {seatBookings.length === 0 ? (
              <EmptyState
                icon={FaTicketAlt}
                title="No seat bookings yet"
                message="Bookings from browsing posted vehicles show up here."
                action={
                  <Link to="/vehicles" className="btn btn-outline">
                    Browse vehicles
                  </Link>
                }
              />
            ) : (
              <div className="booking-list">
                {seatBookings.map((b) => (
                  <BookingCard
                    key={b.id}
                    b={b}
                    cancelling={cancelling}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
