// Tiny localStorage-backed "database" that seeds itself on first run.
// This is the ONLY file that touches persistence. When the real backend is
// ready, the service modules (authService/vehicleService/bookingService) are
// the layer you rewrite — this file can simply be deleted.
import { SEED_USERS, SEED_VEHICLES } from '../data/seedData'

const KEYS = {
  USERS: 'rentcar_users',
  VEHICLES: 'rentcar_vehicles',
  BOOKINGS: 'rentcar_bookings',
  SESSION: 'rentcar_session',
  SEEDED: 'rentcar_seeded',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Populate the store with demo data the first time the app runs.
function ensureSeeded() {
  if (localStorage.getItem(KEYS.SEEDED)) return
  write(KEYS.USERS, SEED_USERS)
  write(KEYS.VEHICLES, SEED_VEHICLES)
  write(KEYS.BOOKINGS, [])
  localStorage.setItem(KEYS.SEEDED, '1')
}

ensureSeeded()

export const db = {
  // Users
  getUsers: () => read(KEYS.USERS, []),
  saveUsers: (users) => write(KEYS.USERS, users),

  // Vehicles / listings
  getVehicles: () => read(KEYS.VEHICLES, []),
  saveVehicles: (vehicles) => write(KEYS.VEHICLES, vehicles),

  // Bookings
  getBookings: () => read(KEYS.BOOKINGS, []),
  saveBookings: (bookings) => write(KEYS.BOOKINGS, bookings),

  // Auth session (stores the logged-in user id)
  getSession: () => read(KEYS.SESSION, null),
  saveSession: (session) => write(KEYS.SESSION, session),
  clearSession: () => localStorage.removeItem(KEYS.SESSION),
}

// Simulate network latency so loading states are exercised.
export const delay = (ms = 450) => new Promise((res) => setTimeout(res, ms))

// Simple unique id generator for demo records.
export const uid = (prefix = 'id') =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
