import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  useFonts,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans'
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans'
import * as SplashScreen from 'expo-splash-screen'
import * as Linking from 'expo-linking'
import { ToastProvider } from '../src/components/shared/ToastProvider'
import { usePushNotifications } from '../src/hooks/usePushNotifications'

SplashScreen.preventAutoHideAsync()

function AppContent() {
  usePushNotifications()

  useEffect(() => {
    const sub = Linking.addEventListener('url', () => {
      // NavigationContainer handles deep links automatically via linking config
    })
    return () => sub.remove()
  }, [])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="posts/[postId]" />
      <Stack.Screen name="users/[username]" />
      <Stack.Screen name="users/[username]/followers" />
      <Stack.Screen name="users/[username]/following" />
      <Stack.Screen name="tags/[tag]" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="messages/[threadId]" />
      <Stack.Screen name="settings/change-password" />
      <Stack.Screen name="settings/get-verified" />
      <Stack.Screen name="settings/blocked-users" />
      <Stack.Screen name="settings/web" />
    </Stack>
  )
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <AppContent />
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
