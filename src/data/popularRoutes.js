// Popular Gilgit-Baltistan routes surfaced on the homepage. Each links to the
// pre-filtered listings (/vehicles?fromCity=&toCity=) — good for UX and for
// ranking long-tail searches like "Islamabad to Hunza".
// Keep in sync with the route URLs in public/sitemap.xml.
export const POPULAR_ROUTES = [
  { from: 'Islamabad', to: 'Hunza' },
  { from: 'Islamabad', to: 'Skardu' },
  { from: 'Islamabad', to: 'Gilgit' },
  { from: 'Rawalpindi', to: 'Gilgit' },
  { from: 'Rawalpindi', to: 'Skardu' },
  { from: 'Lahore', to: 'Hunza' },
  { from: 'Gilgit', to: 'Hunza' },
  { from: 'Gilgit', to: 'Skardu' },
]

export const routeHref = ({ from, to }) =>
  `/vehicles?fromCity=${encodeURIComponent(from)}&toCity=${encodeURIComponent(to)}`
