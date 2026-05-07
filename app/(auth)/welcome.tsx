import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { colors, radius, spacing } from '../../lib/theme'

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <Image
          source={require('../../assets/OQENS-ANDROID-ICON.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>OQENS</Text>
        <Text style={styles.tagline}>The developer social network</Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnSecondaryText}>Sign in</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing you agree to our{' '}
          <Text style={styles.termsLink}>Terms</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: spacing.sm,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.black,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 15,
    color: colors.gray500,
    textAlign: 'center',
  },
  bottom: {
    paddingBottom: 48,
    gap: spacing.md,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  btnSecondary: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  btnSecondaryText: { color: colors.black, fontSize: 16, fontWeight: '600' },
  terms: {
    fontSize: 12,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: { color: colors.primary, fontWeight: '600' },
})
