import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth'
import type { User } from '../api/auth'

type AuthContextValue = {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isDriver: boolean
  isPassenger: boolean
  login: ( creds: { email: string; password: string }) => Promise<User>
  signup: (payload: Record<string, unknown>) => Promise<User>
  logout: () => Promise<void>
  updateProfile: (updates: Record<string, unknown>) => Promise<User>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const u = await authApi.getCurrentUser()
    setUser(u)
  }, [])

  useEffect(() => {
    let cancelled = false
    const boot = async () => {
      try {
        await Promise.race([
          refresh(),
          new Promise((resolve) => setTimeout(resolve, 8000)),
        ])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    boot()
    return () => {
      cancelled = true
    }
  }, [refresh])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isDriver: user?.role === 'driver',
      isPassenger: user?.role === 'passenger',
      login: async (creds) => {
        const u = await authApi.login(creds)
        setUser(u)
        return u
      },
      signup: async (payload) => {
        const u = await authApi.signup(payload)
        setUser(u)
        return u
      },
      logout: async () => {
        await authApi.logout()
        setUser(null)
      },
      updateProfile: async (updates) => {
        if (!user) throw new Error('Not signed in')
        const u = await authApi.updateProfile(user.id, updates)
        setUser(u)
        return u
      },
      refresh,
    }),
    [user, loading, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
