import React, { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import RootNavigator from './src/navigation/RootNavigator'

SplashScreen.preventAutoHideAsync().catch(() => {})

function AppReady({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()
  const [splashHidden, setSplashHidden] = useState(false)

  const hideSplash = useCallback(async () => {
    if (splashHidden) return
    try {
      await SplashScreen.hideAsync()
    } catch {
      // already hidden
    }
    setSplashHidden(true)
  }, [splashHidden])

  useEffect(() => {
    if (!loading) hideSplash()
  }, [loading, hideSplash])

  // Hard fallback so splash never blocks the UI forever
  useEffect(() => {
    const t = setTimeout(() => {
      hideSplash()
    }, 4000)
    return () => clearTimeout(t)
  }, [hideSplash])

  return <>{children}</>
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppReady>
          <StatusBar style="dark" />
          <RootNavigator />
        </AppReady>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
