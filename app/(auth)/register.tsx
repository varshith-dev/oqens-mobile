import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { register } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { colors, radius, spacing } from '../../lib/theme'

export default function RegisterScreen() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', username: '', display_name: '' })
  const [loading, setLoading] = useState(false)

  function update(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleRegister() {
    if (!form.email || !form.password || !form.username || !form.display_name) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await register({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        username: form.username.trim().toLowerCase(),
        display_name: form.display_name.trim(),
      })
      if (res?.session?.accessToken) {
        await signIn(res.session)
      } else {
        Alert.alert('Error', res?.error?.message || 'Registration failed')
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message || 'Registration failed')
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

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.sub}>Join the developer community</Text>

        <View style={styles.form}>
          {[
            { key: 'display_name', label: 'Full Name', placeholder: 'John Doe', auto: 'name' as const },
            { key: 'username', label: 'Username', placeholder: 'johndoe', auto: 'username' as const },
            { key: 'email', label: 'Email', placeholder: 'you@example.com', auto: 'email' as const, keyboard: 'email-address' as const },
            { key: 'password', label: 'Password', placeholder: '••••••••', secure: true, auto: 'password' as const },
          ].map(f => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor={colors.gray300}
                value={form[f.key as keyof typeof form]}
                onChangeText={v => update(f.key, v)}
                secureTextEntry={f.secure}
                autoCapitalize="none"
                keyboardType={f.keyboard}
                autoComplete={f.auto}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.btnText}>Create Account</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.switchWrap}>
          <Text style={styles.switchText}>Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign in</Text></Text>
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
