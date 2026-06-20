import { FaChair } from 'react-icons/fa'
import { GiSteeringWheel } from 'react-icons/gi'

// Visual seat picker laid out like a real cabin:
//   - the front row shows the (non-bookable) driver plus `frontRow` seat(s)
//     beside them — so seat 1 sits next to the driver
//   - the remaining seats fill rows of `cols`, with an optional aisle gap
// Booked seats are disabled; front-priced seats (in `frontSeats`) get an "F".
// `seatGenders` ({ "2": "female", … }) labels booked seats by the booker's
// gender — awareness only; it never restricts who can pick an available seat.
export default function SeatMap({
  totalSeats,
  bookedSeats = [],
  selectedSeats = [],
  frontSeats = [],
  seatGenders = {},
  onToggle,
  layout = { hasDriver: true, frontRow: 1, cols: 4 },
  maxSelectable = Infinity,
}) {
  const cols = layout.cols ?? 4
  const frontRow = layout.frontRow ?? 1
  const hasDriver = layout.hasDriver ?? true
  const aisleAfter = layout.aisleAfter
  const hasFront = frontSeats.length > 0
  const genderValues = Object.values(seatGenders)
  const hasFemale = genderValues.includes('female')
  const hasMale = genderValues.includes('male')

  const seatState = (seat) => {
    if (bookedSeats.includes(seat)) return 'booked'
    if (selectedSeats.includes(seat)) return 'selected'
    return 'available'
  }

  const handleClick = (seat, state) => {
    if (state === 'booked') return
    if (state === 'available' && selectedSeats.length >= maxSelectable) return
    onToggle(seat)
  }

  const renderSeat = (seat) => {
    const state = seatState(seat)
    const booked = state === 'booked'
    const isFront = frontSeats.includes(seat)
    // Gender label only applies to a booked seat (the booker's gender).
    const gender = booked ? seatGenders[String(seat)] : null
    const className = ['seat', `seat-${state}`, !booked && isFront ? 'seat-front' : '', gender ? `seat-${gender}` : '']
      .filter(Boolean)
      .join(' ')
    const label = booked
      ? `Seat ${seat} — booked${gender ? ` by a ${gender} passenger` : ''}`
      : `Seat ${seat}${isFront ? ' (front)' : ''} — ${state}`
    return (
      <button
        type="button"
        key={seat}
        className={className}
        onClick={() => handleClick(seat, state)}
        disabled={booked}
        aria-label={label}
        title={label}
      >
        <FaChair />
        <span className="seat-num">{seat}</span>
        {!booked && isFront && <span className="seat-badge">F</span>}
        {gender === 'female' && <span className="seat-gender female" aria-hidden="true">F</span>}
        {gender === 'male' && <span className="seat-gender male" aria-hidden="true">M</span>}
      </button>
    )
  }

  // Seat 1…frontRow sit in the front row beside the driver.
  const frontSeatNums = Array.from(
    { length: Math.min(frontRow, totalSeats) },
    (_, i) => i + 1,
  )

  // The rest fill rows of `cols`.
  const backRows = []
  for (let i = frontSeatNums.length + 1; i <= totalSeats; i += cols) {
    backRows.push(Array.from({ length: cols }, (_, c) => i + c).filter((n) => n <= totalSeats))
  }

  return (
    <div className="seatmap">
      <div className="seatmap-cabin">
        {/* Front row: front passenger seat(s) on the left, driver on the RIGHT
            (Pakistan drives on the left → right-hand-drive vehicles). */}
        <div className="seat-row seat-row-front">
          {frontSeatNums.map((seat) => renderSeat(seat))}
          {hasDriver && (
            <span className="seat-driver" title="Driver — not for booking" aria-hidden="true">
              <GiSteeringWheel />
              <span className="seat-driver-text">Driver</span>
            </span>
          )}
        </div>

        {/* Remaining rows */}
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
        <span><i className="legend-box available" /> Available</span>
        <span><i className="legend-box selected" /> Selected</span>
        <span><i className="legend-box booked" /> Booked</span>
        {hasFront && <span><i className="legend-box front" /> Front</span>}
        {hasFemale && <span><i className="legend-box female" /> Female</span>}
        {hasMale && <span><i className="legend-box male" /> Male</span>}
      </div>
    </div>
  )
}
