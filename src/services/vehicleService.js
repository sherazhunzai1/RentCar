// Vehicle / listing service — talks to the gaadi.pk backend.
// Endpoints: GET /vehicles (+filters), GET /vehicles/:id, POST/PATCH/DELETE /vehicles/:id
import { api, asEntity, asList } from './apiClient'

const query = (params = {}) => {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, v)
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}

// Sort soonest-first as a safety net regardless of backend ordering.
const byDeparture = (a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
const byNewest = (a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))

// filters: { fromCity, toCity, vehicleType, date }
export async function getVehicles(filters = {}) {
  const list = asList(await api(`/vehicles${query(filters)}`, { auth: false }), 'vehicles')
  return list.sort(byDeparture)
}

export async function getVehicleById(id) {
  return asEntity(await api(`/vehicles/${id}`, { auth: false }), 'vehicle')
}

export async function getVehiclesByDriver(driverId) {
  const list = asList(await api(`/vehicles${query({ driverId })}`), 'vehicles')
  return list.sort(byNewest)
}

// Empty string / null / undefined → null; otherwise a Number. Used for the
// optional pricing fields so the backend receives numbers or null (never "").
const numOrNull = (v) => (v === '' || v == null ? null : Number(v))

// Coerce form values into the API's expected types.
function serializeVehicle(data) {
  const body = { ...data }
  if (body.totalSeats != null) body.totalSeats = Number(body.totalSeats)
  if (body.pricePerSeat != null) body.pricePerSeat = Number(body.pricePerSeat)
  if ('frontSeatPrice' in body) body.frontSeatPrice = numOrNull(body.frontSeatPrice)
  if ('wholeVehiclePrice' in body) body.wholeVehiclePrice = numOrNull(body.wholeVehiclePrice)
  if (Array.isArray(body.frontSeats)) body.frontSeats = body.frontSeats.map(Number)
  return body
}

export async function createVehicle(data) {
  return asEntity(
    await api('/vehicles', { method: 'POST', body: serializeVehicle(data) }),
    'vehicle',
  )
}

export async function updateVehicle(id, updates) {
  return asEntity(
    await api(`/vehicles/${id}`, { method: 'PATCH', body: serializeVehicle(updates) }),
    'vehicle',
  )
}

export async function deleteVehicle(id) {
  await api(`/vehicles/${id}`, { method: 'DELETE' })
  return true
}
