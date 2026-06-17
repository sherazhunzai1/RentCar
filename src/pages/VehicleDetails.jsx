import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  FaArrowRight,
  FaRegCalendarAlt,
  FaRegClock,
  FaChair,
  FaCheckCircle,
  FaUserCircle,
  FaIdBadge,
  FaArrowLeft,
} from 'react-icons/fa'
import SeatMap from '../components/SeatMap'
import StarRating from '../components/StarRating'
import Seo, { SITE } from '../components/Seo'
import { getVehicleById } from '../services/vehicleService'
import { getVehicleType } from '../data/constants'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'

export default function VehicleDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isDriver } = useAuth()
  const { startBooking } = useBooking()

  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState([])

  useEffect(() => {
    setLoading(true)
    getVehicleById(id)
      .then(setVehicle)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const toggleSeat = (seat) => {
    setSelected((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat].sort((a, b) => a - b),
    )
  }

  const proceed = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/vehicles/${id}` } })
      return
    }
    startBooking(vehicle, selected)
    navigate('/booking')
  }

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="container narrow section">
        <EmptyDetail message={error} />
      </div>
    )
  }

  const type = getVehicleType(vehicle.vehicleType)
  const TypeIcon = type.icon
  const available = vehicle.totalSeats - vehicle.bookedSeats.length
  const total = selected.length * vehicle.pricePerSeat

  const seoTitle = `${vehicle.fromCity} to ${vehicle.toCity} by ${type.label}`
  const seoDescription = `Book a seat on ${vehicle.vehicleName} (${type.label}) from ${vehicle.fromCity} to ${vehicle.toCity} on ${formatDate(vehicle.date)} at ${formatTime(vehicle.time)}. ${available} seat${available === 1 ? '' : 's'} available from ${formatCurrency(vehicle.pricePerSeat)} per seat on gaadi.pk.`
  const seoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: 'Vehicles', item: `${SITE.url}/vehicles` },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${vehicle.fromCity} to ${vehicle.toCity}`,
        item: `${SITE.url}/vehicles/${vehicle.id}`,
      },
    ],
  }

  return (
    <div className="details">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={`/vehicles/${vehicle.id}`}
        type="article"
        jsonLd={seoJsonLd}
      />
      <div className="container">
        <Link to="/vehicles" className="back-link">
          <FaArrowLeft /> Back to listings
        </Link>

        <div className="details-grid">
          {/* Left: info + seat map */}
          <div className="details-main">
            <div className="details-header card">
              <div className="details-title">
                <div className="vehicle-type-badge">
                  <TypeIcon />
                  <span>{type.label}</span>
                </div>
                <h1>{vehicle.vehicleName}</h1>
                <p className="vehicle-number">Reg #: {vehicle.vehicleNumber}</p>
                <StarRating value={vehicle.rating} />
              </div>

              <div className="details-route">
                <div className="route big">
                  <div className="route-point">
                    <span className="dot from" />
                    <div>
                      <strong>{vehicle.fromCity}</strong>
                      <small>Departure</small>
                    </div>
                  </div>
                  <FaArrowRight className="route-arrow" />
                  <div className="route-point">
                    <span className="dot to" />
                    <div>
                      <strong>{vehicle.toCity}</strong>
                      <small>Destination</small>
                    </div>
                  </div>
                </div>
                <div className="details-when">
                  <span><FaRegCalendarAlt /> {formatDate(vehicle.date)}</span>
                  <span><FaRegClock /> {formatTime(vehicle.time)}</span>
                  <span><FaChair /> {available} of {vehicle.totalSeats} seats available</span>
                </div>
              </div>
            </div>

            {vehicle.amenities?.length > 0 && (
              <div className="card amenities-card">
                <h3>Amenities</h3>
                <div className="amenity-list">
                  {vehicle.amenities.map((a) => (
                    <span key={a} className="amenity">
                      <FaCheckCircle /> {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="card seat-card">
              <div className="seat-card-head">
                <h3>Select your seat{available !== 1 ? 's' : ''}</h3>
                <p>Tap an available seat to add it to your booking.</p>
              </div>
              {available === 0 ? (
                <div className="soldout-banner">This trip is fully booked.</div>
              ) : (
                <SeatMap
                  totalSeats={vehicle.totalSeats}
                  bookedSeats={vehicle.bookedSeats}
                  selectedSeats={selected}
                  onToggle={toggleSeat}
                  layout={type.seatLayout}
                  maxSelectable={available}
                />
              )}
            </div>

            {/* Driver */}
            <div className="card driver-card">
              <h3>Your driver</h3>
              <div className="driver-info">
                <FaUserCircle className="driver-avatar" />
                <div>
                  <strong>{vehicle.driverName}</strong>
                  <span className="driver-meta">
                    <FaIdBadge /> Verified driver
                  </span>
                </div>
                <StarRating value={vehicle.rating} showvalue={false} />
              </div>
            </div>
          </div>

          {/* Right: sticky summary */}
          <aside className="details-aside">
            <div className="card summary-card">
              <h3>Booking summary</h3>
              <div className="summary-row">
                <span>Price per seat</span>
                <strong>{formatCurrency(vehicle.pricePerSeat)}</strong>
              </div>
              <div className="summary-row">
                <span>Selected seats</span>
                <strong>{selected.length ? selected.join(', ') : '—'}</strong>
              </div>
              <div className="summary-row">
                <span>Seats × price</span>
                <span>
                  {selected.length} × {formatCurrency(vehicle.pricePerSeat)}
                </span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>

              {isDriver ? (
                <div className="alert alert-info">
                  You&apos;re signed in as a driver. Switch to a passenger account to book seats.
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-block btn-lg"
                  disabled={selected.length === 0}
                  onClick={proceed}
                >
                  {selected.length === 0 ? 'Select a seat to continue' : 'Continue to Booking'}
                </button>
              )}

              {!isAuthenticated && (
                <p className="summary-hint">
                  You&apos;ll be asked to <Link to="/login">log in</Link> to complete your booking.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function EmptyDetail({ message }) {
  return (
    <div className="empty-state">
      <h3>Vehicle not found</h3>
      <p>{message || 'This listing may have been removed.'}</p>
      <Link to="/vehicles" className="btn btn-primary">
        Browse vehicles
      </Link>
    </div>
  )
}
