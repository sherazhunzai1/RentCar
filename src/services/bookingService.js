// Booking service — talks to the gaadi.pk backend.
// Endpoints: GET /bookings (?userId/?driverId), GET /bookings/:id,
//            POST /bookings, PATCH /bookings/:id/cancel,
//            GET /bookings/:id/ticket.pdf, POST /bookings/:id/ticket/email
import { api, asEntity, asList, tokenStore } from './apiClient'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
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
  const body = { vehicleId: vehicle.id, paymentMethod: payment?.method || 'safepay' }
  if (bookWholeVehicle) body.bookWholeVehicle = true
  else body.seats = seats
  return asEntity(await api('/bookings', { method: 'POST', body }), 'booking')
}

export async function cancelBooking(bookingId) {
  return asEntity(await api(`/bookings/${bookingId}/cancel`, { method: 'PATCH' }), 'booking')
}

/** Download the boarding ticket PDF for a booking. */
export async function downloadTicketPdf(bookingId, bookingRef) {
  const headers = {}
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_URL}/bookings/${bookingId}/ticket.pdf`, { headers })
  if (!res.ok) {
    const text = await res.text()
    let message = `Download failed (${res.status})`
    try {
      message = JSON.parse(text).message || message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gaadi-ticket-${bookingRef || bookingId}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Re-send the ticket PDF to the passenger's email. */
export async function emailTicket(bookingId) {
  return api(`/bookings/${bookingId}/ticket/email`, { method: 'POST' })
}
