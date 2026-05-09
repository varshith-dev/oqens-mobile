import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/useAuthStore'
import { colors, fonts, fontSize } from '../../theme'

export default function SplashScreen() {
  const router = useRouter()
  const { initialize, token, isInitialized } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    if (!isInitialized) return
    const t = setTimeout(() => {
      if (token) {
        router.replace('/(tabs)')
      } else {
        router.replace('/(auth)/welcome')
      }
    }, 1800)
    return () => clearTimeout(t)
  }, [isInitialized, token])

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>OQENS</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  logo: {
    fontFamily: fonts.heading, fontSize: fontSize['2xl'],
    color: colors.accent, letterSpacing: 2,
  },
})
