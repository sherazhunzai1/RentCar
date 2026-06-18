// gaadi.pk per-trip social-card renderer.
//
// A tiny, dependency-free HTTP service. nginx proxies ONLY social-media crawler
// requests for /vehicles/:id here (see deploy/nginx-gaadi.pk.conf); real users
// keep getting the static SPA. For each request it fetches the trip from the
// backend and returns HTML with per-trip Open Graph / Twitter tags so links
// unfurl with the specific route, date and price.
//
// Run: node server/og-server.mjs   (configure with the env vars below)
import http from 'node:http'
import { buildTripHtml, buildFallbackHtml, normalizeVehicle } from './buildTripMeta.mjs'

const PORT = Number(process.env.OG_PORT || 8082)
const HOST = process.env.OG_HOST || '127.0.0.1'
const API_URL = (process.env.API_URL || 'http://127.0.0.1:5000/api').replace(/\/+$/, '')
const SITE_URL = (process.env.SITE_URL || 'https://gaadi.pk').replace(/\/+$/, '')
const OG_IMAGE = process.env.OG_IMAGE || `${SITE_URL}/og-image.png`
const TIMEOUT_MS = Number(process.env.OG_TIMEOUT_MS || 4000)

const VEHICLE_RE = /^\/vehicles\/([^/]+)\/?$/

async function fetchVehicle(id) {
  const res = await fetch(`${API_URL}/vehicles/${encodeURIComponent(id)}`, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`backend responded ${res.status}`)
  const vehicle = normalizeVehicle(await res.json())
  if (!vehicle || !vehicle.id) throw new Error('vehicle payload missing id')
  return vehicle
}

const server = http.createServer(async (req, res) => {
  let pathname = '/'
  try {
    pathname = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname
  } catch {
    /* fall through */
  }

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('ok')
    return
  }

  const match = pathname.match(VEHICLE_RE)
  if (!match) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
    return
  }

  const id = decodeURIComponent(match[1])
  let html
  try {
    const vehicle = await fetchVehicle(id)
    html = buildTripHtml(vehicle, { siteUrl: SITE_URL, ogImage: OG_IMAGE })
  } catch (err) {
    // Never break a link preview — fall back to the generic site card.
    console.error(`[og] /vehicles/${id}: ${err.message}`)
    html = buildFallbackHtml({ siteUrl: SITE_URL, ogImage: OG_IMAGE })
  }

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
  })
  res.end(html)
})

server.listen(PORT, HOST, () => {
  console.log(
    `gaadi.pk OG renderer listening on http://${HOST}:${PORT}  (API_URL=${API_URL}, SITE_URL=${SITE_URL})`,
  )
})
