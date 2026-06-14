// Auth service — mock implementation backed by localStorage.
//
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BACKEND INTEGRATION                                                   │
// │ Replace each function body with a real HTTP call, e.g.:               │
// │   const res = await fetch(`${API_URL}/auth/login`, { ... })          │
// │   if (!res.ok) throw new Error((await res.json()).message)           │
// │   return res.json()                                                   │
// │ The function signatures and return shapes can stay the same so the   │
// │ rest of the app keeps working unchanged.                              │
// └─────────────────────────────────────────────────────────────────────┘
import { db, delay, uid } from './storage'

// Strip the password before handing a user object to the UI.
const sanitize = ({ password, ...rest }) => rest

export async function signup({ name, email, password, role, phone, licenseNumber, experience }) {
  await delay()
  const users = db.getUsers()

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.')
  }

  const newUser = {
    id: uid(role),
    name,
    email,
    password, // NOTE: never store plain-text passwords in the real backend.
    role,
    phone: phone || '',
    createdAt: new Date().toISOString(),
    ...(role === 'driver'
      ? { licenseNumber: licenseNumber || '', experience: Number(experience) || 0 }
      : {}),
  }

  users.push(newUser)
  db.saveUsers(users)
  db.saveSession({ userId: newUser.id })
  return sanitize(newUser)
}

export async function login({ email, password }) {
  await delay()
  const users = db.getUsers()
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.')
  }

  db.saveSession({ userId: user.id })
  return sanitize(user)
}

export async function logout() {
  db.clearSession()
}

// Restores the session on page reload.
export function getCurrentUser() {
  const session = db.getSession()
  if (!session) return null
  const user = db.getUsers().find((u) => u.id === session.userId)
  return user ? sanitize(user) : null
}

export async function updateProfile(userId, updates) {
  await delay()
  const users = db.getUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx === -1) throw new Error('User not found.')
  users[idx] = { ...users[idx], ...updates }
  db.saveUsers(users)
  return sanitize(users[idx])
}
