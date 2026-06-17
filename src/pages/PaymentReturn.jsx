import { useEffect, useState } from 'react'
import { Navigate, useSearchParams, Link } from 'react-router-dom'
import { FaTimesCircle, FaRedo, FaListUl } from 'react-icons/fa'
import { getBookingById } from '../services/bookingService'
import Seo from '../components/Seo'

// Landing page the payment gateway (JazzCash) redirects the browser back to:
//   CLIENT_ORIGIN + CLIENT_PAYMENT_RETURN_PATH?bookingId=…&status=success|failed&ref=…
// On success we hand off to the normal confirmation screen; on failure we show
// a retry screen. The booking fetched from the backend is the source of truth.
export default function PaymentReturn() {
  const [params] = useSearchParams()
  const bookingId = params.get('bookingId')
  const status = params.get('status')
  const ref = params.get('ref')

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(Boolean(bookingId))

  useEffect(() => {
    if (!bookingId) return
    getBookingById(bookingId)
      .then(setBooking)
      .catch(() => {}) // fall back to the query-string status below
      .finally(() => setLoading(false))
  }, [bookingId])

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    )
  }

  // Trust the booking's persisted status when we have it; otherwise the flag
  // the gateway sent us.
  const succeeded = booking ? booking.status === 'confirmed' : status === 'success'

  if (succeeded && bookingId) {
    return <Navigate to={`/booking/confirmation/${bookingId}`} replace />
  }

  return (
    <div className="container narrow checkout">
      <Seo title="Payment Status" noindex />
      <div className="confirm-hero">
        <div className="confirm-check confirm-fail">
          <FaTimesCircle />
        </div>
        <h1>Payment {status === 'failed' ? 'failed' : 'not completed'}</h1>
        <p>
          {booking
            ? `We couldn't confirm payment for your ${booking.fromCity} → ${booking.toCity} trip, so no seats were charged.`
            : 'Your payment was not completed and no seats were charged.'}{' '}
          You can try booking again.
        </p>
        {ref && (
          <div className="booking-ref">
            <span>Transaction reference</span>
            <strong>{ref}</strong>
          </div>
        )}
      </div>

      <div className="confirm-actions">
        {booking ? (
          <Link to={`/vehicles/${booking.vehicleId}`} className="btn btn-primary btn-lg">
            <FaRedo /> Try Again
          </Link>
        ) : (
          <Link to="/vehicles" className="btn btn-primary btn-lg">
            <FaRedo /> Browse Vehicles
          </Link>
        )}
        <Link to="/my-bookings" className="btn btn-outline btn-lg">
          <FaListUl /> My Bookings
        </Link>
      </div>
    </div>
  )
}
