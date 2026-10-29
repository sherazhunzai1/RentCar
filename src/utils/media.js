// Resolve API-hosted media paths (e.g. /uploads/avatars/…) for <img src>.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function apiOrigin() {
  try {
    return new URL(API_URL, typeof window !== 'undefined' ? window.location.origin : 'http://localhost').origin
  } catch {
    return 'http://localhost:5000'
  }
}

export function mediaUrl(path) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  const origin = apiOrigin()
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}
