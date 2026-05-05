import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { colors, radius, spacing } from '../../lib/theme'

const { height } = Dimensions.get('window')

function OqensLogo() {
  return (
    <View style={logo.wrap}>
      {/* Outer ring */}
      <View style={logo.ring}>
        {/* Inner filled circle */}
        <View style={logo.inner}>
          {/* Q letter mark */}
          <Text style={logo.letter}>Q</Text>
        </View>
      </View>
      {/* Dot accent */}
      <View style={logo.dot} />
    </View>
  )
}

const logo = StyleSheet.create({
  wrap: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ring: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2.5, borderColor: colors.black,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.cream,
  },
  inner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.black,
    alignItems: 'center', justifyContent: 'center',
  },
  letter: { fontSize: 26, fontWeight: '900', color: colors.cream, letterSpacing: -1 },
  dot: {
    position: 'absolute', bottom: 4, right: 4,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.accent,
    borderWidth: 2, borderColor: colors.cream,
  },
})

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Top section */}
      <View style={styles.top}>
        <OqensLogo />
        <Text style={styles.brand}>OQENS</Text>
        <Text style={styles.tagline}>The developer{'\n'}community.</Text>
      </View>

      {/* Middle — decorative lines */}
      <View style={styles.lines}>
        {[0,1,2,3,4].map(i => (
          <View key={i} style={[styles.line, { opacity: 1 - i * 0.18, width: `${100 - i * 12}%` }]} />
        ))}
      </View>

      {/* Bottom actions */}
      <View style={styles.bottom}>
        <Text style={styles.sub}>Connect. Share. Build together.</Text>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Create account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnSecondaryText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: spacing.xl },
  top: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingTop: 60 },
  brand: { fontSize: 13, fontWeight: '700', color: colors.gray500, letterSpacing: 4, marginTop: spacing.lg, marginBottom: spacing.md },
  tagline: { fontSize: 42, fontWeight: '800', color: colors.black, lineHeight: 50, letterSpacing: -1 },
  lines: { alignItems: 'center', gap: 10, marginVertical: spacing.xl },
  line: { height: 1.5, backgroundColor: colors.creamDark, alignSelf: 'flex-start' },
  bottom: { paddingBottom: 52, gap: spacing.md },
  sub: { fontSize: 14, color: colors.gray500, marginBottom: spacing.sm },
  btnPrimary: {
    backgroundColor: colors.black,
    borderRadius: radius.full,
    paddingVertical: 17,
    alignItems: 'center',
  },
  btnPrimaryText: { color: colors.white, fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderRadius: radius.full,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  btnSecondaryText: { color: colors.black, fontSize: 15, fontWeight: '600' },
})
