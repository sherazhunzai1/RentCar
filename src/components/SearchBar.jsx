import { FaMapMarkerAlt, FaFlag, FaRegCalendarAlt, FaSearch } from 'react-icons/fa'
import { CITIES } from '../data/cities'
import { VEHICLE_TYPES } from '../data/constants'
import { todayISO } from '../utils/format'

// Reusable route search / filter form.
// `values` = { fromCity, toCity, date, vehicleType }
export default function SearchBar({ values, onChange, onSubmit, variant = 'hero' }) {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(values)
  }

  return (
    <form className={`searchbar searchbar-${variant}`} onSubmit={handleSubmit}>
      <div className="searchbar-field">
        <label>
          <FaMapMarkerAlt /> From
        </label>
        <select value={values.fromCity} onChange={set('fromCity')}>
          <option value="">Any city</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="searchbar-field">
        <label>
          <FaFlag /> To
        </label>
        <select value={values.toCity} onChange={set('toCity')}>
          <option value="">Any city</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="searchbar-field">
        <label>
          <FaRegCalendarAlt /> Date
        </label>
        <input type="date" min={todayISO()} value={values.date} onChange={set('date')} />
      </div>

      <div className="searchbar-field">
        <label>Vehicle</label>
        <select value={values.vehicleType} onChange={set('vehicleType')}>
          <option value="">All types</option>
          {VEHICLE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-primary searchbar-btn">
        <FaSearch /> Search
      </button>
    </form>
  )
}
