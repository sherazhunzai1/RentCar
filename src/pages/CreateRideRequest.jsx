import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import { VEHICLE_TYPES } from '../data/constants'
import { useLocations } from '../hooks/useLocations'
import { createRideRequest } from '../services/rideRequestService'
import { formatCurrency, todayISO } from '../utils/format'
import Seo from '../components/Seo'

const empty = {
  vehicleType: 'car',
  fromCity: '',
  toCity: '',
  date: '',
  seatsNeeded: 1,
  offeredPrice: '',
  note: '',
}

export default function CreateRideRequest() {
  const navigate = useNavigate()
  const { cities } = useLocations()
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.fromCity || !form.toCity || !form.date || !form.offeredPrice) {
      setError('Please fill in category, route, date, and your offered price.')
      return
    }
    if (form.fromCity === form.toCity) {
      setError('From and to cities must be different.')
      return
    }
    setSubmitting(true)
    try {
      await createRideRequest({
        vehicleType: form.vehicleType,
        fromCity: form.fromCity,
        toCity: form.toCity,
        date: form.date,
        seatsNeeded: Number(form.seatsNeeded) || 1,
        offeredPrice: Number(form.offeredPrice),
        note: form.note.trim() || undefined,
      })
      navigate('/requests', { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="container narrow section">
      <Seo title="Request a Ride" path="/requests/new" noindex />
      <Link to="/requests" className="back-link">
        <FaArrowLeft /> My requests
      </Link>

      <div className="page-title-block">
        <h1>Request a ride</h1>
        <p>
          Choose a vehicle category, route, date, and the price you&apos;re willing to pay. Drivers
          can accept that price or send a counter-offer.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form post-form" onSubmit={handleSubmit}>
        <div className="card">
          <h3 className="card-section-title">Vehicle category</h3>
          <div className="type-picker">
            {VEHICLE_TYPES.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`type-pick ${form.vehicleType === t.id ? 'active' : ''}`}
                  onClick={() => set('vehicleType', t.id)}
                >
                  <Icon />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="card-section-title">Trip details</h3>
          <div className="form-row">
            <div className="field">
              <label>From</label>
              <select value={form.fromCity} onChange={(e) => set('fromCity', e.target.value)} required>
                <option value="">Select city</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>To</label>
              <select value={form.toCity} onChange={(e) => set('toCity', e.target.value)} required>
                <option value="">Select city</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Date</label>
              <input
                type="date"
                min={todayISO()}
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Seats needed</label>
              <input
                type="number"
                min={1}
                max={24}
                value={form.seatsNeeded}
                onChange={(e) => set('seatsNeeded', e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label>Your offered price (PKR, total)</label>
            <input
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 8000"
              value={form.offeredPrice}
              onChange={(e) => set('offeredPrice', e.target.value)}
              required
            />
            {form.offeredPrice ? (
              <small className="field-hint">{formatCurrency(Number(form.offeredPrice))} for the trip</small>
            ) : null}
          </div>
          <div className="field">
            <label>Note <span className="optional">— optional</span></label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Luggage, pickup point, flexible time…"
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
          {submitting ? 'Posting…' : 'Post request'}
        </button>
      </form>
    </div>
  )
}
