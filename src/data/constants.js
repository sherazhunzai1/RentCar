// Static reference data used across the app.
// When the backend is ready these can come from an API endpoint instead.
import { FaCar, FaShuttleVan, FaBus, FaTruckPickup } from 'react-icons/fa'

// Vehicle types a driver can post. `seatLayout` drives the seat map:
//   hasDriver  – show the (non-bookable) driver position in the front row
//   frontRow   – bookable seats beside the driver in the front row (seat 1…)
//   cols       – seats per row for the remaining rows
//   aisleAfter – optional column index to insert an aisle gap (van/bus)
// `maxSeats` mirrors the backend cap (car ≤ 4; suv/van/bus ≤ 24).
export const VEHICLE_TYPES = [
  {
    id: 'car',
    label: 'Car',
    icon: FaCar,
    description: 'Sedans & hatchbacks for small groups',
    defaultSeats: 4,
    maxSeats: 4,
    seatLayout: { hasDriver: true, frontRow: 1, cols: 3 },
  },
  {
    id: 'suv',
    label: 'SUV',
    icon: FaTruckPickup,
    description: 'Spacious rides for families & rough roads',
    defaultSeats: 6,
    maxSeats: 24,
    seatLayout: { hasDriver: true, frontRow: 1, cols: 3 },
  },
  {
    id: 'van',
    label: 'Van',
    icon: FaShuttleVan,
    description: 'Mini-vans & coasters for mid-size groups',
    defaultSeats: 12,
    maxSeats: 24,
    seatLayout: { hasDriver: true, frontRow: 1, cols: 3, aisleAfter: 2 },
  },
  {
    id: 'bus',
    label: 'Bus',
    icon: FaBus,
    description: 'Full-size coaches for long routes',
    defaultSeats: 24,
    maxSeats: 24,
    seatLayout: { hasDriver: true, frontRow: 1, cols: 4, aisleAfter: 2 },
  },
]

export const getVehicleType = (id) =>
  VEHICLE_TYPES.find((v) => v.id === id) || VEHICLE_TYPES[0]

export const AMENITIES = [
  'Air Conditioning',
  'WiFi',
  'Charging Port',
  'Reclining Seats',
  'Water Bottle',
  'Music System',
  'Luggage Space',
  'Reading Light',
]

export const USER_ROLES = {
  DRIVER: 'driver',
  PASSENGER: 'passenger',
}

export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
}
