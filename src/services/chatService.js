// Per-booking chat REST calls. All require auth; only the booking's passenger
// and driver may access (others get 403). Mirrors authService error handling.
import { api, asEntity, asList } from './apiClient'

// Message history, oldest first. `since` = ISO createdAt to fetch only newer.
export async function getMessages(bookingId, since) {
  const q = since ? `?since=${encodeURIComponent(since)}` : ''
  return asList(await api(`/bookings/${bookingId}/messages${q}`), 'messages')
}

// Send via REST (the backend still broadcasts it live over Socket.IO).
export async function sendMessage(bookingId, body) {
  return asEntity(
    await api(`/bookings/${bookingId}/messages`, { method: 'POST', body: { body } }),
    'message',
  )
}

// Mark the OTHER party's messages as read → { success, marked }.
export async function markRead(bookingId) {
  return api(`/bookings/${bookingId}/messages/read`, { method: 'PATCH' })
}
