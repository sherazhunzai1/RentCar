import { useEffect, useState } from 'react'
import { Navigate, useSearchParams, Link } from 'react-router-dom'
import { FaTimesCircle, FaRedo, FaListUl } from 'react-icons/fa'
import { getBookingById } from '../services/bookingService'
import Seo from '../components/Seo'

const POLL_MS = 1500
const MAX_POLLS = 8

// Landing page after Safepay / JazzCash redirects the browser back:
//   CLIENT_ORIGIN + CLIENT_PAYMENT_RETURN_PATH?bookingId=…&status=success|failed|pending&ref=…
// The booking fetched from the backend is the source of truth. We briefly poll
// while status is still "pending" so a late webhook can confirm payment.
export default function PaymentReturn() {
  const [params] = useSearchParams()
  const bookingId = params.get('bookingId')
  const status = params.get('status')
  const ref = params.get('ref')

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(Boolean(bookingId))
  const [polls, setPolls] = useState(0)

  useEffect(() => {
    if (!bookingId) return
    let cancelled = false
    let timer

    const load = async (attempt) => {
      try {
        const b = await getBookingById(bookingId)
        if (cancelled) return
        setBooking(b)
        if (b.status === 'pending' && attempt < MAX_POLLS) {
          timer = setTimeout(() => {
            setPolls(attempt + 1)
            load(attempt + 1)
          }, POLL_MS)
          return
        }
      } catch {
        // fall back to the query-string status below
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load(0)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [bookingId])

  if (loading || (booking?.status === 'pending' && polls < MAX_POLLS && status !== 'failed')) {
    return (
      <div className="page-center">
        <div className="spinner" />
        <p className="muted-note" style={{ marginTop: 16 }}>Confirming your payment…</p>
      </div>
    )
  }

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
