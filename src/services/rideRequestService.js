// Ride-request marketplace — passenger posts a need; drivers accept or counter.
import { api, asEntity, asList } from './apiClient'

const byNewest = (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))

export async function createRideRequest(payload) {
  return asEntity(await api('/ride-requests', { method: 'POST', body: payload }), 'request')
}

export async function getMyRideRequests() {
  return asList(await api('/ride-requests?mine=1'), 'requests').sort(byNewest)
}

export async function getOpenRideRequests(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v != null && v !== '') params.set(k, v)
  })
  const qs = params.toString()
  return asList(await api(`/ride-requests${qs ? `?${qs}` : ''}`), 'requests').sort(byNewest)
}

/** Driver: open marketplace + any requests this driver has offered on. */
export async function getDriverRideRequests(filters = {}) {
  return getOpenRideRequests(filters)
}

export async function getRideRequest(id) {
  return asEntity(await api(`/ride-requests/${id}`), 'request')
}

export async function cancelRideRequest(id) {
  return asEntity(await api(`/ride-requests/${id}/cancel`, { method: 'PATCH' }), 'request')
}

/** Driver: accept at passenger price or counter-offer. */
export async function createRideOffer(requestId, payload) {
  return asEntity(
    await api(`/ride-requests/${requestId}/offers`, { method: 'POST', body: payload }),
    'offer'
  )
}

export async function acceptRideOffer(offerId) {
  return asEntity(await api(`/ride-offers/${offerId}/accept`, { method: 'PATCH' }), 'offer')
}

export async function declineRideOffer(offerId) {
  return asEntity(await api(`/ride-offers/${offerId}/decline`, { method: 'PATCH' }), 'offer')
}

export async function withdrawRideOffer(offerId) {
  return asEntity(await api(`/ride-offers/${offerId}/withdraw`, { method: 'PATCH' }), 'offer')
}

/** Passenger: pay for an accepted offer (creates booking). */
export async function bookRideOffer(offerId, paymentMethod) {
  return asEntity(
    await api(`/ride-offers/${offerId}/book`, {
      method: 'POST',
      body: { paymentMethod },
    }),
    'booking'
  )
}
