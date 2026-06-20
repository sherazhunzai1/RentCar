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
  FaCarSide,
} from 'react-icons/fa'
import SeatMap from '../components/SeatMap'
import StarRating from '../components/StarRating'
import Seo, { SITE } from '../components/Seo'
import { getVehicleById } from '../services/vehicleService'
import { getVehicleType } from '../data/constants'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import { computePricing, isFrontSeat } from '../utils/pricing'
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
  const [wholeVehicle, setWholeVehicle] = useState(false)

  useEffect(() => {
    setLoading(true)
    getVehicleById(id)
      .then(setVehicle)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  // Selecting a seat exits whole-vehicle mode; they're mutually exclusive.
  const toggleSeat = (seat) => {
    setWholeVehicle(false)
    setSelected((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat].sort((a, b) => a - b),
    )
  }

  const chooseWholeVehicle = () => {
    setWholeVehicle(true)
    setSelected([])
  }

  const proceed = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/vehicles/${id}` } })
      return
    }
    startBooking(vehicle, { seats: selected, bookWholeVehicle: wholeVehicle })
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
  const frontSeats = Array.isArray(vehicle.frontSeats) ? vehicle.frontSeats : []
  const hasFrontPricing = vehicle.frontSeatPrice != null && frontSeats.length > 0
  const wholeOffered = vehicle.wholeVehiclePrice != null
  const wholeAvailable = wholeOffered && vehicle.bookedSeats.length === 0

  const pricing = computePricing(vehicle, { seats: selected, bookWholeVehicle: wholeVehicle })
  const hasSelection = wholeVehicle || selected.length > 0

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

              {/* Per-seat pricing legend */}
              <div className="price-legend">
                <span className="price-legend-item">
                  Standard <strong>{formatCurrency(vehicle.pricePerSeat)}</strong>
                </span>
                {hasFrontPricing && (
                  <span className="price-legend-item price-legend-front">
                    Front seat <strong>{formatCurrency(vehicle.frontSeatPrice)}</strong>
                  </span>
                )}
              </div>

              {available === 0 ? (
                <div className="soldout-banner">This trip is fully booked.</div>
              ) : (
                <>
                  {wholeVehicle && (
                    <div className="alert alert-info whole-vehicle-note">
                      You&apos;re booking the <strong>whole vehicle</strong>. Tap a seat to switch to
                      individual seats instead.
                    </div>
                  )}
                  <SeatMap
                    totalSeats={vehicle.totalSeats}
                    bookedSeats={vehicle.bookedSeats}
                    selectedSeats={wholeVehicle ? [] : selected}
                    frontSeats={frontSeats}
                    seatGenders={vehicle.seatGenders || {}}
                    onToggle={toggleSeat}
                    layout={type.seatLayout}
                    maxSelectable={available}
                  />
                </>
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

              {/* Whole-vehicle option */}
              {wholeOffered && (
                <button
                  type="button"
                  className={`whole-option ${wholeVehicle ? 'active' : ''}`}
                  onClick={chooseWholeVehicle}
                  disabled={!wholeAvailable}
                >
                  <span className="whole-option-head">
                    <span><FaCarSide /> Book whole vehicle</span>
                    <strong>{formatCurrency(vehicle.wholeVehiclePrice)}</strong>
                  </span>
                  <small>
                    {wholeAvailable
                      ? `Reserve all ${vehicle.totalSeats} seats at one flat price`
                      : 'Unavailable — some seats are already booked'}
                  </small>
                </button>
              )}

              {wholeVehicle ? (
                <div className="summary-row">
                  <span>Whole vehicle ({vehicle.totalSeats} seats)</span>
                  <strong>{formatCurrency(pricing.subtotal)}</strong>
                </div>
              ) : (
                <>
                  <div className="summary-row summary-seats">
                    <span>Selected seats</span>
                    <span className="seat-tags">
                      {selected.length
                        ? selected.map((s) => (
                            <span
                              key={s}
                              className={`seat-tag${isFrontSeat(vehicle, s) && hasFrontPricing ? ' front' : ''}`}
                            >
                              {s}
                            </span>
                          ))
                        : '—'}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(pricing.subtotal)}</span>
                  </div>
                </>
              )}

              {hasSelection && (
                <div className="summary-row">
                  <span>Service fee (3%)</span>
                  <span>{formatCurrency(pricing.serviceFee)}</span>
                </div>
              )}

              <div className="summary-total">
                <span>Total</span>
                <strong>{formatCurrency(hasSelection ? pricing.total : 0)}</strong>
              </div>

              {isDriver ? (
                <div className="alert alert-info">
                  You&apos;re signed in as a driver. Switch to a passenger account to book seats.
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-block btn-lg"
                  disabled={!hasSelection}
                  onClick={proceed}
                >
                  {!hasSelection ? 'Select a seat to continue' : 'Continue to Booking'}
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
