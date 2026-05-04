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
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await login(email.trim().toLowerCase(), password)
      if (res?.session?.accessToken) {
        await signIn(res.session)
      } else {
        Alert.alert('Error', res?.error?.message || 'Login failed')
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message || 'Login failed')
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

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to your OQENS account</Text>

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
            style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
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
          <Text style={styles.switchText}>Don't have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign up</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.white, padding: spacing.xl, paddingTop: 60 },
  back: { marginBottom: spacing.xl },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: colors.black, marginBottom: spacing.xs },
  sub: { fontSize: 15, color: colors.gray500, marginBottom: spacing.xl * 1.5 },
  form: { gap: spacing.md },
  field: { gap: spacing.xs },
  label: { fontSize: 13, fontWeight: '600', color: colors.gray700 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.black,
    backgroundColor: colors.gray100,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  switchWrap: { marginTop: spacing.xl, alignItems: 'center' },
  switchText: { fontSize: 14, color: colors.gray500 },
})
