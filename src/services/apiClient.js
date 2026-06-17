// Central HTTP client for the gaadi.pk backend.
//
// Base URL comes from VITE_API_URL (set in .env) and falls back to the local
// backend. Every request attaches the stored JWT as a Bearer token and unwraps
// the JSON response, throwing an Error(message) on failure so the existing
// try/catch blocks in the pages keep working unchanged.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'gaadi_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => token && localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

function safeParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = tokenStore.get()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Unable to reach the server. Please make sure the backend is running.')
  }

  // Tolerate empty bodies (e.g. 204 from DELETE).
  const text = await res.text()
  const data = text ? safeParse(text) : null

  if (!res.ok) {
    if (res.status === 401) tokenStore.clear()
    const message = (data && (data.message || data.error)) || `Request failed (${res.status})`
    throw new Error(message)
  }
  return data
}

// --- Response normalizers -------------------------------------------------
// The frontend keys everything off `id`. If the backend returns Mongo's `_id`,
// map it across so nothing downstream has to care.
export const withId = (obj) =>
  obj && typeof obj === 'object' && obj._id && !obj.id ? { ...obj, id: String(obj._id) } : obj

// Pull a single entity out of either a bare object or a `{ <key>: {...} }` wrapper.
export const asEntity = (data, key) =>
  withId(data && key && data[key] != null ? data[key] : data)

// Pull an array out of either a bare array or a `{ <key>: [...] }` / `{ data: [...] }` wrapper.
export const asList = (data, key) => {
  const list = Array.isArray(data)
    ? data
    : (data && (data[key] || data.data || data.items)) || []
  return list.map(withId)
}
