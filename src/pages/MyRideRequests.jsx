import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaArrowRight,
  FaHandHoldingUsd,
  FaPlus,
  FaRegCalendarAlt,
  FaTimesCircle,
} from 'react-icons/fa'
import EmptyState from '../components/EmptyState'
import UserAvatar from '../components/UserAvatar'
import ChatButton from '../components/ChatButton'
import { getVehicleType } from '../data/constants'
import {
  getMyRideRequests,
  cancelRideRequest,
  acceptRideOffer,
  declineRideOffer,
} from '../services/rideRequestService'
import { getBookingById } from '../services/bookingService'
import { useBooking } from '../context/BookingContext'
import { useConfirm } from '../context/ConfirmContext'
import { useToast } from '../context/ToastContext'
import { formatCurrency, formatDate } from '../utils/format'
import { SERVICE_FEE_RATE } from '../utils/pricing'
import Seo from '../components/Seo'

function offerTotal(price) {
  const subtotal = Number(price) || 0
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE)
  return { subtotal, serviceFee, total: subtotal + serviceFee }
}

export default function MyRideRequests() {
  const navigate = useNavigate()
  const { startOfferPayment } = useBooking()
  const confirm = useConfirm()
  const toast = useToast()
  const [requests, setRequests] = useState([])
  const [bookingsById, setBookingsById] = useState({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  const hydrateBookings = async (list) => {
    const ids = list.map((r) => r.bookingId).filter(Boolean)
    if (!ids.length) {
      setBookingsById({})
      return
    }
    const entries = await Promise.all(
      ids.map(async (id) => {
        try {
          return [id, await getBookingById(id)]
        } catch {
          return [id, null]
        }
      })
    )
    setBookingsById(Object.fromEntries(entries.filter(([, b]) => b)))
  }

  const load = useCallback(() => {
    setLoading(true)
    return getMyRideRequests()
      .then(async (list) => {
        setRequests(list)
        await hydrateBookings(list)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const refreshQuiet = async () => {
    try {
      const list = await getMyRideRequests()
      setRequests(list)
      await hydrateBookings(list)
    } catch {
      /* keep current */
    }
  }

  const handleCancel = async (id) => {
    const ok = await confirm({
      title: 'Cancel ride request?',
      message: 'Pending driver offers will be withdrawn and this request will be closed.',
      confirmLabel: 'Cancel request',
      danger: true,
    })
    if (!ok) return
    setBusy(`cancel-${id}`)
    setError('')
    try {
      await cancelRideRequest(id)
      await refreshQuiet()
      toast('Ride request cancelled.', 'success')
    } catch (e) {
      setError(e.message)
      toast(e.message, 'error')
    } finally {
      setBusy(null)
    }
  }

  const handleAcceptOffer = async (offerId) => {
    setBusy(`accept-${offerId}`)
    setError('')
    try {
      await acceptRideOffer(offerId)
      await refreshQuiet()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  const handleDeclineOffer = async (offerId) => {
    setBusy(`decline-${offerId}`)
    setError('')
    try {
      await declineRideOffer(offerId)
      await refreshQuiet()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  const handlePay = (request, offer) => {
    startOfferPayment({ offer, request })
    navigate('/payment')
  }

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="container section dashboard">
      <Seo title="My Ride Requests" path="/requests" noindex />
      <div className="dashboard-head">
        <div>
          <h1>My ride requests</h1>
          <p>Post a trip need, review driver offers, then pay to confirm.</p>
        </div>
        <Link to="/requests/new" className="btn btn-primary">
          <FaPlus /> New request
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {requests.length === 0 ? (
        <EmptyState
          icon={FaHandHoldingUsd}
          title="No requests yet"
          message="Ask drivers for a ride by posting your route, date, and price."
          action={
            <Link to="/requests/new" className="btn btn-primary">
              Create a request
            </Link>
          }
        />
      ) : (
        <div className="request-list">
          {requests.map((r) => {
            const type = getVehicleType(r.vehicleType)
            const TypeIcon = type.icon
            const offers = r.offers || []
            const accepted = offers.find((o) => o.status === 'accepted' || o.id === r.acceptedOfferId)
            const pendingOffers = offers.filter((o) => o.status === 'pending')
            const canCancel = r.status === 'open' || (r.status === 'matched' && !r.bookingId)

            return (
              <div key={r.id} className="card request-card">
                <div className="request-card-top">
                  <div className="vehicle-type-badge">
                    <TypeIcon />
                    <span>{type.label}</span>
                  </div>
                  <span className={`status-pill status-${r.status}`}>{r.status}</span>
                </div>

                <div className="request-route">
                  <strong>{r.fromCity}</strong>
                  <FaArrowRight className="request-arrow" />
                  <strong>{r.toCity}</strong>
                </div>

                <div className="request-meta">
                  <span>
                    <FaRegCalendarAlt /> {formatDate(r.date)}
                  </span>
                  <span>{r.seatsNeeded} seat{r.seatsNeeded > 1 ? 's' : ''}</span>
                  <span>Your price: <strong>{formatCurrency(r.offeredPrice)}</strong></span>
                </div>

                {r.note ? <p className="muted-note request-note">{r.note}</p> : null}

                {accepted && (
                  <div className="offer-block offer-accepted">
                    <div className="offer-head">
                      <UserAvatar src={accepted.driverAvatarUrl} name={accepted.driverName} size="sm" />
                      <div>
                        <strong>{accepted.driverName}</strong>
                        <div className="muted-note">
                          {accepted.vehicleName}
                          {accepted.vehicleNumber ? ` · ${accepted.vehicleNumber}` : ''}
                          {accepted.acceptAtAskPrice ? ' · accepted your price' : ' · counter-offer accepted'}
                        </div>
                      </div>
                      <strong className="offer-price">{formatCurrency(accepted.price)}</strong>
                    </div>
                    <div className="offer-actions">
                      {!r.bookingId && r.status === 'matched' && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handlePay(r, accepted)}
                        >
                          Pay &amp; confirm ({formatCurrency(offerTotal(accepted.price).total)})
                        </button>
                      )}
                      {r.bookingId && (
                        <>
                          <Link to={`/booking/confirmation/${r.bookingId}`} className="btn btn-outline">
                            View booking
                          </Link>
                          {bookingsById[r.bookingId] && (
                            <ChatButton
                              booking={bookingsById[r.bookingId]}
                              label="Chat with driver"
                            />
                          )}
                          <Link to="/my-bookings" className="btn btn-ghost btn-sm">
                            My bookings
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {pendingOffers.length > 0 && (
                  <div className="offer-list">
                    <h4 className="offer-list-title">Driver offers</h4>
                    {pendingOffers.map((o) => {
                      const totals = offerTotal(o.price)
                      return (
                        <div key={o.id} className="offer-block">
                          <div className="offer-head">
                            <UserAvatar src={o.driverAvatarUrl} name={o.driverName} size="sm" />
                            <div>
                              <strong>{o.driverName}</strong>
                              <div className="muted-note">
                                {o.vehicleName}
                                {o.vehicleNumber ? ` · ${o.vehicleNumber}` : ''}
                                {' · offers '}
                                {formatCurrency(o.price)}
                                {' '}(+ {formatCurrency(totals.serviceFee)} fee → {formatCurrency(totals.total)})
                              </div>
                              {o.message ? <p className="offer-msg">{o.message}</p> : null}
                            </div>
                          </div>
                          <div className="offer-actions">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={busy === `accept-${o.id}`}
                              onClick={() => handleAcceptOffer(o.id)}
                            >
                              Accept offer
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              disabled={busy === `decline-${o.id}`}
                              onClick={() => handleDeclineOffer(o.id)}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {r.status === 'open' && pendingOffers.length === 0 && (
                  <p className="muted-note">Waiting for drivers to respond…</p>
                )}

                {canCancel && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm request-cancel"
                    disabled={busy === `cancel-${r.id}`}
                    onClick={() => handleCancel(r.id)}
                  >
                    <FaTimesCircle /> Cancel request
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
