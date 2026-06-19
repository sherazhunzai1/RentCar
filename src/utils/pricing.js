// Booking price math, mirroring the backend rules:
//   - a front seat (in vehicle.frontSeats) costs frontSeatPrice when that is set,
//     otherwise the normal pricePerSeat
//   - whole-vehicle booking = flat wholeVehiclePrice for every seat
//   - serviceFee = 5% of subtotal (rounded); total = subtotal + serviceFee
// The backend is authoritative on a created booking; this is for the live UI.

export function isFrontSeat(vehicle, seat) {
  return Array.isArray(vehicle?.frontSeats) && vehicle.frontSeats.includes(seat)
}

// Price for a single seat number on this vehicle.
export function seatPrice(vehicle, seat) {
  if (isFrontSeat(vehicle, seat) && vehicle.frontSeatPrice != null) {
    return vehicle.frontSeatPrice
  }
  return vehicle.pricePerSeat
}

export function allSeats(vehicle) {
  return Array.from({ length: vehicle.totalSeats }, (_, i) => i + 1)
}

// Given a vehicle and a selection, returns the breakdown the UI displays.
// selection = { seats?: number[], bookWholeVehicle?: boolean }
export function computePricing(vehicle, { seats = [], bookWholeVehicle = false } = {}) {
  let bookingType, finalSeats, seatPrices, subtotal

  if (bookWholeVehicle) {
    bookingType = 'whole'
    finalSeats = allSeats(vehicle)
    seatPrices = null
    subtotal = vehicle.wholeVehiclePrice ?? 0
  } else {
    bookingType = 'seats'
    finalSeats = seats
    seatPrices = seats.map((s) => ({ seat: s, price: seatPrice(vehicle, s) }))
    subtotal = seatPrices.reduce((sum, sp) => sum + sp.price, 0)
  }

  const serviceFee = Math.round(subtotal * 0.05)
  const total = subtotal + serviceFee
  return { bookingType, seats: finalSeats, seatPrices, subtotal, serviceFee, total }
}
