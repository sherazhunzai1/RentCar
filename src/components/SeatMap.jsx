import { FaChair } from 'react-icons/fa'
import { GiSteeringWheel } from 'react-icons/gi'

// Visual seat picker laid out like a real cabin:
//   - the front row shows the (non-bookable) driver plus `frontRow` seat(s)
//     beside them — so seat 1 sits next to the driver
//   - the remaining seats fill rows of `cols`, with an optional aisle gap
// Booked seats are disabled; front-priced seats (in `frontSeats`) get an "F".
export default function SeatMap({
  totalSeats,
  bookedSeats = [],
  selectedSeats = [],
  frontSeats = [],
  onToggle,
  layout = { hasDriver: true, frontRow: 1, cols: 4 },
  maxSelectable = Infinity,
}) {
  const cols = layout.cols ?? 4
  const frontRow = layout.frontRow ?? 1
  const hasDriver = layout.hasDriver ?? true
  const aisleAfter = layout.aisleAfter
  const hasFront = frontSeats.length > 0

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
    const isFront = frontSeats.includes(seat)
    return (
      <button
        type="button"
        key={seat}
        className={`seat seat-${state}${isFront ? ' seat-front' : ''}`}
        onClick={() => handleClick(seat, state)}
        disabled={state === 'booked'}
        aria-label={`Seat ${seat} ${isFront ? 'front ' : ''}${state}`}
        title={`Seat ${seat}${isFront ? ' (front)' : ''} — ${state}`}
      >
        <FaChair />
        <span className="seat-num">{seat}</span>
        {isFront && <span className="seat-badge">F</span>}
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
      </div>
    </div>
  )
}
