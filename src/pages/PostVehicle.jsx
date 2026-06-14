import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { CITIES } from '../data/cities'
import { VEHICLE_TYPES, AMENITIES, getVehicleType } from '../data/constants'
import { createVehicle, updateVehicle, getVehicleById } from '../services/vehicleService'
import { todayISO } from '../utils/format'
import { useAuth } from '../context/AuthContext'

const emptyForm = {
  vehicleType: 'car',
  vehicleName: '',
  vehicleNumber: '',
  fromCity: '',
  toCity: '',
  date: '',
  time: '',
  totalSeats: getVehicleType('car').defaultSeats,
  pricePerSeat: '',
  amenities: [],
}

export default function PostVehicle() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  // Load the listing when editing.
  useEffect(() => {
    if (!isEdit) return
    getVehicleById(id)
      .then((v) => {
        if (v.driverId !== user.id) {
          setError('You can only edit your own listings.')
          return
        }
        setForm({
          vehicleType: v.vehicleType,
          vehicleName: v.vehicleName,
          vehicleNumber: v.vehicleNumber,
          fromCity: v.fromCity,
          toCity: v.toCity,
          date: v.date,
          time: v.time,
          totalSeats: v.totalSeats,
          pricePerSeat: v.pricePerSeat,
          amenities: v.amenities || [],
        })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, isEdit, user.id])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const pickType = (typeId) => {
    const type = getVehicleType(typeId)
    setForm((f) => ({ ...f, vehicleType: typeId, totalSeats: type.defaultSeats }))
  }

  const toggleAmenity = (a) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.fromCity === form.toCity) {
      setError('Departure and destination cities must be different.')
      return
    }
    if (Number(form.pricePerSeat) <= 0) {
      setError('Please enter a valid price per seat.')
      return
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateVehicle(id, {
          ...form,
          totalSeats: Number(form.totalSeats),
          pricePerSeat: Number(form.pricePerSeat),
        })
      } else {
        await createVehicle(form)
      }
      navigate('/driver/dashboard')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    )
  }

  const maxSeats = getVehicleType(form.vehicleType).maxSeats

  return (
    <div className="container narrow section">
      <Link to="/driver/dashboard" className="back-link">
        <FaArrowLeft /> Back to dashboard
      </Link>

      <div className="page-title-block">
        <h1>{isEdit ? 'Edit vehicle' : 'Post a vehicle'}</h1>
        <p>Fill in your vehicle and route details to start accepting bookings.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form post-form">
        {/* Vehicle type */}
        <div className="card">
          <h3 className="card-section-title">Vehicle type</h3>
          <div className="type-picker">
            {VEHICLE_TYPES.map((t) => {
              const Icon = t.icon
              return (
                <button
                  type="button"
                  key={t.id}
                  className={`type-pick ${form.vehicleType === t.id ? 'active' : ''}`}
                  onClick={() => pickType(t.id)}
                >
                  <Icon />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Vehicle info */}
        <div className="card">
          <h3 className="card-section-title">Vehicle details</h3>
          <div className="form-row">
            <div className="field">
              <label>Vehicle name / model</label>
              <input
                type="text"
                placeholder="e.g. Toyota Hiace Grand Cabin"
                value={form.vehicleName}
                onChange={(e) => set('vehicleName', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Registration number</label>
              <input
                type="text"
                placeholder="e.g. LES-7781"
                value={form.vehicleNumber}
                onChange={(e) => set('vehicleNumber', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Total seats (max {maxSeats})</label>
              <input
                type="number"
                min="1"
                max={maxSeats}
                value={form.totalSeats}
                onChange={(e) => set('totalSeats', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Price per seat (PKR)</label>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="e.g. 1500"
                value={form.pricePerSeat}
                onChange={(e) => set('pricePerSeat', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="card">
          <h3 className="card-section-title">Route & schedule</h3>
          <div className="form-row">
            <div className="field">
              <label>From city</label>
              <select value={form.fromCity} onChange={(e) => set('fromCity', e.target.value)} required>
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>To city</label>
              <select value={form.toCity} onChange={(e) => set('toCity', e.target.value)} required>
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Departure date</label>
              <input
                type="date"
                min={todayISO()}
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Departure time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="card">
          <h3 className="card-section-title">Amenities</h3>
          <p className="muted-note">Select everything your vehicle offers.</p>
          <div className="amenity-picker">
            {AMENITIES.map((a) => {
              const selected = form.amenities.includes(a)
              return (
                <button
                  type="button"
                  key={a}
                  className={`amenity-chip ${selected ? 'active' : ''}`}
                  onClick={() => toggleAmenity(a)}
                >
                  {selected && <FaCheckCircle />} {a}
                </button>
              )
            })}
          </div>
        </div>

        <div className="post-form-actions">
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Post Vehicle'}
          </button>
          <Link to="/driver/dashboard" className="btn btn-ghost btn-lg">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
