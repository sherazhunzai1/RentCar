import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FaCheckCircle,
  FaArrowRight,
  FaRegCalendarAlt,
  FaRegClock,
  FaChair,
  FaTicketAlt,
  FaListUl,
} from 'react-icons/fa'
import Stepper from '../components/Stepper'
import { getBookingById } from '../services/bookingService'
import { getVehicleType } from '../data/constants'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import Seo from '../components/Seo'

export default function BookingConfirmation() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBookingById(id)
      .then(setBooking)
      .catch(() => setBooking(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container narrow section">
        <div className="empty-state">
          <h3>Booking not found</h3>
          <Link to="/my-bookings" className="btn btn-primary">
            View my bookings
          </Link>
        </div>
      </div>
    )
  }

  const type = getVehicleType(booking.vehicleType)
  const TypeIcon = type.icon

  return (
    <div className="container narrow checkout">
      <Seo title="Booking Confirmed" noindex />
      <Stepper active={2} />

      <div className="confirm-hero">
        <div className="confirm-check">
          <FaCheckCircle />
        </div>
        <h1>Booking confirmed!</h1>
        <p>Your seat{booking.seats.length > 1 ? 's are' : ' is'} reserved. A confirmation has been sent to your email.</p>
        <div className="booking-ref">
          <FaTicketAlt />
          <span>Booking reference</span>
          <strong>{booking.bookingRef}</strong>
        </div>
      </div>

      <div className="card confirm-ticket">
        <div className="ticket-head">
          <div className="vehicle-type-badge">
            <TypeIcon />
            <span>{type.label}</span>
          </div>
          <span className="status-pill confirmed">Confirmed</span>
        </div>

        <h3>{booking.vehicleName}</h3>

        <div className="route big checkout-route">
          <div className="route-point">
            <span className="dot from" />
            <span>{booking.fromCity}</span>
          </div>
          <FaArrowRight className="route-arrow" />
          <div className="route-point">
            <span className="dot to" />
            <span>{booking.toCity}</span>
          </div>
        </div>

        <div className="ticket-grid">
          <div>
            <small><FaRegCalendarAlt /> Date</small>
            <strong>{formatDate(booking.date)}</strong>
          </div>
          <div>
            <small><FaRegClock /> Departure</small>
            <strong>{formatTime(booking.time)}</strong>
          </div>
          <div>
            <small><FaChair /> {booking.bookingType === 'whole' ? 'Booking' : 'Seats'}</small>
            <strong>
              {booking.bookingType === 'whole'
                ? `Whole vehicle (${booking.seats.length} seats)`
                : booking.seats.join(', ')}
            </strong>
          </div>
          <div>
            <small>Passenger</small>
            <strong>{booking.passengerName}</strong>
          </div>
        </div>

        <div className="ticket-total">
          <span>Total paid ({booking.paymentMethod})</span>
          <strong>{formatCurrency(booking.totalAmount)}</strong>
        </div>
      </div>

      <div className="confirm-actions">
        <Link to="/my-bookings" className="btn btn-primary btn-lg">
          <FaListUl /> View My Bookings
        </Link>
        <Link to="/vehicles" className="btn btn-outline btn-lg">
          Book Another Trip
        </Link>
      </div>
    </div>
  )
}
