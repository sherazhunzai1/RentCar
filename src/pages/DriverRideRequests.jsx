import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaArrowRight,
  FaHandHoldingUsd,
  FaRegCalendarAlt,
} from 'react-icons/fa'
import EmptyState from '../components/EmptyState'
import UserAvatar from '../components/UserAvatar'
import { VEHICLE_TYPES, getVehicleType } from '../data/constants'
import {
  getOpenRideRequests,
  createRideOffer,
  withdrawRideOffer,
} from '../services/rideRequestService'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatDate } from '../utils/format'
import Seo from '../components/Seo'

export default function DriverRideRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ vehicleType: '', fromCity: '', toCity: '' })
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const [respondingId, setRespondingId] = useState(null)
  const [form, setForm] = useState({ price: '', message: '' })

  const hasProfileVehicle = Boolean(user?.vehicleType && user?.vehicleName && user?.vehicleNumber)
  const profileType = user?.vehicleType ? getVehicleType(user.vehicleType) : null
  const ProfileIcon = profileType?.icon

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const reqs = await getOpenRideRequests({
        status: 'open',
        vehicleType: filters.vehicleType || undefined,
        fromCity: filters.fromCity || undefined,
        toCity: filters.toCity || undefined,
      })
      setRequests(reqs)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [filters.vehicleType, filters.fromCity, filters.toCity])

  useEffect(() => {
    load()
  }, [load])

  const openRespond = (request) => {
    setRespondingId(request.id)
    setForm({
      price: String(request.offeredPrice || ''),
      message: '',
    })
  }

  const myOffer = (request) => (request.offers || []).find((o) => o.driverId === user.id)

  const handleAcceptAtPrice = async (request) => {
    if (!hasProfileVehicle) {
      setError('Add your vehicle details in Profile before offering.')
      return
    }
    setBusy(`accept-${request.id}`)
    setError('')
    try {
      await createRideOffer(request.id, { acceptAtAskPrice: true })
      setRespondingId(null)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  const handleCounter = async (request) => {
    if (!hasProfileVehicle) {
      setError('Add your vehicle details in Profile before offering.')
      return
    }
    const price = Number(form.price)
    if (!price || price <= 0) {
      setError('Enter a valid counter-offer price.')
      return
    }
    setBusy(`counter-${request.id}`)
    setError('')
    try {
      await createRideOffer(request.id, {
        price,
        message: form.message.trim() || undefined,
        acceptAtAskPrice: false,
      })
      setRespondingId(null)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  const handleWithdraw = async (offerId) => {
    setBusy(`withdraw-${offerId}`)
    setError('')
    try {
      await withdrawRideOffer(offerId)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  if (loading && requests.length === 0) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="container section dashboard">
      <Seo title="Passenger Requests" path="/driver/requests" noindex />
      <div className="dashboard-head">
        <div>
          <h1>Passenger requests</h1>
          <p>
            Offer your profile vehicle at the passenger&apos;s price or send a counter-offer.
          </p>
        </div>
        <Link to="/driver/dashboard" className="btn btn-outline">
          Dashboard
        </Link>
      </div>

      {hasProfileVehicle ? (
        <div className="card request-card" style={{ marginBottom: 16 }}>
          <div className="muted-note">Offering with your profile vehicle</div>
          <div className="request-meta">
            <span className="vehicle-type-badge">
              {ProfileIcon ? <ProfileIcon /> : null}
              <span>{profileType?.label || user.vehicleType}</span>
            </span>
            <span>
              <strong>{user.vehicleName}</strong>
            </span>
            <span>{user.vehicleNumber}</span>
            <Link to="/profile" className="btn btn-ghost btn-sm">
              Edit in Profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="alert">
          Add your vehicle (type, name/model, registration) in{' '}
          <Link to="/profile">Profile</Link> before you can offer on requests.
        </div>
      )}

      <div className="card filter-bar request-filters">
        <label className="field">
          <span>Category</span>
          <select
            value={filters.vehicleType}
            onChange={(e) => setFilters((f) => ({ ...f, vehicleType: e.target.value }))}
          >
            <option value="">All</option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>From</span>
          <input
            value={filters.fromCity}
            placeholder="Any"
            onChange={(e) => setFilters((f) => ({ ...f, fromCity: e.target.value }))}
          />
        </label>
        <label className="field">
          <span>To</span>
          <input
            value={filters.toCity}
            placeholder="Any"
            onChange={(e) => setFilters((f) => ({ ...f, toCity: e.target.value }))}
          />
        </label>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {requests.length === 0 ? (
        <EmptyState
          icon={FaHandHoldingUsd}
          title="No open requests"
          message="When passengers post ride requests, they show up here."
        />
      ) : (
        <div className="request-list">
          {requests.map((r) => {
            const type = getVehicleType(r.vehicleType)
            const TypeIcon = type.icon
            const offer = myOffer(r)
            const isResponding = respondingId === r.id

            return (
              <div key={r.id} className="card request-card">
                <div className="request-card-top">
                  <div className="request-passenger">
                    <UserAvatar src={r.passengerAvatarUrl} name={r.passengerName} size="sm" />
                    <span>{r.passengerName}</span>
                  </div>
                  <div className="vehicle-type-badge">
                    <TypeIcon />
                    <span>{type.label}</span>
                  </div>
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
                  <span>
                    Asking: <strong>{formatCurrency(r.offeredPrice)}</strong>
                  </span>
                </div>
                {r.note ? <p className="muted-note request-note">{r.note}</p> : null}

                {offer && (
                  <div className={`offer-block ${offer.status === 'accepted' ? 'offer-accepted' : ''}`}>
                    <div className="muted-note">
                      Your offer: <strong>{formatCurrency(offer.price)}</strong>
                      {' · '}
                      {offer.vehicleName} ({offer.vehicleNumber})
                      {' · '}
                      {offer.status}
                      {offer.acceptAtAskPrice ? ' (at ask price)' : ''}
                    </div>
                    {offer.status === 'pending' && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={busy === `withdraw-${offer.id}`}
                        onClick={() => handleWithdraw(offer.id)}
                      >
                        Withdraw offer
                      </button>
                    )}
                    {offer.status === 'accepted' && (
                      <p className="muted-note">
                        Waiting for the passenger to pay and confirm. Chat opens after payment.
                      </p>
                    )}
                  </div>
                )}

                {!offer && hasProfileVehicle && (
                  <>
                    {!isResponding ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => openRespond(r)}
                      >
                        Respond
                      </button>
                    ) : (
                      <div className="respond-panel">
                        <p className="muted-note">
                          Offering <strong>{user.vehicleName}</strong> ({user.vehicleNumber})
                        </p>
                        <div className="respond-actions">
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={busy === `accept-${r.id}`}
                            onClick={() => handleAcceptAtPrice(r)}
                          >
                            Accept at {formatCurrency(r.offeredPrice)}
                          </button>
                        </div>

                        <div className="respond-counter">
                          <label className="field">
                            <span>Or counter-offer (PKR)</span>
                            <input
                              type="number"
                              min={1}
                              value={form.price}
                              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                            />
                          </label>
                          <label className="field">
                            <span>Message (optional)</span>
                            <input
                              value={form.message}
                              placeholder="Pickup time, notes…"
                              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                            />
                          </label>
                          <div className="respond-actions">
                            <button
                              type="button"
                              className="btn btn-outline"
                              disabled={busy === `counter-${r.id}`}
                              onClick={() => handleCounter(r)}
                            >
                              Send counter-offer
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => setRespondingId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
