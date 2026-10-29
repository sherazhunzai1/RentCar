export const SERVICE_FEE_RATE = 0.05

export function isFrontSeat(vehicle: { frontSeats?: number[] }, seat: number) {
  return Array.isArray(vehicle?.frontSeats) && vehicle.frontSeats.includes(seat)
}

export function seatPrice(
  vehicle: { frontSeats?: number[]; frontSeatPrice?: number | null; pricePerSeat: number },
  seat: number,
) {
  if (isFrontSeat(vehicle, seat) && vehicle.frontSeatPrice != null) return vehicle.frontSeatPrice
  return vehicle.pricePerSeat
}

export function allSeats(vehicle: { totalSeats: number }) {
  return Array.from({ length: vehicle.totalSeats }, (_, i) => i + 1)
}

export function computePricing(
  vehicle: {
    totalSeats: number
    pricePerSeat: number
    frontSeats?: number[]
    frontSeatPrice?: number | null
    wholeVehiclePrice?: number | null
  },
  { seats = [], bookWholeVehicle = false }: { seats?: number[]; bookWholeVehicle?: boolean } = {},
) {
  let bookingType: 'whole' | 'seats'
  let finalSeats: number[]
  let seatPrices: { seat: number; price: number }[] | null
  let subtotal: number

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

  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE)
  const total = subtotal + serviceFee
  return { bookingType, seats: finalSeats, seatPrices, subtotal, serviceFee, total }
}
