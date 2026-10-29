import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import {
  FaArrowLeft,
  FaLock,
  FaMoneyBillWave,
  FaShieldAlt,
  FaCheckCircle,
} from 'react-icons/fa'
import Stepper from '../components/Stepper'
import { useBooking } from '../context/BookingContext'
import { createBooking } from '../services/bookingService'
import { bookRideOffer } from '../services/rideRequestService'
import { formatCurrency } from '../utils/format'
import { computePricing, SERVICE_FEE_RATE } from '../utils/pricing'
import Seo from '../components/Seo'

const METHODS = [
  { id: 'safepay', label: 'Safepay (Card / Online)', icon: FaShieldAlt },
  { id: 'cash', label: 'Cash on Boarding', icon: FaMoneyBillWave },
]

function offerPricing(price) {
  const subtotal = Number(price) || 0
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE)
  return { subtotal, serviceFee, total: subtotal + serviceFee }
}

export default function Payment() {
  const { draft, clearBooking } = useBooking()
  const navigate = useNavigate()

  const [method, setMethod] = useState('safepay')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  const isOffer = draft?.type === 'offer'

  if (!draft) {
    return <Navigate to="/vehicles" replace />
  }

  if (!isOffer && !draft.bookWholeVehicle && !draft.seats?.length) {
    return <Navigate to="/vehicles" replace />
  }

  if (isOffer && (!draft.offer || !draft.request)) {
    return <Navigate to="/requests" replace />
  }

  let subtotal
  let serviceFee
  let total
  let summaryRoute
  let summaryLine

  if (isOffer) {
    ;({ subtotal, serviceFee, total } = offerPricing(draft.offer.price))
    summaryRoute = `${draft.request.fromCity} → ${draft.request.toCity}`
    summaryLine = `${draft.offer.vehicleName}${
      draft.offer.vehicleNumber ? ` (${draft.offer.vehicleNumber})` : ''
    } · ${draft.request.seatsNeeded} seat${
      draft.request.seatsNeeded > 1 ? 's' : ''
    } (agreed fare)`
  } else {
    const pricing = computePricing(draft.vehicle, {
      seats: draft.seats,
      bookWholeVehicle: draft.bookWholeVehicle,
    })
    ;({ subtotal, serviceFee, total } = pricing)
    summaryRoute = `${draft.vehicle.fromCity} → ${draft.vehicle.toCity}`
    summaryLine = draft.bookWholeVehicle
      ? `Whole vehicle (${draft.vehicle.totalSeats} seats)`
      : `Seats ${draft.seats.join(', ')}`
  }

  const handlePay = async (e) => {
    e.preventDefault()
    setError('')
    setProcessing(true)
    try {
      let booking
      if (isOffer) {
        booking = await bookRideOffer(draft.offer.id, method)
      } else {
        booking = await createBooking({
          vehicle: draft.vehicle,
          seats: draft.seats,
          bookWholeVehicle: draft.bookWholeVehicle,
          payment: { method },
        })
      }

      if (booking?.payment?.redirectUrl) {
        clearBooking()
        window.location.href = booking.payment.redirectUrl
        return
      }

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
      : `Pay ${formatCurrency(total)} with Safepay`

  const backTo = isOffer ? '/requests' : '/booking'

  return (
    <div className="container narrow checkout">
      <Seo title="Payment" noindex />
      {!isOffer && <Stepper active={1} />}
      <h1 className="checkout-title">{isOffer ? 'Confirm ride request' : 'Payment'}</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="checkout-grid">
        <form className="checkout-main" onSubmit={handlePay}>
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

          {method === 'safepay' && (
            <div className="card">
              <h3 className="card-section-title">Pay with Safepay</h3>
              <p className="muted-note">
                You&apos;ll be securely redirected to Safepay to authorize{' '}
                <strong>{formatCurrency(total)}</strong>. After paying, you&apos;ll return here
                automatically and your booking will be confirmed. Card details never touch gaadi.pk.
              </p>
              {(import.meta.env.DEV || import.meta.env.VITE_SAFEPAY_SHOW_TEST_CARDS === 'true') && (
                <div className="alert" style={{ marginTop: 12 }}>
                  <strong>Sandbox only — avoid PAYER_AUTH_ENROLLMENT failures</strong>
                  <p className="muted-note" style={{ margin: '8px 0 0' }}>
                    Use Safepay&apos;s official dummy card (not Stripe/Google test cards):
                  </p>
                  <ul className="muted-note" style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                    <li>Mastercard: <code>5200 0000 0000 1096</code></li>
                    <li>Or Visa: <code>4456 5300 0000 1096</code></li>
                    <li>Expiry must be <code>03/28</code> · CVC <code>111</code></li>
                    <li>Name: Abdul Qudoos · Country: Pakistan · City: Karachi</li>
                    <li>Phone: <code>+92 302 1111111</code> · use a fresh email if card was overused</li>
                  </ul>
                </div>
              )}
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
            <FaLock />{' '}
            {method === 'safepay'
              ? 'You will complete payment securely on Safepay.'
              : 'Your seats are reserved; pay the driver when you board.'}
          </p>
        </form>

        <aside className="checkout-aside">
          <div className="card summary-card">
            <h3>Order summary</h3>
            <div className="summary-row">
              <span>{summaryRoute}</span>
            </div>
            <div className="summary-row">
              <span>{summaryLine}</span>
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
            <div className="checkout-actions">
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={processing} onClick={handlePay}>
                {processing ? 'Processing…' : (<><FaLock /> {payLabel}</>)}
              </button>
              <Link to={backTo} className="btn btn-ghost btn-block">
                <FaArrowLeft /> Back
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
