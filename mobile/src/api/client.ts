import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../config'

const TOKEN_KEY = 'gaadi_token'

export const tokenStore = {
  get: async () => AsyncStorage.getItem(TOKEN_KEY),
  set: async (token: string | null | undefined) => {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token)
  },
  clear: async () => AsyncStorage.removeItem(TOKEN_KEY),
}

function safeParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function api(
  path: string,
  { method = 'GET', body, auth = true }: { method?: string; body?: unknown; auth?: boolean } = {},
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = await tokenStore.get()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out. Check your internet connection.')
    }
    throw new Error('Unable to reach the server. Check your internet connection.')
  } finally {
    clearTimeout(timeout)
  }

  const text = await res.text()
  const data = text ? safeParse(text) : null

  if (!res.ok) {
    if (res.status === 401) await tokenStore.clear()
    const message = (data && (data.message || data.error)) || `Request failed (${res.status})`
    throw new Error(message)
  }
  return data
}

export const withId = <T extends Record<string, unknown>>(obj: T | null | undefined) => {
  if (obj && typeof obj === 'object' && (obj as { _id?: string })._id && !(obj as { id?: string }).id) {
    return { ...obj, id: String((obj as { _id: string })._id) }
  }
  return obj
}

export const asEntity = <T>(data: unknown, key?: string) => {
  const raw =
    data && key && typeof data === 'object' && (data as Record<string, unknown>)[key] != null
      ? (data as Record<string, unknown>)[key]
      : data
  return withId(raw as Record<string, unknown>) as T
}

export const asList = <T>(data: unknown, key?: string): T[] => {
  const list = Array.isArray(data)
    ? data
    : (data &&
        typeof data === 'object' &&
        ((data as Record<string, unknown>)[key || ''] ||
          (data as { data?: unknown }).data ||
          (data as { items?: unknown }).items)) ||
      []
  return (Array.isArray(list) ? list : []).map((x) => withId(x as Record<string, unknown>) as T)
}
