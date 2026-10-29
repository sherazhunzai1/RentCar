import { api, asEntity, asList } from './client'

export type Vehicle = {
  id: string
  driverId: string
  driverName?: string
  vehicleType: string
  vehicleName: string
  vehicleNumber: string
  fromCity: string
  toCity: string
  date: string
  time: string
  totalSeats: number
  bookedSeats?: number[]
  availableSeats?: number
  pricePerSeat: number
  frontSeatPrice?: number | null
  frontSeats?: number[]
  wholeVehiclePrice?: number | null
  amenities?: string[]
  seatGenders?: Record<string, string>
  rating?: number
  createdAt?: string
}

const query = (params: Record<string, string | undefined> = {}) => {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, v)
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}

const byDeparture = (a: Vehicle, b: Vehicle) =>
  `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
const byNewest = (a: Vehicle, b: Vehicle) =>
  String(b.createdAt || '').localeCompare(String(a.createdAt || ''))

const numOrNull = (v: unknown) => (v === '' || v == null ? null : Number(v))

function serializeVehicle(data: Record<string, unknown>) {
  const body = { ...data }
  if (body.totalSeats != null) body.totalSeats = Number(body.totalSeats)
  if (body.pricePerSeat != null) body.pricePerSeat = Number(body.pricePerSeat)
  if ('frontSeatPrice' in body) body.frontSeatPrice = numOrNull(body.frontSeatPrice)
  if ('wholeVehiclePrice' in body) body.wholeVehiclePrice = numOrNull(body.wholeVehiclePrice)
  if (Array.isArray(body.frontSeats)) body.frontSeats = (body.frontSeats as number[]).map(Number)
  return body
}

export async function getVehicles(filters: Record<string, string | undefined> = {}) {
  return asList<Vehicle>(await api(`/vehicles${query(filters)}`, { auth: false }), 'vehicles').sort(
    byDeparture,
  )
}

export async function getVehicleById(id: string) {
  return asEntity<Vehicle>(await api(`/vehicles/${id}`, { auth: false }), 'vehicle')
}

export async function getVehiclesByDriver(driverId: string) {
  return asList<Vehicle>(await api(`/vehicles${query({ driverId })}`), 'vehicles').sort(byNewest)
}

export async function createVehicle(data: Record<string, unknown>) {
  return asEntity<Vehicle>(await api('/vehicles', { method: 'POST', body: serializeVehicle(data) }), 'vehicle')
}

export async function updateVehicle(id: string, updates: Record<string, unknown>) {
  return asEntity<Vehicle>(
    await api(`/vehicles/${id}`, { method: 'PATCH', body: serializeVehicle(updates) }),
    'vehicle',
  )
}

export async function deleteVehicle(id: string) {
  await api(`/vehicles/${id}`, { method: 'DELETE' })
  return true
}
