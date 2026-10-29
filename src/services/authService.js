// Auth service — talks to the gaadi.pk backend.
// Endpoints: POST /auth/signup, POST /auth/login, GET /auth/me, PATCH /users/:id
import { api, asEntity, tokenStore } from './apiClient'

export async function signup({
  name,
  email,
  password,
  role,
  phone,
  gender,
  licenseNumber,
  experience,
  vehicleType,
  vehicleName,
  vehicleNumber,
}) {
  const body = { name, email, password, role, phone }
  if (gender) body.gender = gender
  if (role === 'driver') {
    body.licenseNumber = licenseNumber
    body.experience = Number(experience) || 0
    body.vehicleType = vehicleType
    body.vehicleName = vehicleName
    body.vehicleNumber = vehicleNumber
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

/** Upload a profile picture (multipart field name: `avatar`). */
export async function uploadAvatar(userId, file) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const headers = {}
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`

  const body = new FormData()
  body.append('avatar', file)

  let res
  try {
    res = await fetch(`${API_URL}/users/${userId}/avatar`, {
      method: 'POST',
      headers,
      body,
    })
  } catch {
    throw new Error('Unable to reach the server. Please make sure the backend is running.')
  }

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    if (res.status === 401) tokenStore.clear()
    throw new Error((data && (data.message || data.error)) || `Upload failed (${res.status})`)
  }
  return asEntity(data, 'user')
}

/** Remove the current profile picture. */
export async function deleteAvatar(userId) {
  return asEntity(await api(`/users/${userId}/avatar`, { method: 'DELETE' }), 'user')
}

/** Request a 6-digit password reset code by email. */
export async function requestPasswordReset(email) {
  return api('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    auth: false,
  })
}

/** Check the emailed code before showing the new-password form. */
export async function verifyResetCode({ email, code }) {
  return api('/auth/verify-reset-code', {
    method: 'POST',
    body: { email, code },
    auth: false,
  })
}

/** Set a new password using email + code. */
export async function resetPassword({ email, code, password }) {
  return api('/auth/reset-password', {
    method: 'POST',
    body: { email, code, password },
    auth: false,
  })
}
