import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, radius, spacing } from '../../lib/theme'
import { StatusBar } from 'expo-status-bar'

const { height } = Dimensions.get('window')

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Background blob */}
      <View style={styles.blob} />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>Q</Text>
          </View>
          <Text style={styles.logoText}>OQENS</Text>
        </View>

        {/* Tagline */}
        <View style={styles.taglineWrap}>
          <Text style={styles.tagline}>Connect. Share.</Text>
          <Text style={[styles.tagline, { color: colors.primary }]}>Build Together.</Text>
          <Text style={styles.sub}>The social community{'\n'}for developers.</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  blob: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xl * 2 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoLetter: { fontSize: 40, fontWeight: '700', color: colors.white },
  logoText: { fontSize: 22, fontWeight: '800', color: colors.black, letterSpacing: 3 },
  taglineWrap: { alignItems: 'center' },
  tagline: { fontSize: 28, fontWeight: '800', color: colors.black, textAlign: 'center', lineHeight: 36 },
  sub: { fontSize: 15, color: colors.gray500, textAlign: 'center', marginTop: spacing.md, lineHeight: 22 },
  actions: { paddingHorizontal: spacing.xl, paddingBottom: 48, gap: spacing.md },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  loginText: { textAlign: 'center', color: colors.gray700, fontSize: 15, fontWeight: '600', paddingVertical: 8 },
})
