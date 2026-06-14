import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import {
  FaArrowLeft,
  FaLock,
  FaRegCreditCard,
  FaMoneyBillWave,
  FaWallet,
  FaCheckCircle,
} from 'react-icons/fa'
import Stepper from '../components/Stepper'
import { useBooking } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { createBooking } from '../services/bookingService'
import { formatCurrency } from '../utils/format'

const METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: FaRegCreditCard },
  { id: 'wallet', label: 'Mobile Wallet', icon: FaWallet },
  { id: 'cash', label: 'Cash on Boarding', icon: FaMoneyBillWave },
]

export default function Payment() {
  const { draft, clearBooking } = useBooking()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [method, setMethod] = useState('card')
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
        user,
        seats,
        payment: { method, ...card },
      })
      clearBooking()
      navigate(`/booking/confirmation/${booking.id}`, { replace: true })
    } catch (err) {
      setError(err.message)
      setProcessing(false)
    }
  }

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

          {method === 'wallet' && (
            <div className="card">
              <h3 className="card-section-title">Mobile wallet</h3>
              <div className="field">
                <label>Wallet number</label>
                <input type="tel" placeholder="+92 3XX XXXXXXX" required />
              </div>
              <p className="muted-note">You&apos;ll receive a prompt on your phone to approve the payment.</p>
            </div>
          )}

          {method === 'cash' && (
            <div className="card">
              <p className="muted-note">
                Reserve now and pay <strong>{formatCurrency(total)}</strong> in cash when you board.
                Your seat(s) will be held for this trip.
              </p>
            </div>
          )}

          <p className="secure-note">
            <FaLock /> This is a demo checkout — no real payment is processed.
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
              {processing ? 'Processing…' : (
                <>
                  <FaLock /> {method === 'cash' ? 'Reserve Seats' : `Pay ${formatCurrency(total)}`}
                </>
              )}
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
