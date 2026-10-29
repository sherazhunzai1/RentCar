import { FaChair } from 'react-icons/fa'
import { GiSteeringWheel } from 'react-icons/gi'

// Visual seat picker laid out like a real cabin:
//   - the front row shows the (non-bookable) driver plus `frontRow` seat(s)
//     beside them — so seat 1 sits next to the driver
//   - the remaining seats fill rows of `cols`, with an optional aisle gap
// Booked seats are disabled; front-priced seats (in `frontSeats`) get an "F".
// `seatGenders` ({ "2": "female", "5": "driver", … }) labels booked seats.
// In `manageMode`, the driver can click available seats to take them offline
// and click driver-held seats to reopen them (passenger seats stay locked).
function parseMaybeJson(value, fallback) {
  if (value == null) return fallback
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }
  return value
}

function toSeatSet(list) {
  const parsed = parseMaybeJson(list, [])
  return new Set(
    (Array.isArray(parsed) ? parsed : [])
      .map((s) => Number(s))
      .filter((n) => Number.isInteger(n) && n > 0),
  )
}

function normalizeGenders(map) {
  const parsed = parseMaybeJson(map, {})
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  const out = {}
  Object.entries(parsed).forEach(([key, value]) => {
    const n = Number(key)
    if (!Number.isInteger(n) || n < 1) return
    if (value === 'male' || value === 'female' || value === 'driver') out[String(n)] = value
  })
  return out
}

export default function SeatMap({
  totalSeats,
  bookedSeats = [],
  selectedSeats = [],
  frontSeats = [],
  seatGenders = {},
  onToggle,
  layout = { hasDriver: true, frontRow: 1, cols: 4 },
  maxSelectable = Infinity,
  readOnly = false,
  manageMode = false,
}) {
  const cols = layout.cols ?? 4
  const frontRow = layout.frontRow ?? 1
  const hasDriver = layout.hasDriver ?? true
  const aisleAfter = layout.aisleAfter
  const bookedSet = toSeatSet(bookedSeats)
  const selectedSet = toSeatSet(selectedSeats)
  const frontSet = toSeatSet(frontSeats)
  const genders = normalizeGenders(seatGenders)
  const hasFront = frontSet.size > 0
  const hasDriverHeld = Object.values(genders).includes('driver')

  const seatState = (seat) => {
    if (bookedSet.has(seat)) return 'booked'
    if (selectedSet.has(seat)) return 'selected'
    return 'available'
  }

  const handleClick = (seat, state) => {
    if (readOnly || !onToggle) return
    const tag = genders[String(seat)]
    if (manageMode) {
      // Passenger bookings stay locked; available + driver-offline are toggles.
      if (state === 'booked' && tag !== 'driver') return
      onToggle(seat)
      return
    }
    if (state === 'booked') return
    if (state === 'available' && selectedSeats.length >= maxSelectable) return
    onToggle(seat)
  }

  const renderSeat = (seat) => {
    const state = seatState(seat)
    const booked = state === 'booked'
    const isFront = frontSet.has(seat)
    const tag = booked ? genders[String(seat)] || null : null
    const driverHeld = tag === 'driver'
    const className = [
      'seat',
      `seat-${state}`,
      !booked && isFront ? 'seat-front' : '',
      tag === 'male' ? 'seat-male' : '',
      tag === 'female' ? 'seat-female' : '',
      driverHeld ? 'seat-driver-held' : '',
      manageMode && (state === 'available' || driverHeld) ? 'seat-manageable' : '',
    ]
      .filter(Boolean)
      .join(' ')

    let label
    if (driverHeld) {
      label = `Seat ${seat} — offline (held by driver)`
    } else if (booked) {
      label = `Seat ${seat} — booked${tag ? ` by a ${tag} passenger` : ''}`
    } else {
      label = `Seat ${seat}${isFront ? ' (front)' : ''} — ${state}`
    }

    const locked =
      readOnly ||
      (!manageMode && booked) ||
      (manageMode && booked && !driverHeld) ||
      !onToggle

    return (
      <button
        type="button"
        key={seat}
        className={className}
        onClick={() => handleClick(seat, state)}
        disabled={locked}
        aria-label={label}
        title={label}
      >
        <FaChair />
        <span className="seat-num">{seat}</span>
        {!booked && isFront && <span className="seat-badge">F</span>}
        {tag === 'female' && <span className="seat-gender female" aria-hidden="true">F</span>}
        {tag === 'male' && <span className="seat-gender male" aria-hidden="true">M</span>}
        {driverHeld && <span className="seat-gender driver" aria-hidden="true">D</span>}
      </button>
    )
  }

  const frontSeatNums = Array.from(
    { length: Math.min(frontRow, totalSeats) },
    (_, i) => i + 1,
  )

  const backRows = []
  for (let i = frontSeatNums.length + 1; i <= totalSeats; i += cols) {
    backRows.push(Array.from({ length: cols }, (_, c) => i + c).filter((n) => n <= totalSeats))
  }

  return (
    <div className="seatmap">
      <div className="seatmap-cabin">
        <div className="seat-row seat-row-front">
          {frontSeatNums.map((seat) => renderSeat(seat))}
          {hasDriver && (
            <span className="seat-driver" title="Driver — not for booking" aria-hidden="true">
              <GiSteeringWheel />
              <span className="seat-driver-text">Driver</span>
            </span>
          )}
        </div>

        <div className="seatmap-rows">
          {backRows.map((row, rIdx) => (
            <div className="seat-row" key={rIdx}>
              {row.map((seat, cIdx) => (
                <span key={seat} className="seat-cell">
                  {aisleAfter != null && cIdx === aisleAfter && <span className="aisle" />}
                  {renderSeat(seat)}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="seatmap-legend">
        {!readOnly && !manageMode && <span><i className="legend-box available" /> Available</span>}
        {!readOnly && !manageMode && <span><i className="legend-box selected" /> Selected</span>}
        {manageMode && <span><i className="legend-box available" /> Open</span>}
        <span><i className="legend-box booked" /> Booked</span>
        {(hasDriverHeld || manageMode) && (
          <span><i className="legend-box driver-held" /> Offline (D)</span>
        )}
        {hasFront && <span><i className="legend-box front" /> Front</span>}
        <span><i className="legend-box female" /> Female (F)</span>
        <span><i className="legend-box male" /> Male (M)</span>
      </div>
      <p className="seatmap-hint">
        {manageMode
          ? 'Tap an open seat to take it offline (held by you). Tap a D seat to reopen it. Passenger bookings (M/F) cannot be changed.'
          : 'Booked seats are locked. Badges show M (male), F (female), or D (driver offline).'}
      </p>
    </div>
  )
}
