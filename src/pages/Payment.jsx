import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import {
  FaArrowLeft,
  FaLock,
  FaRegCreditCard,
  FaMoneyBillWave,
  FaMobileAlt,
  FaCheckCircle,
} from 'react-icons/fa'
import Stepper from '../components/Stepper'
import { useBooking } from '../context/BookingContext'
import { createBooking } from '../services/bookingService'
import { formatCurrency } from '../utils/format'

const METHODS = [
  { id: 'jazzcash', label: 'JazzCash', icon: FaMobileAlt },
  { id: 'card', label: 'Credit / Debit Card', icon: FaRegCreditCard },
  { id: 'cash', label: 'Cash on Boarding', icon: FaMoneyBillWave },
]

export default function Payment() {
  const { draft, clearBooking } = useBooking()
  const navigate = useNavigate()

  const [method, setMethod] = useState('jazzcash')
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  if (!draft || !draft.seats?.length) {
    return <Navigate to="/vehicles" replace />
  }

  const { vehicle, seats } = draft
  const subtotal = seats.length * vehicle.pricePerSeat
  const serviceFee = Math.round(subtotal * 0.05)
  const total = subtotal + serviceFee

  // Light formatting so the demo card input feels real.
  const onCardNumber = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
    setCard({ ...card, number: digits.replace(/(.{4})/g, '$1 ').trim() })
  }
  const onExpiry = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
    setCard({ ...card, expiry: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits })
  }
  const onCvv = (e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })

  const handlePay = async (e) => {
    e.preventDefault()
    setError('')
    setProcessing(true)
    try {
      const booking = await createBooking({
        vehicle,
        seats,
        payment: { method, ...card },
      })

      // Gateway-hosted payment (e.g. JazzCash): the backend returns a payment
      // object with a redirectUrl. Hand the browser off to the provider; it
      // will return us to /payment/return after the transaction.
      if (booking?.payment?.redirectUrl) {
        clearBooking()
        window.location.href = booking.payment.redirectUrl
        return
      }

      // Methods that settle immediately (card / cash): booking is confirmed.
      clearBooking()
      navigate(`/booking/confirmation/${booking.id}`, { replace: true })
    } catch (err) {
      setError(err.message)
      setProcessing(false)
    }
  }

  const payLabel =
    method === 'cash'
      ? 'Reserve Seats'
      : method === 'jazzcash'
        ? `Pay ${formatCurrency(total)} with JazzCash`
        : `Pay ${formatCurrency(total)}`

  return (
    <div className="container narrow checkout">
      <Stepper active={1} />
      <h1 className="checkout-title">Payment</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="checkout-grid">
        <form className="checkout-main" onSubmit={handlePay}>
          {/* Method picker */}
          <div className="card">
            <h3 className="card-section-title">Payment method</h3>
            <div className="method-grid">
              {METHODS.map((m) => {
                const Icon = m.icon
                return (
                  <button
                    type="button"
                    key={m.id}
                    className={`method-option ${method === m.id ? 'active' : ''}`}
                    onClick={() => setMethod(m.id)}
                  >
                    <Icon />
                    <span>{m.label}</span>
                    {method === m.id && <FaCheckCircle className="method-check" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* JazzCash — redirect flow */}
          {method === 'jazzcash' && (
            <div className="card">
              <h3 className="card-section-title">Pay with JazzCash</h3>
              <p className="muted-note">
                You&apos;ll be securely redirected to JazzCash to authorize{' '}
                <strong>{formatCurrency(total)}</strong>. After paying, you&apos;ll return here
                automatically and your booking will be confirmed.
              </p>
            </div>
          )}

          {/* Card form */}
          {method === 'card' && (
            <div className="card">
              <h3 className="card-section-title">Card details</h3>
              <div className="field">
                <label>Cardholder name</label>
                <input
                  type="text"
                  placeholder="Name on card"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Card number</label>
                <div className="input-icon">
                  <FaRegCreditCard />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={card.number}
                    onChange={onCardNumber}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Expiry</label>
                  <input type="text" placeholder="MM/YY" value={card.expiry} onChange={onExpiry} required />
                </div>
                <div className="field">
                  <label>CVV</label>
                  <input type="password" placeholder="123" value={card.cvv} onChange={onCvv} required />
                </div>
              </div>
            </div>
          )}

          {/* Cash on boarding */}
          {method === 'cash' && (
            <div className="card">
              <p className="muted-note">
                Reserve now and pay <strong>{formatCurrency(total)}</strong> in cash when you board.
                Your seat(s) will be held for this trip.
              </p>
            </div>
          )}

          <p className="secure-note">
            <FaLock />{' '}
            {method === 'jazzcash'
              ? 'You will complete payment securely on JazzCash.'
              : 'Card & cash options are simulated for this demo.'}
          </p>
        </form>

        <aside className="checkout-aside">
          <div className="card summary-card">
            <h3>Order summary</h3>
            <div className="summary-row">
              <span>{vehicle.fromCity} → {vehicle.toCity}</span>
            </div>
            <div className="summary-row">
              <span>Seats {seats.join(', ')}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Service fee</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={processing} onClick={handlePay}>
              {processing ? 'Processing…' : (<><FaLock /> {payLabel}</>)}
            </button>
            <Link to="/booking" className="btn btn-ghost btn-block">
              <FaArrowLeft /> Back
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
