import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaArrowRight, FaTimes } from 'react-icons/fa'
import { useAuth } from './AuthContext'
import { connectSocket } from '../services/socketService'
import { sounds } from '../services/soundService'
import { getVehicleType } from '../data/constants'
import { formatCurrency, formatDate } from '../utils/format'

const RideAlertContext = createContext(null)
const DRIVER_BADGE_KEY = 'gaadi_driver_new_requests'
const PASSENGER_BADGE_KEY = 'gaadi_passenger_new_offers'
const ALERT_MS = 10000

function readBadge(key) {
  try {
    return Math.max(0, Number(sessionStorage.getItem(key)) || 0)
  } catch {
    return 0
  }
}

function writeBadge(key, n) {
  try {
    sessionStorage.setItem(key, String(Math.max(0, n)))
  } catch {
    /* ignore */
  }
}

export function RideAlertProvider({ children }) {
  const { isAuthenticated, isDriver, isPassenger } = useAuth()
  const location = useLocation()
  const [newRequestCount, setNewRequestCount] = useState(() =>
    typeof window !== 'undefined' ? readBadge(DRIVER_BADGE_KEY) : 0,
  )
  const [newOfferCount, setNewOfferCount] = useState(() =>
    typeof window !== 'undefined' ? readBadge(PASSENGER_BADGE_KEY) : 0,
  )
  const [alerts, setAlerts] = useState([])
  const idRef = useRef(0)
  const seenRequestIdsRef = useRef(new Set())
  const seenOfferIdsRef = useRef(new Set())

  const onDriverRequestsPage = location.pathname.startsWith('/driver/requests')
  const onPassengerRequestsPage =
    location.pathname === '/requests' || location.pathname.startsWith('/requests/')

  const clearNewRequests = useCallback(() => {
    setNewRequestCount(0)
    writeBadge(DRIVER_BADGE_KEY, 0)
  }, [])

  const clearNewOffers = useCallback(() => {
    setNewOfferCount(0)
    writeBadge(PASSENGER_BADGE_KEY, 0)
  }, [])

  const dismissAlert = useCallback((id) => {
    setAlerts((list) => list.filter((a) => a.id !== id))
  }, [])

  const pushAlert = useCallback((alert) => {
    const id = ++idRef.current
    setAlerts((list) => [...list.slice(-4), { ...alert, id }])
    try {
      sounds.receive()
    } catch {
      /* audio may be locked */
    }
    window.setTimeout(() => {
      setAlerts((list) => list.filter((a) => a.id !== id))
    }, ALERT_MS)
    return id
  }, [])

  // Clear badges when viewing the matching requests page.
  useEffect(() => {
    if (isDriver && onDriverRequestsPage) clearNewRequests()
  }, [isDriver, onDriverRequestsPage, clearNewRequests])

  useEffect(() => {
    if (isPassenger && onPassengerRequestsPage) clearNewOffers()
  }, [isPassenger, onPassengerRequestsPage, clearNewOffers])

  // Drivers: live passenger request alerts
  useEffect(() => {
    if (!isAuthenticated || !isDriver) return undefined

    const socket = connectSocket()

    const onNewRequest = (payload) => {
      const request = payload?.request || payload
      if (!request?.id) return
      if (seenRequestIdsRef.current.has(request.id)) return
      seenRequestIdsRef.current.add(request.id)
      if (seenRequestIdsRef.current.size > 100) {
        seenRequestIdsRef.current = new Set([...seenRequestIdsRef.current].slice(-50))
      }

      if (!onDriverRequestsPage) {
        setNewRequestCount((n) => {
          const next = n + 1
          writeBadge(DRIVER_BADGE_KEY, next)
          return next
        })
      }

      pushAlert({ kind: 'request', request })
    }

    socket.on('ride:request:new', onNewRequest)
    return () => {
      socket.off('ride:request:new', onNewRequest)
    }
  }, [isAuthenticated, isDriver, onDriverRequestsPage, pushAlert])

  // Passengers: live driver offer / accept-at-ask alerts
  useEffect(() => {
    if (!isAuthenticated || !isPassenger) return undefined

    const socket = connectSocket()

    const onOffer = (payload) => {
      const type = payload?.type
      // Only notify when a driver responds (new counter-offer or accept at ask).
      if (type !== 'new' && type !== 'accepted') return
      const offer = payload?.offer
      if (!offer?.id) return
      if (seenOfferIdsRef.current.has(offer.id)) return
      seenOfferIdsRef.current.add(offer.id)
      if (seenOfferIdsRef.current.size > 100) {
        seenOfferIdsRef.current = new Set([...seenOfferIdsRef.current].slice(-50))
      }

      if (!onPassengerRequestsPage) {
        setNewOfferCount((n) => {
          const next = n + 1
          writeBadge(PASSENGER_BADGE_KEY, next)
          return next
        })
      }

      pushAlert({
        kind: 'offer',
        type,
        offer,
        request: payload.request || null,
        requestId: payload.requestId || offer.requestId,
      })
    }

    socket.on('ride:offer', onOffer)
    return () => {
      socket.off('ride:offer', onOffer)
    }
  }, [isAuthenticated, isPassenger, onPassengerRequestsPage, pushAlert])

  // Reset on logout.
  useEffect(() => {
    if (!isAuthenticated) {
      setNewRequestCount(0)
      setNewOfferCount(0)
      writeBadge(DRIVER_BADGE_KEY, 0)
      writeBadge(PASSENGER_BADGE_KEY, 0)
      seenRequestIdsRef.current = new Set()
      seenOfferIdsRef.current = new Set()
      setAlerts([])
    }
  }, [isAuthenticated])

  const value = useMemo(
    () => ({
      newRequestCount,
      newOfferCount,
      clearNewRequests,
      clearNewOffers,
    }),
    [newRequestCount, newOfferCount, clearNewRequests, clearNewOffers],
  )

  return (
    <RideAlertContext.Provider value={value}>
      {children}
      {alerts.length > 0 && (
        <div className="ride-alert-stack" aria-live="polite">
          {alerts.map((alert) =>
            alert.kind === 'offer' ? (
              <OfferAlertCard key={alert.id} alert={alert} onDismiss={() => dismissAlert(alert.id)} />
            ) : (
              <RequestAlertCard
                key={alert.id}
                request={alert.request}
                onDismiss={() => dismissAlert(alert.id)}
              />
            ),
          )}
        </div>
      )}
    </RideAlertContext.Provider>
  )
}

function RequestAlertCard({ request, onDismiss }) {
  const type = getVehicleType(request.vehicleType)
  const TypeIcon = type.icon
  return (
    <div className="ride-alert-card" role="status">
      <button type="button" className="ride-alert-close" aria-label="Dismiss" onClick={onDismiss}>
        <FaTimes />
      </button>
      <div className="ride-alert-eyebrow">New ride request</div>
      <div className="ride-alert-route">
        <strong>{request.fromCity}</strong>
        <FaArrowRight className="ride-alert-arrow" />
        <strong>{request.toCity}</strong>
      </div>
      <div className="ride-alert-meta">
        <span className="vehicle-type-badge">
          <TypeIcon />
          <span>{type.label}</span>
        </span>
        <span>{formatDate(request.date)}</span>
        <span>{formatCurrency(request.offeredPrice)}</span>
      </div>
      {request.passengerName ? (
        <div className="ride-alert-passenger">{request.passengerName}</div>
      ) : null}
      <Link to="/driver/requests" className="btn btn-primary btn-sm ride-alert-cta" onClick={onDismiss}>
        View request
      </Link>
    </div>
  )
}

function OfferAlertCard({ alert, onDismiss }) {
  const { offer, request, type } = alert
  const acceptedAtAsk = type === 'accepted' || offer.acceptAtAskPrice
  const routeFrom = request?.fromCity
  const routeTo = request?.toCity
  const askPrice = request?.offeredPrice

  return (
    <div className="ride-alert-card ride-alert-card-offer" role="status">
      <button type="button" className="ride-alert-close" aria-label="Dismiss" onClick={onDismiss}>
        <FaTimes />
      </button>
      <div className="ride-alert-eyebrow">
        {acceptedAtAsk ? 'Driver accepted your price' : 'New driver offer'}
      </div>
      {routeFrom && routeTo ? (
        <div className="ride-alert-route">
          <strong>{routeFrom}</strong>
          <FaArrowRight className="ride-alert-arrow" />
          <strong>{routeTo}</strong>
        </div>
      ) : null}
      <div className="ride-alert-passenger">
        <strong>{offer.driverName || 'A driver'}</strong>
        {offer.vehicleName
          ? ` · ${offer.vehicleName}${offer.vehicleNumber ? ` (${offer.vehicleNumber})` : ''}`
          : ''}
      </div>
      <div className="ride-alert-meta">
        <span>
          Offer: <strong>{formatCurrency(offer.price)}</strong>
        </span>
        {askPrice != null && Number(askPrice) !== Number(offer.price) ? (
          <span>Your ask: {formatCurrency(askPrice)}</span>
        ) : null}
        {request?.date ? <span>{formatDate(request.date)}</span> : null}
      </div>
      {offer.message ? <p className="ride-alert-message">{offer.message}</p> : null}
      <Link to="/requests" className="btn btn-primary btn-sm ride-alert-cta" onClick={onDismiss}>
        {acceptedAtAsk ? 'Pay & confirm' : 'Review offer'}
      </Link>
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRideAlert() {
  const ctx = useContext(RideAlertContext)
  if (!ctx) throw new Error('useRideAlert must be used within a RideAlertProvider')
  return ctx
}

export function useRideAlertOptional() {
  return useContext(RideAlertContext)
}
