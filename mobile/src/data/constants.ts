export const VEHICLE_TYPES = [
  {
    id: 'car',
    label: 'Car',
    defaultSeats: 4,
    maxSeats: 4,
    seatLayout: { hasDriver: true, frontRow: 1, cols: 3 },
  },
  {
    id: 'suv',
    label: 'SUV',
    defaultSeats: 6,
    maxSeats: 24,
    seatLayout: { hasDriver: true, frontRow: 1, cols: 3 },
  },
  {
    id: 'van',
    label: 'Van',
    defaultSeats: 12,
    maxSeats: 24,
    seatLayout: { hasDriver: true, frontRow: 1, cols: 3, aisleAfter: 2 },
  },
  {
    id: 'bus',
    label: 'Bus',
    defaultSeats: 24,
    maxSeats: 24,
    seatLayout: { hasDriver: true, frontRow: 1, cols: 4, aisleAfter: 2 },
  },
]

export const getVehicleType = (id: string) =>
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

export const FALLBACK_CITIES = [
  'Gilgit',
  'Hunza',
  'Skardu',
  'Ghizer',
  'Islamabad',
  'Rawalpindi',
  'Lahore',
  'Karachi',
]
