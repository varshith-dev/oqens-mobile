import React, { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { colors, fonts, fontSize, spacing } from '../../theme'

export default function InAppWebScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [key, setKey] = useState(0)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={{ width: 44 }} />
      </View>

      {error ? (
        <View style={styles.errorState}>
          <Feather name="wifi-off" size={40} color={colors.textMuted} />
          <Text style={styles.errorText}>Failed to load page</Text>
          <TouchableOpacity onPress={() => { setError(false); setKey(k => k + 1) }} style={styles.retryBtn} accessibilityLabel="Retry">
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          key={key}
          source={{ uri: url }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false) }}
          style={{ flex: 1 }}
          accessibilityLabel={title}
        />
      )}

      {loading && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.sm, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  errorText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textSecondary },
  retryBtn: { padding: spacing.md },
  retryText: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.accent },
})
