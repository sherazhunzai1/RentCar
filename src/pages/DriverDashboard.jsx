import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaPlus,
  FaCar,
  FaUsers,
  FaChair,
  FaMoneyBillWave,
  FaArrowRight,
  FaRegCalendarAlt,
  FaRegClock,
  FaEdit,
  FaTrashAlt,
  FaHandHoldingUsd,
} from 'react-icons/fa'
import EmptyState from '../components/EmptyState'
import { getVehiclesByDriver, deleteVehicle } from '../services/vehicleService'
import { getBookingsByDriver } from '../services/bookingService'
import { getDriverRideRequests } from '../services/rideRequestService'
import { getVehicleType } from '../data/constants'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../context/ConfirmContext'
import { useToast } from '../context/ToastContext'
import ChatButton from '../components/ChatButton'
import UserAvatar from '../components/UserAvatar'
import Seo from '../components/Seo'

export default function DriverDashboard() {
  const { user } = useAuth()
  const confirm = useConfirm()
  const toast = useToast()
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
  const [rideRequests, setRideRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      getVehiclesByDriver(user.id),
      getBookingsByDriver(user.id),
      getDriverRideRequests().catch(() => []),
    ]).then(([v, b, reqs]) => {
      setVehicles(v)
      setBookings(b)
      setRideRequests(reqs)
      setLoading(false)
    })
  }

  useEffect(load, [user.id])

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Delete listing?',
      message: 'This vehicle listing will be removed. This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteVehicle(id)
      setVehicles((list) => list.filter((v) => v.id !== id))
      toast('Listing deleted.', 'success')
    } catch (err) {
      toast(err.message || 'Could not delete listing.', 'error')
    }
  }

  const activeBookings = bookings.filter((b) => b.status === 'confirmed')
  const listingBookings = activeBookings.filter((b) => !b.rideRequestId)
  const bookingById = Object.fromEntries(bookings.map((b) => [b.id, b]))

  // Deals this driver accepted: awaiting passenger payment, or already confirmed.
  const myAcceptedRequests = rideRequests
    .map((r) => {
      const offer = (r.offers || []).find(
        (o) => o.driverId === user.id && o.status === 'accepted',
      )
      if (!offer) return null
      const booking = r.bookingId ? bookingById[r.bookingId] : null
      const confirmed = booking?.status === 'confirmed'
      const awaitingPay = !r.bookingId || booking?.status === 'pending'
      if (!confirmed && !awaitingPay) return null
      return { request: r, offer, booking, confirmed }
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Confirmed first by booking date, then awaiting by request createdAt.
      const aKey = a.booking?.createdAt || a.request.createdAt || ''
      const bKey = b.booking?.createdAt || b.request.createdAt || ''
      return String(bKey).localeCompare(String(aKey))
    })

  const seatsBooked = vehicles.reduce((sum, v) => sum + (v.bookedSeats?.length || 0), 0)
  const revenue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0)

  const stats = [
    { icon: FaCar, label: 'Listed vehicles', value: vehicles.length },
    { icon: FaUsers, label: 'Total bookings', value: activeBookings.length },
    { icon: FaHandHoldingUsd, label: 'Request deals', value: myAcceptedRequests.length },
    { icon: FaChair, label: 'Seats booked', value: seatsBooked },
    { icon: FaMoneyBillWave, label: 'Revenue', value: formatCurrency(revenue) },
  ]

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="container section dashboard">
      <Seo title="Driver Dashboard" path="/driver/dashboard" noindex />
      <div className="dashboard-head">
        <div>
          <h1>Welcome, {user.name.split(' ')[0]} 👋</h1>
          <p>Manage your vehicles, routes and incoming bookings.</p>
        </div>
        <div className="dashboard-head-actions">
          <Link to="/driver/requests" className="btn btn-outline">
            Passenger requests
          </Link>
          <Link to="/driver/post" className="btn btn-primary">
            <FaPlus /> Post Vehicle
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-cards">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="stat-card">
              <div className="stat-card-icon">
                <Icon />
              </div>
              <div>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Vehicles */}
      <section className="dashboard-section">
        <h2>Your vehicles</h2>
        {vehicles.length === 0 ? (
          <EmptyState
            icon={FaCar}
            title="No vehicles posted yet"
            message="Post your first vehicle and route to start receiving bookings."
            action={
              <Link to="/driver/post" className="btn btn-primary">
                <FaPlus /> Post a vehicle
              </Link>
            }
          />
        ) : (
          <div className="driver-vehicle-list">
            {vehicles.map((v) => {
              const type = getVehicleType(v.vehicleType)
              const TypeIcon = type.icon
              const available = v.totalSeats - v.bookedSeats.length
              const fillPct = Math.round((v.bookedSeats.length / v.totalSeats) * 100)
              return (
                <div key={v.id} className="card driver-vehicle">
                  <div className="driver-vehicle-info">
                    <div className="vehicle-type-badge">
                      <TypeIcon />
                      <span>{type.label}</span>
                    </div>
                    <div className="driver-vehicle-text">
                      <h3>{v.vehicleName}</h3>
                      <div className="route">
                        <span>{v.fromCity}</span>
                        <FaArrowRight className="route-arrow" />
                        <span>{v.toCity}</span>
                      </div>
                      <div className="details-when">
                        <span><FaRegCalendarAlt /> {formatDate(v.date)}</span>
                        <span><FaRegClock /> {formatTime(v.time)}</span>
                        <span>{formatCurrency(v.pricePerSeat)}/seat</span>
                      </div>
                    </div>
                  </div>

                  <div className="driver-vehicle-occupancy">
                    <div className="occupancy-bar">
                      <div className="occupancy-fill" style={{ width: `${fillPct}%` }} />
                    </div>
                    <small>
                      {v.bookedSeats.length}/{v.totalSeats} booked · {available} free
                    </small>
                  </div>

                  <div className="driver-vehicle-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/driver/edit/${v.id}`)}>
                      <FaEdit /> Manage
                    </button>
                    <button className="btn btn-danger-ghost btn-sm" onClick={() => handleDelete(v.id)}>
                      <FaTrashAlt /> Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Accepted / confirmed passenger ride requests */}
      <section className="dashboard-section">
        <div className="dashboard-section-head">
          <h2>Accepted ride requests</h2>
          <Link to="/driver/requests" className="btn btn-ghost btn-sm">
            Browse open requests
          </Link>
        </div>
        {myAcceptedRequests.length === 0 ? (
          <EmptyState
            icon={FaHandHoldingUsd}
            title="No accepted requests yet"
            message="When you accept a passenger request and they confirm payment, it shows up here."
            action={
              <Link to="/driver/requests" className="btn btn-outline">
                View passenger requests
              </Link>
            }
          />
        ) : (
          <div className="request-list">
            {myAcceptedRequests.map(({ request: r, offer, booking, confirmed }) => {
              const type = getVehicleType(r.vehicleType)
              const TypeIcon = type.icon
              return (
                <div key={r.id} className="card request-card">
                  <div className="request-card-top">
                    <div className="request-passenger">
                      <UserAvatar
                        src={r.passengerAvatarUrl}
                        name={r.passengerName}
                        size="sm"
                      />
                      <span>{r.passengerName}</span>
                    </div>
                    <span
                      className={`status-pill ${confirmed ? 'status-matched' : 'status-open'}`}
                    >
                      {confirmed ? 'Confirmed' : 'Awaiting payment'}
                    </span>
                  </div>
                  <div className="request-route">
                    <strong>{r.fromCity}</strong>
                    <FaArrowRight className="request-arrow" />
                    <strong>{r.toCity}</strong>
                  </div>
                  <div className="request-meta">
                    <span className="vehicle-type-badge">
                      <TypeIcon />
                      <span>{type.label}</span>
                    </span>
                    <span>
                      <FaRegCalendarAlt /> {formatDate(r.date)}
                    </span>
                    <span>
                      Agreed: <strong>{formatCurrency(offer.price)}</strong>
                    </span>
                    {booking ? (
                      <span>
                        Total paid: <strong>{formatCurrency(booking.totalAmount)}</strong>
                      </span>
                    ) : null}
                    {offer.vehicleName ? (
                      <span>
                        {offer.vehicleName}
                        {offer.vehicleNumber ? ` · ${offer.vehicleNumber}` : ''}
                      </span>
                    ) : null}
                  </div>
                  <div className="offer-actions">
                    {confirmed && booking ? (
                      <ChatButton booking={booking} label="Chat with passenger" />
                    ) : (
                      <p className="muted-note" style={{ margin: 0 }}>
                        Waiting for the passenger to pay and confirm this booking.
                      </p>
                    )}
                    {booking?.bookingRef ? (
                      <span className="muted-note">Ref {booking.bookingRef}</span>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Recent seat bookings on posted listings */}
      <section className="dashboard-section">
        <h2>Recent seat bookings</h2>
        {listingBookings.length === 0 ? (
          <EmptyState
            icon={FaUsers}
            title="No seat bookings yet"
            message="Bookings made on your posted vehicle listings will appear here."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Passenger</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Chat</th>
                </tr>
              </thead>
              <tbody>
                {listingBookings.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.bookingRef}</strong></td>
                    <td>
                      <span className="dashboard-party">
                        <UserAvatar src={b.passengerAvatarUrl} name={b.passengerName} size="sm" />
                        {b.passengerName}
                      </span>
                    </td>
                    <td>{b.fromCity} → {b.toCity}</td>
                    <td>{formatDate(b.date)}</td>
                    <td>{Array.isArray(b.seats) ? b.seats.join(', ') : b.seats}</td>
                    <td>{formatCurrency(b.totalAmount)}</td>
                    <td><ChatButton booking={b} label="Open" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
