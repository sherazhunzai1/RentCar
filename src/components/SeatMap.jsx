import { FaChair } from 'react-icons/fa'
import { GiSteeringWheel } from 'react-icons/gi'

// Visual seat picker. Lays seats out in rows of `cols`, inserting an aisle gap
// after `aisleAfter` columns. Booked seats are disabled; the rider toggles the
// rest. `maxSelectable` optionally caps how many can be chosen at once.
export default function SeatMap({
  totalSeats,
  bookedSeats = [],
  selectedSeats = [],
  onToggle,
  layout = { cols: 4, aisleAfter: 1 },
  maxSelectable = Infinity,
}) {
  const { cols, aisleAfter } = layout

  const rows = []
  for (let i = 0; i < totalSeats; i += cols) {
    rows.push(
      Array.from({ length: cols }, (_, c) => i + c + 1).filter((n) => n <= totalSeats),
    )
  }

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

  return (
    <div className="seatmap">
      <div className="seatmap-cabin">
        <div className="seatmap-front">
          <GiSteeringWheel />
          <span>Driver</span>
        </div>

        <div className="seatmap-rows">
          {rows.map((row, rIdx) => (
            <div className="seat-row" key={rIdx}>
              {row.map((seat, cIdx) => {
                const state = seatState(seat)
                return (
                  <span key={seat} className="seat-cell">
                    {cIdx === aisleAfter && <span className="aisle" />}
                    <button
                      type="button"
                      className={`seat seat-${state}`}
                      onClick={() => handleClick(seat, state)}
                      disabled={state === 'booked'}
                      aria-label={`Seat ${seat} ${state}`}
                      title={`Seat ${seat} — ${state}`}
                    >
                      <FaChair />
                      <span className="seat-num">{seat}</span>
                    </button>
                  </span>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="seatmap-legend">
        <span><i className="legend-box available" /> Available</span>
        <span><i className="legend-box selected" /> Selected</span>
        <span><i className="legend-box booked" /> Booked</span>
      </div>
    </div>
  )
}
