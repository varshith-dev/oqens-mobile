import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { login } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { colors, radius, spacing } from '../../lib/theme'

export default function LoginScreen() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await login(email.trim().toLowerCase(), password)
      if (res?.session?.accessToken) {
        await signIn(res.session)
      } else {
        Alert.alert('Sign in failed', res?.message || res?.error?.message || 'Please check your credentials')
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error?.message || e?.message || 'Sign in failed'
      Alert.alert('Sign in failed', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.sub}>Welcome back to OQENS</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.gray300}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.gray300}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.btnText}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.switchWrap}>
          <Text style={styles.switchText}>
            No account? <Text style={styles.switchLink}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.cream, padding: spacing.xl, paddingTop: 60 },
  back: { marginBottom: spacing.xl },
  backText: { color: colors.gray700, fontSize: 14, fontWeight: '600' },
  title: { fontSize: 32, fontWeight: '800', color: colors.black, marginBottom: spacing.xs, letterSpacing: -0.5 },
  sub: { fontSize: 15, color: colors.gray500, marginBottom: spacing.xl * 1.5 },
  form: { gap: spacing.md },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: colors.gray700, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 15,
    fontSize: 15,
    color: colors.black,
    backgroundColor: colors.white,
  },
  btnPrimary: {
    backgroundColor: colors.black,
    borderRadius: radius.full,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  switchWrap: { marginTop: spacing.xl, alignItems: 'center' },
  switchText: { fontSize: 14, color: colors.gray500 },
  switchLink: { color: colors.black, fontWeight: '700' },
})
