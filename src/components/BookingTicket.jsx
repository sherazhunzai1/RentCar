import {
  FaArrowRight,
  FaRegCalendarAlt,
  FaRegClock,
  FaChair,
  FaUser,
  FaIdCard,
  FaCarSide,
} from 'react-icons/fa'
import Logo from './Logo'
import UserAvatar from './UserAvatar'
import { getVehicleType } from '../data/constants'
import { formatCurrency, formatDate, formatTime } from '../utils/format'

function parseMaybeJson(value) {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function normalizeTicketSeats(booking) {
  let list = parseMaybeJson(booking?.seats)
  if (!Array.isArray(list) || !list.length) {
    const prices = parseMaybeJson(booking?.seatPrices)
    if (Array.isArray(prices)) list = prices.map((p) => (p && p.seat != null ? p.seat : p))
  }
  if (!Array.isArray(list)) return []
  return [...new Set(list.map((s) => Number(s)).filter((n) => Number.isInteger(n) && n > 0))].sort(
    (a, b) => a - b,
  )
}

export default function BookingTicket({ booking }) {
  if (!booking) return null

  const type = getVehicleType(booking.vehicleType)
  const TypeIcon = type.icon
  const seats = normalizeTicketSeats(booking)
  const isWhole = booking.bookingType === 'whole'
  const gender =
    booking.gender === 'male' || booking.gender === 'female' ? booking.gender : null
  const status = booking.status || 'confirmed'

  return (
    <article className="boarding-ticket" aria-label="Boarding ticket">
      <header className="boarding-ticket-header">
        <div className="boarding-ticket-brand brand">
          <Logo />
        </div>
        <div className="boarding-ticket-status">
          <span className={`status-pill ${status === 'confirmed' ? 'confirmed' : status === 'pending' ? 'pending' : 'cancelled'}`}>
            {status === 'confirmed' ? 'Confirmed' : status}
          </span>
          <small>Boarding ticket</small>
        </div>
      </header>

      <div className="boarding-ticket-route">
        <div>
          <span className="boarding-ticket-city-label">From</span>
          <strong>{booking.fromCity}</strong>
        </div>
        <FaArrowRight className="boarding-ticket-arrow" aria-hidden="true" />
        <div>
          <span className="boarding-ticket-city-label">To</span>
          <strong>{booking.toCity}</strong>
        </div>
      </div>

      <div className="boarding-ticket-grid">
        <div>
          <small><FaUser /> Passenger</small>
          <strong className="boarding-ticket-person">
            <UserAvatar src={booking.passengerAvatarUrl} name={booking.passengerName} size="sm" />
            <span>
              {booking.passengerName}
              {gender ? ` · ${gender}` : ''}
            </span>
          </strong>
        </div>
        <div>
          <small><FaIdCard /> Booking ref</small>
          <strong className="boarding-ticket-ref">{booking.bookingRef}</strong>
        </div>
        <div>
          <small><FaRegCalendarAlt /> Date</small>
          <strong>{formatDate(booking.date)}</strong>
        </div>
        <div>
          <small><FaRegClock /> Departure</small>
          <strong>{formatTime(booking.time)}</strong>
        </div>
        <div>
          <small><FaChair /> Seat{seats.length === 1 ? '' : 's'}</small>
          <strong>
            {isWhole
              ? `Whole vehicle (${seats.length || 'all'})`
              : seats.length
                ? seats.map((n) => `Seat ${n}`).join(', ')
                : '—'}
          </strong>
        </div>
        <div>
          <small><FaCarSide /> Vehicle</small>
          <strong>
            <span className="boarding-ticket-vtype">
              <TypeIcon /> {type.label}
            </span>
            {' · '}
            {booking.vehicleName}
          </strong>
        </div>
        {(booking.driverName || booking.driverAvatarUrl) && (
          <div>
            <small>Driver</small>
            <strong className="boarding-ticket-person">
              <UserAvatar src={booking.driverAvatarUrl} name={booking.driverName || 'Driver'} size="sm" />
              <span>{booking.driverName || 'Driver'}</span>
            </strong>
          </div>
        )}
      </div>

      {seats.length > 0 && !isWhole && (
        <div className="boarding-ticket-seats">
          {seats.map((n) => (
            <span key={n} className={`seat-chip confirm-seat-chip ${gender || ''}`}>
              Seat {n}
              {gender ? (
                <em className={`seat-chip-gender ${gender}`}>
                  {gender === 'female' ? 'F' : 'M'}
                </em>
              ) : null}
            </span>
          ))}
        </div>
      )}

      <footer className="boarding-ticket-footer">
        <div>
          <small>Total paid ({booking.paymentMethod})</small>
          <strong>{formatCurrency(booking.totalAmount)}</strong>
        </div>
        <p>Show this ticket to your driver at departure · gaadi.pk</p>
      </footer>
    </article>
  )
}
