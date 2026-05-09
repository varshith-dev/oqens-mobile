import React, { useState } from 'react'
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { useToast } from '../../hooks/useToast'
import { isValidEmail, isValidPassword, isValidUsername } from '../../utils/validators'
import { colors, fonts, fontSize, spacing } from '../../theme'

export default function RegisterScreen() {
  const router = useRouter()
  const toast = useToast()
  const { register, isLoading } = useAuthStore()
  const [form, setForm] = useState({ display_name: '', username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.display_name.trim()) e.display_name = 'Display name is required'
    if (!isValidUsername(form.username)) e.username = 'Lowercase, 3–20 chars, no spaces'
    if (!isValidEmail(form.email)) e.email = 'Valid email required'
    const pw = isValidPassword(form.password)
    if (!pw.valid) e.password = pw.message!
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleRegister = async () => {
    if (!validate()) return
    try {
      await register({
        display_name: form.display_name.trim(),
        username: form.username.toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      router.replace({ pathname: '/(auth)/verify-email', params: { email: form.email } })
    } catch (err: any) {
      toast.show(err?.response?.data?.message ?? 'Registration failed', 'error')
    }
  }

  const allFilled = Object.values(form).every(v => v.trim())

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create account</Text>

        <Input label="Display Name" value={form.display_name} onChangeText={set('display_name')}
          error={errors.display_name} placeholder="Your name" leftIcon="user" />
        <Input label="Username" value={form.username} onChangeText={v => set('username')(v.toLowerCase())}
          error={errors.username} placeholder="yourhandle" leftIcon="at-sign"
          autoCapitalize="none" autoCorrect={false} />
        <Input label="Email" value={form.email} onChangeText={set('email')}
          error={errors.email} placeholder="you@example.com" leftIcon="mail"
          keyboardType="email-address" autoCapitalize="none" />
        <Input label="Password" value={form.password} onChangeText={set('password')}
          error={errors.password} secureEntry leftIcon="lock" placeholder="Min 8 chars, 1 uppercase, 1 number" />
        <Input label="Confirm Password" value={form.confirm} onChangeText={set('confirm')}
          error={errors.confirm} secureEntry leftIcon="lock" placeholder="Repeat password" />

        <Button
          label="Create Account"
          onPress={handleRegister}
          loading={isLoading}
          disabled={!allFilled}
          fullWidth size="lg"
          style={{ marginTop: spacing.sm }}
        />

        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          style={styles.loginLink}
          accessibilityLabel="Go to login"
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={{ color: colors.accent }}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, backgroundColor: colors.bg,
    paddingHorizontal: spacing.base, paddingTop: spacing['3xl'], paddingBottom: spacing['2xl'],
  },
  heading: {
    fontFamily: fonts.heading, fontSize: fontSize.xl,
    color: colors.textPrimary, marginBottom: spacing.xl,
  },
  loginLink: { alignItems: 'center', marginTop: spacing.xl },
  loginText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textSecondary },
})
