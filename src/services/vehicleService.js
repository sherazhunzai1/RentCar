// Vehicle / listing service — mock implementation backed by localStorage.
// See authService.js for notes on swapping in the real backend.
import { db, delay, uid } from './storage'

// List all vehicles, optionally filtered. `filters` is an object:
//   { fromCity, toCity, vehicleType, date }
export async function getVehicles(filters = {}) {
  await delay(300)
  let vehicles = db.getVehicles()

  if (filters.fromCity) {
    vehicles = vehicles.filter((v) => v.fromCity === filters.fromCity)
  }
  if (filters.toCity) {
    vehicles = vehicles.filter((v) => v.toCity === filters.toCity)
  }
  if (filters.vehicleType) {
    vehicles = vehicles.filter((v) => v.vehicleType === filters.vehicleType)
  }
  if (filters.date) {
    vehicles = vehicles.filter((v) => v.date === filters.date)
  }

  // Soonest departures first.
  return vehicles.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
}

export async function getVehicleById(id) {
  await delay(250)
  const vehicle = db.getVehicles().find((v) => v.id === id)
  if (!vehicle) throw new Error('Vehicle not found.')
  return vehicle
}

export async function getVehiclesByDriver(driverId) {
  await delay(300)
  return db
    .getVehicles()
    .filter((v) => v.driverId === driverId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function createVehicle(driver, data) {
  await delay()
  const vehicles = db.getVehicles()
  const newVehicle = {
    id: uid('veh'),
    driverId: driver.id,
    driverName: driver.name,
    driverPhone: driver.phone || '',
    bookedSeats: [],
    rating: 0,
    createdAt: new Date().toISOString(),
    ...data,
    totalSeats: Number(data.totalSeats),
    pricePerSeat: Number(data.pricePerSeat),
  }
  vehicles.push(newVehicle)
  db.saveVehicles(vehicles)
  return newVehicle
}

export async function updateVehicle(id, updates) {
  await delay()
  const vehicles = db.getVehicles()
  const idx = vehicles.findIndex((v) => v.id === id)
  if (idx === -1) throw new Error('Vehicle not found.')
  vehicles[idx] = { ...vehicles[idx], ...updates }
  db.saveVehicles(vehicles)
  return vehicles[idx]
}

export async function deleteVehicle(id) {
  await delay()
  const vehicles = db.getVehicles().filter((v) => v.id !== id)
  db.saveVehicles(vehicles)
}
