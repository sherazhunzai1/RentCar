// Booking service — talks to the gaadi.pk backend.
// Endpoints: GET /bookings (?userId/?driverId), GET /bookings/:id,
//            POST /bookings, PATCH /bookings/:id/cancel
import { api, asEntity, asList } from './apiClient'

const byNewest = (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))

export async function getBookingById(id) {
  return asEntity(await api(`/bookings/${id}`), 'booking')
}

export async function getBookingsByUser(userId) {
  return asList(await api(`/bookings?userId=${userId}`), 'bookings').sort(byNewest)
}

export async function getBookingsByDriver(driverId) {
  return asList(await api(`/bookings?driverId=${driverId}`), 'bookings').sort(byNewest)
}

// The passenger is derived from the JWT on the backend. We send either specific
// seats or bookWholeVehicle, plus the payment method.
export async function createBooking({ vehicle, seats, bookWholeVehicle, payment }) {
  const body = { vehicleId: vehicle.id, paymentMethod: payment?.method || 'card' }
  if (bookWholeVehicle) body.bookWholeVehicle = true
  else body.seats = seats
  return asEntity(await api('/bookings', { method: 'POST', body }), 'booking')
}

export async function cancelBooking(bookingId) {
  return asEntity(await api(`/bookings/${bookingId}/cancel`, { method: 'PATCH' }), 'booking')
}
