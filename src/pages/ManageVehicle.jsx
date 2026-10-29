import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft, FaSave, FaChair } from 'react-icons/fa'
import SeatMap from '../components/SeatMap'
import { getVehicleType } from '../data/constants'
import { getVehicleById, updateVehicle } from '../services/vehicleService'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import Seo from '../components/Seo'

function normalizeGenders(map) {
  if (!map || typeof map !== 'object') return {}
  const out = {}
  Object.entries(map).forEach(([k, v]) => {
    const n = Number(k)
    if (!Number.isInteger(n) || n < 1) return
    if (v === 'male' || v === 'female' || v === 'driver') out[String(n)] = v
  })
  return out
}

function offlineFromVehicle(vehicle) {
  const genders = normalizeGenders(vehicle?.seatGenders)
  return Object.entries(genders)
    .filter(([, g]) => g === 'driver')
    .map(([k]) => Number(k))
    .sort((a, b) => a - b)
}

export default function ManageVehicle() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [pricePerSeat, setPricePerSeat] = useState('')
  const [frontSeatPrice, setFrontSeatPrice] = useState('')
  const [wholeVehiclePrice, setWholeVehiclePrice] = useState('')
  const [offlineSeats, setOfflineSeats] = useState([])

  useEffect(() => {
    getVehicleById(id)
      .then((v) => {
        if (v.driverId !== user.id) {
          setError('You can only manage your own listings.')
          return
        }
        setVehicle(v)
        setPricePerSeat(String(v.pricePerSeat ?? ''))
        setFrontSeatPrice(v.frontSeatPrice != null ? String(v.frontSeatPrice) : '')
        setWholeVehiclePrice(v.wholeVehiclePrice != null ? String(v.wholeVehiclePrice) : '')
        setOfflineSeats(offlineFromVehicle(v))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, user.id])

  const type = vehicle ? getVehicleType(vehicle.vehicleType) : null
  const frontSeats = useMemo(
    () => (Array.isArray(vehicle?.frontSeats) ? vehicle.frontSeats : []),
    [vehicle],
  )

  // Seat map: passenger bookings + current offline draft.
  const displayBooked = useMemo(() => {
    if (!vehicle) return []
    const genders = normalizeGenders(vehicle.seatGenders)
    const passengerOnly = (vehicle.bookedSeats || []).filter((s) => genders[String(s)] !== 'driver')
    return [...new Set([...passengerOnly, ...offlineSeats])].sort((a, b) => a - b)
  }, [vehicle, offlineSeats])

  const displayGenders = useMemo(() => {
    if (!vehicle) return {}
    const genders = normalizeGenders(vehicle.seatGenders)
    const next = { ...genders }
    // Clear old driver tags, then apply draft offline seats.
    Object.keys(next).forEach((k) => {
      if (next[k] === 'driver') delete next[k]
    })
    offlineSeats.forEach((s) => {
      next[String(s)] = 'driver'
    })
    return next
  }, [vehicle, offlineSeats])

  const openCount = vehicle
    ? vehicle.totalSeats - displayBooked.length
    : 0

  const toggleSeat = (seat) => {
    const genders = normalizeGenders(vehicle.seatGenders)
    const tag = genders[String(seat)]
    if (tag === 'male' || tag === 'female') return
    setOfflineSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat].sort((a, b) => a - b),
    )
    setNotice('')
    setError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    const price = Number(pricePerSeat)
    if (!(price > 0)) {
      setError('Price per seat must be greater than zero.')
      return
    }
    setSaving(true)
    try {
      const updated = await updateVehicle(id, {
        pricePerSeat: price,
        frontSeatPrice: frontSeatPrice === '' ? null : Number(frontSeatPrice),
        wholeVehiclePrice: wholeVehiclePrice === '' ? null : Number(wholeVehiclePrice),
        offlineSeats,
      })
      setVehicle(updated)
      setOfflineSeats(offlineFromVehicle(updated))
      setPricePerSeat(String(updated.pricePerSeat ?? ''))
      setFrontSeatPrice(updated.frontSeatPrice != null ? String(updated.frontSeatPrice) : '')
      setWholeVehiclePrice(
        updated.wholeVehiclePrice != null ? String(updated.wholeVehiclePrice) : '',
      )
      setNotice('Listing updated. Offline seats and fares are live for passengers.')
    } catch (err) {
      setError(err.message || 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="container narrow section">
        <div className="empty-state">
          <h3>{error || 'Listing not found'}</h3>
          <Link to="/driver/dashboard" className="btn btn-primary">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container narrow section manage-vehicle">
      <Seo title={`Manage ${vehicle.vehicleName}`} noindex />
      <button type="button" className="btn btn-ghost btn-sm back-link" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="manage-vehicle-head">
        <div>
          <p className="muted-note" style={{ marginBottom: 0 }}>Manage listing</p>
          <h1>{vehicle.vehicleName}</h1>
          <p className="muted-note">
            {vehicle.fromCity} → {vehicle.toCity} · {formatDate(vehicle.date)} ·{' '}
            {formatTime(vehicle.time)} · {type?.label}
          </p>
        </div>
        <div className="manage-vehicle-stats">
          <span>
            <FaChair /> {openCount} open · {displayBooked.length}/{vehicle.totalSeats} held
          </span>
        </div>
      </div>

      <div className="alert alert-info">
        After posting, you can only change fares for open seats and take seats offline. Route,
        date, vehicle type and capacity stay fixed.
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <form className="manage-vehicle-form" onSubmit={handleSave}>
        <div className="card">
          <h3 className="card-section-title">Fares for open seats</h3>
          <p className="muted-note">
            New prices apply to seats that are still available. Already-booked seats keep the fare
            from their ticket.
          </p>
          <div className="form-row">
            <label className="field">
              Price per seat (PKR)
              <input
                type="number"
                min="1"
                step="1"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                required
              />
            </label>
            <label className="field">
              Front seat price (optional)
              <input
                type="number"
                min="1"
                step="1"
                value={frontSeatPrice}
                onChange={(e) => setFrontSeatPrice(e.target.value)}
                placeholder={
                  frontSeats.length
                    ? `Default ${formatCurrency(Number(pricePerSeat) || 0)}`
                    : 'No front seats'
                }
              />
            </label>
          </div>
          <label className="field">
            Whole-vehicle price (optional)
            <input
              type="number"
              min="1"
              step="1"
              value={wholeVehiclePrice}
              onChange={(e) => setWholeVehiclePrice(e.target.value)}
              placeholder="Leave blank to disable"
            />
          </label>
        </div>

        <div className="card">
          <h3 className="card-section-title">Seat map</h3>
          <p className="muted-note">
            Tap an open seat to hold it offline (shows as booked by driver with a <strong>D</strong>{' '}
            badge). Tap a <strong>D</strong> seat again to reopen it for passengers.
          </p>
          <SeatMap
            totalSeats={vehicle.totalSeats}
            bookedSeats={displayBooked}
            selectedSeats={[]}
            frontSeats={frontSeats}
            seatGenders={displayGenders}
            onToggle={toggleSeat}
            layout={type.seatLayout}
            manageMode
          />
          {offlineSeats.length > 0 && (
            <p className="muted-note" style={{ marginTop: 12 }}>
              Offline now: {offlineSeats.map((n) => `Seat ${n}`).join(', ')}
            </p>
          )}
        </div>

        <div className="manage-vehicle-actions">
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            <FaSave /> {saving ? 'Saving…' : 'Save changes'}
          </button>
          <Link to="/driver/dashboard" className="btn btn-outline btn-lg">
            Done
          </Link>
        </div>
      </form>
    </div>
  )
}
