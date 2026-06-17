import { Navigate, useNavigate, Link } from 'react-router-dom'
import {
  FaArrowRight,
  FaArrowLeft,
  FaRegCalendarAlt,
  FaRegClock,
  FaChair,
  FaUser,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa'
import { useBooking } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { getVehicleType } from '../data/constants'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import Stepper from '../components/Stepper'
import Seo from '../components/Seo'

export default function Booking() {
  const { draft } = useBooking()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!draft || !draft.seats?.length) {
    return <Navigate to="/vehicles" replace />
  }

  const { vehicle, seats } = draft
  const type = getVehicleType(vehicle.vehicleType)
  const TypeIcon = type.icon
  const subtotal = seats.length * vehicle.pricePerSeat
  const serviceFee = Math.round(subtotal * 0.05)
  const total = subtotal + serviceFee

  return (
    <div className="container narrow checkout">
      <Seo title="Review Booking" noindex />
      <Stepper active={0} />

      <h1 className="checkout-title">Review your booking</h1>

      <div className="checkout-grid">
        <div className="checkout-main">
          {/* Trip */}
          <div className="card">
            <h3 className="card-section-title">Trip details</h3>
            <div className="trip-summary">
              <div className="vehicle-type-badge">
                <TypeIcon />
                <span>{type.label}</span>
              </div>
              <div>
                <strong>{vehicle.vehicleName}</strong>
                <p className="vehicle-number">{vehicle.vehicleNumber}</p>
              </div>
            </div>

            <div className="route big checkout-route">
              <div className="route-point">
                <span className="dot from" />
                <span>{vehicle.fromCity}</span>
              </div>
              <FaArrowRight className="route-arrow" />
              <div className="route-point">
                <span className="dot to" />
                <span>{vehicle.toCity}</span>
              </div>
            </div>

            <div className="details-when">
              <span><FaRegCalendarAlt /> {formatDate(vehicle.date)}</span>
              <span><FaRegClock /> {formatTime(vehicle.time)}</span>
            </div>
          </div>

          {/* Seats */}
          <div className="card">
            <h3 className="card-section-title">Selected seats</h3>
            <div className="seat-chips">
              {seats.map((s) => (
                <span key={s} className="seat-chip">
                  <FaChair /> Seat {s}
                </span>
              ))}
            </div>
            <Link to={`/vehicles/${vehicle.id}`} className="link-btn">
              Change seats
            </Link>
          </div>

          {/* Passenger */}
          <div className="card">
            <h3 className="card-section-title">Passenger details</h3>
            <div className="passenger-info">
              <span><FaUser /> {user.name}</span>
              <span><FaEnvelope /> {user.email}</span>
              {user.phone && <span><FaPhone /> {user.phone}</span>}
            </div>
          </div>
        </div>

        {/* Price summary */}
        <aside className="checkout-aside">
          <div className="card summary-card">
            <h3>Price summary</h3>
            <div className="summary-row">
              <span>{seats.length} seat(s) × {formatCurrency(vehicle.pricePerSeat)}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Service fee (5%)</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/payment')}>
              Proceed to Payment <FaArrowRight />
            </button>
            <Link to={`/vehicles/${vehicle.id}`} className="btn btn-ghost btn-block">
              <FaArrowLeft /> Back
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
