import { api, asEntity, tokenStore } from './client'

export type User = {
  id: string
  name: string
  email: string
  phone?: string
  role: 'passenger' | 'driver' | string
  gender?: string
  licenseNumber?: string
  experience?: number
  createdAt?: string
}

export async function signup(payload: Record<string, unknown>) {
  const body: Record<string, unknown> = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role,
    phone: payload.phone,
  }
  if (payload.gender) body.gender = payload.gender
  if (payload.role === 'driver') {
    body.licenseNumber = payload.licenseNumber
    body.experience = Number(payload.experience) || 0
  }
  const data = await api('/auth/signup', { method: 'POST', body, auth: false })
  await tokenStore.set((data as { token?: string }).token)
  return asEntity<User>(data, 'user')
}

export async function login({ email, password }: { email: string; password: string }) {
  const data = await api('/auth/login', { method: 'POST', body: { email, password }, auth: false })
  await tokenStore.set((data as { token?: string }).token)
  return asEntity<User>(data, 'user')
}

export async function logout() {
  await tokenStore.clear()
}

export async function getCurrentUser() {
  if (!(await tokenStore.get())) return null
  try {
    return asEntity<User>(await api('/auth/me'), 'user')
  } catch {
    await tokenStore.clear()
    return null
  }
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  return asEntity<User>(await api(`/users/${userId}`, { method: 'PATCH', body: updates }), 'user')
}
