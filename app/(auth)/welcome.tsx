import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { colors, radius, spacing } from '../../lib/theme'

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Simple centered content */}
      <View style={styles.content}>
        <Text style={styles.logo}>OQENS</Text>
        <Text style={styles.tagline}>Connect with developers</Text>
      </View>

      {/* Bottom actions */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnPrimaryText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnSecondaryText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, paddingHorizontal: spacing.xl },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 48, fontWeight: '900', color: colors.black, letterSpacing: -1 },
  tagline: { fontSize: 16, color: colors.gray500, marginTop: spacing.sm },
  bottom: { paddingBottom: 48, gap: spacing.md },
  btnPrimary: {
    backgroundColor: colors.black,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  btnSecondary: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSecondaryText: { color: colors.black, fontSize: 16, fontWeight: '600' },
})
