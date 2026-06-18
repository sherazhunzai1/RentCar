// Pure helpers that turn a vehicle record into a crawler-friendly HTML document
// with per-trip Open Graph / Twitter tags. No dependencies — used by og-server.mjs.

const VEHICLE_LABELS = { car: 'Car', suv: 'SUV', van: 'Van', bus: 'Bus' }

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

function money(n) {
  try {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(Number(n) || 0)
  } catch {
    return `PKR ${n}`
  }
}

function niceDate(d) {
  if (!d) return ''
  const dt = new Date(`${d}T00:00:00`)
  if (Number.isNaN(dt.getTime())) return String(d)
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function niceTime(t) {
  if (!t) return ''
  const [h, m] = String(t).split(':').map(Number)
  if (Number.isNaN(h)) return String(t)
  const period = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return `${hr}:${String(m || 0).padStart(2, '0')} ${period}`
}

// Accepts a bare vehicle, or one wrapped as { vehicle } / { data }; maps _id→id.
export function normalizeVehicle(raw) {
  if (!raw) return null
  const v = raw.vehicle || raw.data || raw
  if (!v || typeof v !== 'object') return null
  return { ...v, id: v.id || v._id }
}

export function buildTripHtml(v, { siteUrl, ogImage } = {}) {
  const type = VEHICLE_LABELS[v.vehicleType] || 'Vehicle'
  const route = `${v.fromCity} to ${v.toCity}`
  const total = Number(v.totalSeats) || 0
  const booked = Array.isArray(v.bookedSeats) ? v.bookedSeats.length : 0
  const available = Math.max(total - booked, 0)
  const price = money(v.pricePerSeat)
  const url = `${siteUrl}/vehicles/${v.id}`
  const img = ogImage || `${siteUrl}/og-image.png`

  const title = `${route} by ${type} — gaadi.pk`
  const desc = `Book a seat on ${v.vehicleName} from ${v.fromCity} to ${v.toCity} on ${niceDate(
    v.date,
  )} at ${niceTime(v.time)}. ${available} seat${
    available === 1 ? '' : 's'
  } available from ${price} per seat. Apni seat, apni gaadi.`

  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Vehicles', item: `${siteUrl}/vehicles` },
      { '@type': 'ListItem', position: 3, name: route, item: url },
    ],
  })

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${esc(url)}" />
<meta name="robots" content="index, follow" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="gaadi.pk" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${esc(img)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${esc(route)} on gaadi.pk" />
<meta property="og:locale" content="en_PK" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${esc(img)}" />
<script type="application/ld+json">${jsonld}</script>
</head>
<body>
<main style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:48px auto;padding:0 20px;color:#0f172a">
<h1 style="margin:0 0 4px">${esc(route)}</h1>
<p style="color:#64748b;margin:0 0 16px">${esc(v.vehicleName)} · ${esc(type)}</p>
<p>${esc(niceDate(v.date))} at ${esc(niceTime(v.time))}</p>
<p>${available} seat${available === 1 ? '' : 's'} available · from <strong>${esc(price)}</strong> per seat</p>
<p style="margin-top:24px"><a href="${esc(url)}">View &amp; book this trip on gaadi.pk →</a></p>
</main>
</body>
</html>`
}

// Generic site card used when the trip can't be loaded (so the unfurl still works).
export function buildFallbackHtml({ siteUrl, ogImage } = {}) {
  const url = `${siteUrl}/`
  const img = ogImage || `${siteUrl}/og-image.png`
  const title = 'gaadi.pk — Book Your Seat, Travel All of Pakistan'
  const desc =
    'Book seats in cars, vans and buses for intercity travel across Pakistan. Apni seat, apni gaadi.'
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${esc(url)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="gaadi.pk" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${esc(img)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${esc(img)}" />
</head>
<body><main style="font-family:system-ui,sans-serif;max-width:640px;margin:48px auto;padding:0 20px"><a href="${esc(
    url,
  )}">gaadi.pk — book your seat across Pakistan →</a></main></body>
</html>`
}
