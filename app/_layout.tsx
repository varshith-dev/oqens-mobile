import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { useRouter, useSegments } from 'expo-router'

SplashScreen.preventAutoHideAsync()

function RootLayoutNav() {
  const { session, loading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // Always hide splash once loading is done
    SplashScreen.hideAsync().catch(() => {})

    const inAuthGroup = segments[0] === '(auth)'

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/welcome')
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [session, loading])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="post/[id]"
        options={{ headerShown: true, title: 'Post', headerBackTitle: 'Back', headerTintColor: '#6C63FF' }}
      />
      <Stack.Screen
        name="profile/[username]"
        options={{ headerShown: true, title: '', headerBackTitle: 'Back', headerTintColor: '#6C63FF' }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootLayoutNav />
    </AuthProvider>
  )
}
