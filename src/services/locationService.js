// Locations service — talks to the gaadi.pk backend.
// Endpoint: GET /locations (public; returns active locations sorted by name)
import { api, asList } from './apiClient'

// Returns an array of { id, name, province, isActive, createdAt }.
export async function getLocations() {
  return asList(await api('/locations', { auth: false }), 'locations')
}
