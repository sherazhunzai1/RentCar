import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore the session on first load.
  useEffect(() => {
    setUser(authService.getCurrentUser())
    setLoading(false)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isDriver: user?.role === 'driver',
      isPassenger: user?.role === 'passenger',

      async signup(data) {
        const u = await authService.signup(data)
        setUser(u)
        return u
      },
      async login(data) {
        const u = await authService.login(data)
        setUser(u)
        return u
      },
      async logout() {
        await authService.logout()
        setUser(null)
      },
      async updateProfile(updates) {
        const u = await authService.updateProfile(user.id, updates)
        setUser(u)
        return u
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
