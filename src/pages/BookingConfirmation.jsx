import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FaCheckCircle,
  FaTicketAlt,
  FaListUl,
  FaPrint,
  FaFilePdf,
  FaEnvelope,
} from 'react-icons/fa'
import Stepper from '../components/Stepper'
import BookingTicket, { normalizeTicketSeats } from '../components/BookingTicket'
import {
  getBookingById,
  downloadTicketPdf,
  emailTicket,
} from '../services/bookingService'
import Seo from '../components/Seo'

export default function BookingConfirmation() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getBookingById(id)
      .then(setBooking)
      .catch(() => setBooking(null))
      .finally(() => setLoading(false))
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    if (!booking) return
    setError('')
    setNotice('')
    setBusy('pdf')
    try {
      await downloadTicketPdf(booking.id, booking.bookingRef)
      setNotice('Ticket PDF downloaded.')
    } catch (err) {
      setError(err.message || 'Could not download PDF.')
    } finally {
      setBusy('')
    }
  }

  const handleEmail = async () => {
    if (!booking) return
    setError('')
    setNotice('')
    setBusy('email')
    try {
      const res = await emailTicket(booking.id)
      setNotice(res?.message || 'Ticket PDF sent to your email.')
    } catch (err) {
      setError(err.message || 'Could not send email.')
    } finally {
      setBusy('')
    }
  }

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

  const seats = normalizeTicketSeats(booking)
  const status = booking.status || 'confirmed'

  return (
    <div className="container narrow checkout confirm-page">
      <Seo title="Booking Confirmed" noindex />
      <div className="no-print">
        <Stepper active={2} />
      </div>

      <div className="confirm-hero no-print">
        <div className="confirm-check">
          <FaCheckCircle />
        </div>
        <h1>
          {status === 'confirmed'
            ? 'Booking confirmed!'
            : status === 'pending'
              ? 'Payment pending'
              : `Booking ${status}`}
        </h1>
        <p>
          {seats.length
            ? `Seat${seats.length > 1 ? 's' : ''} ${seats.join(', ')} ${
                seats.length > 1 ? 'are' : 'is'
              } reserved for you.`
            : 'Your seat is reserved.'}{' '}
          {status === 'confirmed'
            ? 'Your boarding ticket is below — a PDF copy is also sent to your email.'
            : null}
        </p>
        <div className="booking-ref">
          <FaTicketAlt />
          <span>Booking reference</span>
          <strong>{booking.bookingRef}</strong>
        </div>
      </div>

      {(notice || error) && (
        <div className={`alert ${error ? 'alert-error' : 'alert-info'} no-print`}>
          {error || notice}
        </div>
      )}

      <BookingTicket booking={booking} />

      <div className="ticket-toolbar no-print">
        <button type="button" className="btn btn-outline" onClick={handlePrint}>
          <FaPrint /> Print ticket
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={handleDownload}
          disabled={busy === 'pdf'}
        >
          <FaFilePdf /> {busy === 'pdf' ? 'Preparing…' : 'Download PDF'}
        </button>
        {status === 'confirmed' && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleEmail}
            disabled={busy === 'email'}
          >
            <FaEnvelope /> {busy === 'email' ? 'Sending…' : 'Email PDF'}
          </button>
        )}
      </div>

      <div className="confirm-actions no-print">
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
