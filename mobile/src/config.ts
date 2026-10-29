/** Live website — same passenger & driver experience as gaadi.pk */
export const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL || 'https://gaadi.pk').replace(
  /\/+$/,
  '',
)

/** REST API (same-origin /api on production) */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || `${SITE_URL}/api`).replace(/\/+$/, '')

export const BRAND = {
  blue: '#2563eb',
  green: '#22c55e',
  dark: '#0f172a',
  muted: '#64748b',
  bg: '#f8fafc',
}
