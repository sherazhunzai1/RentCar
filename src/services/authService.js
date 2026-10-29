// Auth service — talks to the gaadi.pk backend.
// Endpoints: POST /auth/signup, POST /auth/login, GET /auth/me, PATCH /users/:id
import { api, asEntity, tokenStore } from './apiClient'

export async function signup({ name, email, password, role, phone, gender, licenseNumber, experience }) {
  const body = { name, email, password, role, phone }
  if (gender) body.gender = gender
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
