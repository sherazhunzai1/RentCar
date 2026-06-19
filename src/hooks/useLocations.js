import { useEffect, useState } from 'react'
import { getLocations } from '../services/locationService'
import { CITIES as FALLBACK_CITIES } from '../data/cities'

// Session-level cache so we fetch the location list once and share it across the
// search bar, post-vehicle form, etc. `inflight` dedupes concurrent mounts.
let cache = null
let inflight = null

function load() {
  if (cache) return Promise.resolve(cache)
  if (!inflight) {
    inflight = getLocations()
      .then((list) => {
        cache = list
        inflight = null
        return list
      })
      .catch((err) => {
        inflight = null
        throw err
      })
  }
  return inflight
}

// Provides the selectable city list from GET /api/locations. Exposes both the
// full location objects and a plain `cities` name array for the dropdowns, and
// falls back to the static list if the request fails so the UI is never empty.
export function useLocations() {
  const [locations, setLocations] = useState(cache || [])
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return
    let active = true
    load()
      .then((list) => {
        if (active) {
          setLocations(list)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) setLoading(false) // keep the fallback list
      })
    return () => {
      active = false
    }
  }, [])

  const cities = locations.length > 0 ? locations.map((l) => l.name) : FALLBACK_CITIES

  return { locations, cities, loading }
}
