// Booking service — mock implementation backed by localStorage.
// See authService.js for notes on swapping in the real backend.
import { db, delay, uid } from './storage'

export async function getBookingById(id) {
  await delay(250)
  const booking = db.getBookings().find((b) => b.id === id)
  if (!booking) throw new Error('Booking not found.')
  return booking
}

export async function getBookingsByUser(userId) {
  await delay(300)
  return db
    .getBookings()
    .filter((b) => b.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// Bookings made against a specific driver's vehicles (for the driver dashboard).
export async function getBookingsByDriver(driverId) {
  await delay(300)
  return db
    .getBookings()
    .filter((b) => b.driverId === driverId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// Creates a booking, marks the seats as taken, and records a (mock) payment.
// `payment` is the card form data — in production the gateway returns a token.
export async function createBooking({ vehicle, user, seats, payment }) {
  await delay(700)
  const vehicles = db.getVehicles()
  const idx = vehicles.findIndex((v) => v.id === vehicle.id)
  if (idx === -1) throw new Error('Vehicle not found.')

  const current = vehicles[idx]
  // Guard against a seat being grabbed by someone else mid-checkout.
  const clash = seats.filter((s) => current.bookedSeats.includes(s))
  if (clash.length) {
    throw new Error(`Seat(s) ${clash.join(', ')} were just booked. Please pick again.`)
  }

  current.bookedSeats = [...current.bookedSeats, ...seats].sort((a, b) => a - b)
  vehicles[idx] = current
  db.saveVehicles(vehicles)

  const booking = {
    id: uid('bkg'),
    bookingRef: `RC${Date.now().toString().slice(-8)}`,
    vehicleId: vehicle.id,
    driverId: vehicle.driverId,
    userId: user.id,
    passengerName: user.name,
    vehicleName: vehicle.vehicleName,
    vehicleType: vehicle.vehicleType,
    fromCity: vehicle.fromCity,
    toCity: vehicle.toCity,
    date: vehicle.date,
    time: vehicle.time,
    seats,
    pricePerSeat: vehicle.pricePerSeat,
    totalAmount: seats.length * vehicle.pricePerSeat,
    status: 'confirmed',
    paymentMethod: payment?.method || 'card',
    paidAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }

  const bookings = db.getBookings()
  bookings.push(booking)
  db.saveBookings(bookings)
  return booking
}

export async function cancelBooking(bookingId) {
  await delay()
  const bookings = db.getBookings()
  const booking = bookings.find((b) => b.id === bookingId)
  if (!booking) throw new Error('Booking not found.')
  booking.status = 'cancelled'
  db.saveBookings(bookings)

  // Release the seats back to the vehicle.
  const vehicles = db.getVehicles()
  const vehicle = vehicles.find((v) => v.id === booking.vehicleId)
  if (vehicle) {
    vehicle.bookedSeats = vehicle.bookedSeats.filter((s) => !booking.seats.includes(s))
    db.saveVehicles(vehicles)
  }
  return booking
}
