import { useMemo } from 'react'
import {
  FaMapMarkerAlt,
  FaFlag,
  FaRegCalendarAlt,
  FaSearch,
  FaExchangeAlt,
  FaCarSide,
} from 'react-icons/fa'
import { VEHICLE_TYPES } from '../data/constants'
import { POPULAR_ROUTES } from '../data/popularRoutes'
import { useLocations } from '../hooks/useLocations'
import { todayISO } from '../utils/format'

// Reusable route search / filter form.
// `values` = { fromCity, toCity, date, vehicleType }
export default function SearchBar({ values, onChange, onSubmit, variant = 'hero' }) {
  const { cities } = useLocations()
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(values)
  }

  const swapCities = () => {
    onChange({
      ...values,
      fromCity: values.toCity,
      toCity: values.fromCity,
    })
  }

  const applyQuickRoute = (from, to) => {
    const next = { ...values, fromCity: from, toCity: to }
    onChange(next)
    onSubmit?.(next)
  }

  const quickRoutes = useMemo(() => POPULAR_ROUTES.slice(0, 5), [])
  const isHero = variant === 'hero'
  const uid = variant

  return (
    <div className={`searchbar-shell searchbar-shell-${variant}`}>
      {isHero && (
        <div className="searchbar-intro">
          <span className="searchbar-kicker">Plan your trip</span>
          <h2 className="searchbar-heading">Where are you going?</h2>
        </div>
      )}

      <form className={`searchbar searchbar-${variant}`} onSubmit={handleSubmit}>
        <div className="searchbar-route">
          <div className="searchbar-field searchbar-field-from">
            <label htmlFor={`search-from-${uid}`}>
              <FaMapMarkerAlt /> From
            </label>
            <select
              id={`search-from-${uid}`}
              value={values.fromCity}
              onChange={set('fromCity')}
              aria-label="Departure city"
            >
              <option value="">Any city</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="searchbar-swap"
            onClick={swapCities}
            aria-label="Swap departure and destination"
            title="Swap cities"
          >
            <FaExchangeAlt />
          </button>

          <div className="searchbar-field searchbar-field-to">
            <label htmlFor={`search-to-${uid}`}>
              <FaFlag /> To
            </label>
            <select
              id={`search-to-${uid}`}
              value={values.toCity}
              onChange={set('toCity')}
              aria-label="Destination city"
            >
              <option value="">Any city</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="searchbar-meta">
          <div className="searchbar-field searchbar-field-date">
            <label htmlFor={`search-date-${uid}`}>
              <FaRegCalendarAlt /> Date
            </label>
            <input
              id={`search-date-${uid}`}
              type="date"
              min={todayISO()}
              value={values.date}
              onChange={set('date')}
              aria-label="Travel date"
            />
          </div>

          <div className="searchbar-field searchbar-field-type">
            <label htmlFor={`search-type-${uid}`}>
              <FaCarSide /> Vehicle
            </label>
            <select
              id={`search-type-${uid}`}
              value={values.vehicleType}
              onChange={set('vehicleType')}
              aria-label="Vehicle type"
            >
              <option value="">All types</option>
              {VEHICLE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary searchbar-btn">
          <FaSearch aria-hidden="true" />
          <span>Search rides</span>
        </button>
      </form>

      {isHero && (
        <div className="searchbar-quick">
          <span className="searchbar-quick-label">Popular</span>
          <div className="searchbar-chips" role="list">
            {quickRoutes.map((r) => (
              <button
                key={`${r.from}-${r.to}`}
                type="button"
                className="searchbar-chip"
                onClick={() => applyQuickRoute(r.from, r.to)}
              >
                {r.from} → {r.to}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
