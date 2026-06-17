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

// The passenger is derived from the JWT on the backend; we only send the
// vehicle, the chosen seats and the payment method.
export async function createBooking({ vehicle, seats, payment }) {
  return asEntity(
    await api('/bookings', {
      method: 'POST',
      body: { vehicleId: vehicle.id, seats, paymentMethod: payment?.method || 'card' },
    }),
    'booking',
  )
}

export async function cancelBooking(bookingId) {
  return asEntity(await api(`/bookings/${bookingId}/cancel`, { method: 'PATCH' }), 'booking')
}
