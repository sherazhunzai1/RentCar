import { api, asEntity, asList } from './client'
import type { Vehicle } from './vehicles'

export type Booking = {
  id: string
  bookingRef?: string
  userId: string
  driverId: string
  vehicleId: string
  passengerName?: string
  gender?: 'male' | 'female' | null
  fromCity?: string
  toCity?: string
  date?: string
  time?: string
  seats: number[]
  bookingType?: 'seats' | 'whole'
  bookWholeVehicle?: boolean
  status: string
  paymentMethod?: string
  paymentStatus?: string
  paymentGateway?: string
  subtotal?: number
  serviceFee?: number
  totalAmount?: number
  vehicleName?: string
  vehicleType?: string
  createdAt?: string
  payment?: {
    redirectUrl?: string
    gateway?: string
    tracker?: string
    mock?: boolean
  }
}

const byNewest = (a: Booking, b: Booking) =>
  String(b.createdAt || '').localeCompare(String(a.createdAt || ''))

export async function getBookingById(id: string) {
  return asEntity<Booking>(await api(`/bookings/${id}`), 'booking')
}

export async function getBookingsByUser(userId: string) {
  return asList<Booking>(await api(`/bookings?userId=${userId}`), 'bookings').sort(byNewest)
}

export async function getBookingsByDriver(driverId: string) {
  return asList<Booking>(await api(`/bookings?driverId=${driverId}`), 'bookings').sort(byNewest)
}

export async function createBooking({
  vehicle,
  seats,
  bookWholeVehicle,
  paymentMethod = 'safepay',
}: {
  vehicle: Vehicle
  seats?: number[]
  bookWholeVehicle?: boolean
  paymentMethod?: string
}) {
  const body: Record<string, unknown> = { vehicleId: vehicle.id, paymentMethod }
  if (bookWholeVehicle) body.bookWholeVehicle = true
  else body.seats = seats
  return asEntity<Booking>(await api('/bookings', { method: 'POST', body }), 'booking')
}

export async function cancelBooking(bookingId: string) {
  return asEntity<Booking>(await api(`/bookings/${bookingId}/cancel`, { method: 'PATCH' }), 'booking')
}
