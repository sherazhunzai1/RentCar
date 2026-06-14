import { Link } from 'react-router-dom'
import { FaArrowRight, FaRegClock, FaRegCalendarAlt, FaChair } from 'react-icons/fa'
import { getVehicleType } from '../data/constants'
import { formatCurrency, formatShortDate, formatTime } from '../utils/format'
import StarRating from './StarRating'

export default function VehicleCard({ vehicle }) {
  const type = getVehicleType(vehicle.vehicleType)
  const TypeIcon = type.icon
  const available = vehicle.totalSeats - vehicle.bookedSeats.length
  const soldOut = available === 0

  return (
    <article className="vehicle-card">
      <div className="vehicle-card-head">
        <div className="vehicle-type-badge">
          <TypeIcon />
          <span>{type.label}</span>
        </div>
        <StarRating value={vehicle.rating} size="0.85rem" />
      </div>

      <h3 className="vehicle-name">{vehicle.vehicleName}</h3>
      <p className="vehicle-number">{vehicle.vehicleNumber}</p>

      <div className="route">
        <div className="route-point">
          <span className="dot from" />
          <span>{vehicle.fromCity}</span>
        </div>
        <FaArrowRight className="route-arrow" />
        <div className="route-point">
          <span className="dot to" />
          <span>{vehicle.toCity}</span>
        </div>
      </div>

      <div className="vehicle-meta">
        <span>
          <FaRegCalendarAlt /> {formatShortDate(vehicle.date)}
        </span>
        <span>
          <FaRegClock /> {formatTime(vehicle.time)}
        </span>
        <span className={soldOut ? 'seats-out' : 'seats-left'}>
          <FaChair /> {soldOut ? 'Sold out' : `${available} seats left`}
        </span>
      </div>

      <div className="vehicle-card-foot">
        <div className="price">
          <strong>{formatCurrency(vehicle.pricePerSeat)}</strong>
          <span>/ seat</span>
        </div>
        <Link
          to={`/vehicles/${vehicle.id}`}
          className={`btn ${soldOut ? 'btn-ghost' : 'btn-primary'} btn-sm`}
        >
          {soldOut ? 'View' : 'View & Book'}
        </Link>
      </div>
    </article>
  )
}
