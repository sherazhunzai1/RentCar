import { api, asList } from './client'

export type Location = { id: string; name: string; province?: string; isActive?: boolean }

export async function getLocations() {
  return asList<Location>(await api('/locations', { auth: false }), 'locations')
}
