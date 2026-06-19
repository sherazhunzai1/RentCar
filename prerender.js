// Build-time prerendering for static routes.
//
// Runs after `vite build` (client) and `vite build --ssr` (server bundle). For
// each route below it renders the React app to HTML and injects route-specific
// <head> tags, writing dist/<route>/index.html. Dynamic routes (e.g.
// /vehicles/:id) and auth pages are NOT prerendered — they fall back to the SPA
// shell via the host rewrite (vercel.json / _redirects).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_URL = 'https://gaadi.pk'
const DEFAULT_TITLE = 'gaadi.pk — Book Seats to Hunza, Gilgit, Skardu & Ghizer'
const DEFAULT_DESC =
  'gaadi.pk lets you book seats and whole vehicles to Gilgit-Baltistan — Hunza, Gilgit, Skardu and Ghizer — from across GB and from Islamabad, Rawalpindi and Lahore. Pick your seat and pay online. Apni seat, apni gaadi.'

// Keep these in sync with each page's <Seo> props.
const ROUTES = [
  { path: '/', title: null, description: DEFAULT_DESC, index: true },
  {
    path: '/vehicles',
    title: 'Vehicles to Gilgit-Baltistan — Hunza, Gilgit, Skardu, Ghizer',
    description:
      'Search seats and whole vehicles to Gilgit-Baltistan by route and date — Hunza, Gilgit, Skardu and Ghizer — from across GB and from Islamabad, Rawalpindi and Lahore.',
    index: true,
  },
  {
    path: '/signup',
    title: 'Sign Up — Book Seats or Post Your Vehicle',
    description:
      'Create your gaadi.pk account to book seats to Gilgit-Baltistan, or post your vehicle on routes to Hunza, Gilgit, Skardu and Ghizer.',
    index: true,
  },
  {
    path: '/about',
    title: 'About Us & Our Founder, Sheraz Ali',
    description:
      'gaadi.pk was built by Sheraz Ali, a senior full-stack & blockchain developer and a native of Hunza, to make finding a seat or vehicle to and from Gilgit-Baltistan simple and reliable.',
    index: true,
  },
  {
    path: '/contact',
    title: 'Contact Us',
    description:
      'Get in touch with the gaadi.pk team — email contact@gaadi.pk, call or message us on WhatsApp for bookings, support or feedback.',
    index: true,
  },
  {
    path: '/terms',
    title: 'Terms of Service',
    description:
      'The terms that govern using gaadi.pk to book seats and vehicles to and from Gilgit-Baltistan, and to list vehicles as a driver.',
    index: true,
  },
  { path: '/login', title: 'Login', description: DEFAULT_DESC, index: false },
]

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function buildSeoBlock(r) {
  const fullTitle = r.title ? `${r.title} · gaadi.pk` : DEFAULT_TITLE
  const ogTitle = r.title || DEFAULT_TITLE
  const url = `${SITE_URL}${r.path}`
  const robots = r.index ? 'index, follow' : 'noindex, nofollow'
  return [
    `<title>${esc(fullTitle)}</title>`,
    `<meta name="description" content="${esc(r.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${esc(ogTitle)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta name="twitter:title" content="${esc(ogTitle)}" />`,
    `<meta name="twitter:description" content="${esc(r.description)}" />`,
  ].join('\n    ')
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')
const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')

const { render } = await import('./.prerender/entry-server.js')
const SEO_RE = /<!--seo:start-->[\s\S]*?<!--seo:end-->/

let count = 0
for (const r of ROUTES) {
  let appHtml = ''
  try {
    appHtml = render(r.path)
  } catch (e) {
    console.error(`  ✗ ${r.path} render failed: ${e.message}`)
  }

  const html = template
    .replace(SEO_RE, `<!--seo:start-->\n    ${buildSeoBlock(r)}\n    <!--seo:end-->`)
    .replace('<!--app-html-->', appHtml)

  const outPath =
    r.path === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, r.path, 'index.html')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, html)
  console.log(`  ✓ prerendered ${outPath.replace(distDir, 'dist')}`)
  count++
}
console.log(`Prerendered ${count} route(s).`)

// Remove the temporary SSR bundle.
fs.rmSync(path.join(__dirname, '.prerender'), { recursive: true, force: true })
