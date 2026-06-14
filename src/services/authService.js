// Auth service — talks to the RentCar backend.
// Endpoints: POST /auth/signup, POST /auth/login, GET /auth/me, PATCH /users/:id
import { api, asEntity, tokenStore } from './apiClient'

export async function signup({ name, email, password, role, phone, licenseNumber, experience }) {
  const body = { name, email, password, role, phone }
  if (role === 'driver') {
    body.licenseNumber = licenseNumber
    body.experience = Number(experience) || 0
  }
  const data = await api('/auth/signup', { method: 'POST', body, auth: false })
  tokenStore.set(data.token)
  return asEntity(data, 'user')
}

export async function login({ email, password }) {
  const data = await api('/auth/login', { method: 'POST', body: { email, password }, auth: false })
  tokenStore.set(data.token)
  return asEntity(data, 'user')
}

export async function logout() {
  tokenStore.clear()
}

// Restores the session on reload by validating the stored token.
export async function getCurrentUser() {
  if (!tokenStore.get()) return null
  try {
    return asEntity(await api('/auth/me'), 'user')
  } catch {
    tokenStore.clear()
    return null
  }
}

export async function updateProfile(userId, updates) {
  return asEntity(await api(`/users/${userId}`, { method: 'PATCH', body: updates }), 'user')
}
