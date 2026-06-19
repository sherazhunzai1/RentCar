// Static reference data used across the app.
// When the backend is ready these can come from an API endpoint instead.
import { FaCar, FaShuttleVan, FaBus, FaTruckPickup } from 'react-icons/fa'

// Vehicle types a driver can post. `seatLayout` describes how the seat map
// is rendered: `cols` seats per row and an optional `aisleAfter` index.
// `maxSeats` mirrors the backend cap (car ≤ 4; suv/van/bus ≤ 24).
export const VEHICLE_TYPES = [
  {
    id: 'car',
    label: 'Car',
    icon: FaCar,
    description: 'Sedans & hatchbacks for small groups',
    defaultSeats: 4,
    maxSeats: 4,
    seatLayout: { cols: 2, aisleAfter: 1 },
  },
  {
    id: 'suv',
    label: 'SUV',
    icon: FaTruckPickup,
    description: 'Spacious rides for families & rough roads',
    defaultSeats: 6,
    maxSeats: 24,
    seatLayout: { cols: 3, aisleAfter: 1 },
  },
  {
    id: 'van',
    label: 'Van',
    icon: FaShuttleVan,
    description: 'Mini-vans & coasters for mid-size groups',
    defaultSeats: 12,
    maxSeats: 24,
    seatLayout: { cols: 3, aisleAfter: 1 },
  },
  {
    id: 'bus',
    label: 'Bus',
    icon: FaBus,
    description: 'Full-size coaches for long routes',
    defaultSeats: 24,
    maxSeats: 24,
    seatLayout: { cols: 4, aisleAfter: 1 },
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
