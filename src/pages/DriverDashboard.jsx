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
} from 'react-icons/fa'
import EmptyState from '../components/EmptyState'
import { getVehiclesByDriver, deleteVehicle } from '../services/vehicleService'
import { getBookingsByDriver } from '../services/bookingService'
import { getVehicleType } from '../data/constants'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import ChatButton from '../components/ChatButton'
import Seo from '../components/Seo'

export default function DriverDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([getVehiclesByDriver(user.id), getBookingsByDriver(user.id)]).then(
      ([v, b]) => {
        setVehicles(v)
        setBookings(b)
        setLoading(false)
      },
    )
  }

  useEffect(load, [user.id])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return
    await deleteVehicle(id)
    setVehicles((list) => list.filter((v) => v.id !== id))
  }

  const activeBookings = bookings.filter((b) => b.status === 'confirmed')
  const seatsBooked = vehicles.reduce((sum, v) => sum + v.bookedSeats.length, 0)
  const revenue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0)

  const stats = [
    { icon: FaCar, label: 'Listed vehicles', value: vehicles.length },
    { icon: FaUsers, label: 'Total bookings', value: activeBookings.length },
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
        <Link to="/driver/post" className="btn btn-primary">
          <FaPlus /> Post Vehicle
        </Link>
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
                      <FaEdit /> Edit
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

      {/* Recent bookings */}
      <section className="dashboard-section">
        <h2>Recent bookings</h2>
        {activeBookings.length === 0 ? (
          <EmptyState
            icon={FaUsers}
            title="No bookings yet"
            message="Bookings made on your vehicles will appear here."
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
                {activeBookings.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.bookingRef}</strong></td>
                    <td>{b.passengerName}</td>
                    <td>{b.fromCity} → {b.toCity}</td>
                    <td>{formatDate(b.date)}</td>
                    <td>{b.seats.join(', ')}</td>
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
