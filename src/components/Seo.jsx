import { useEffect } from 'react'

// Per-route document head manager (no external dependency).
//
// NOTE: search engines like Google execute JavaScript, so these runtime updates
// improve indexing of individual routes. Social crawlers (WhatsApp, Facebook,
// Twitter) do NOT run JS — they read the static tags in index.html. For true
// per-page social cards you'd need SSR / prerendering (see README).

export const SITE = {
  name: 'gaadi.pk',
  url: 'https://gaadi.pk',
  defaultTitle: 'gaadi.pk — Book Your Seat, Travel All of Pakistan',
  defaultDescription:
    'Book seats in cars, SUVs, vans and buses for intercity travel across Pakistan. Compare routes, pick your exact seat and pay online. Apni seat, apni gaadi.',
  image: 'https://gaadi.pk/og-image.png',
}

function upsertMeta(attr, key, content) {
  if (content == null) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id)
  if (data) {
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.id = id
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(data)
  } else if (el) {
    el.remove()
  }
}

export default function Seo({
  title,
  description,
  path = '',
  image,
  type = 'website',
  noindex = false,
  jsonLd = null,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE.name}` : SITE.defaultTitle
    const desc = description || SITE.defaultDescription
    const url = `${SITE.url}${path}`
    const img = image || SITE.image

    document.title = fullTitle
    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    upsertCanonical(url)

    upsertMeta('property', 'og:title', title || SITE.defaultTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', img)
    upsertMeta('property', 'og:type', type)

    upsertMeta('name', 'twitter:title', title || SITE.defaultTitle)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', img)

    upsertJsonLd('route-jsonld', jsonLd)
  }, [title, description, path, image, type, noindex, jsonLd])

  return null
}
