import React, { useState } from 'react'
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { useToast } from '../../hooks/useToast'
import { colors, fonts, fontSize, spacing } from '../../theme'

export default function LoginScreen() {
  const router = useRouter()
  const toast = useToast()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!email.trim()) e.email = 'Email is required'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleLogin = async () => {
    if (!validate()) return
    try {
      await login(email.trim().toLowerCase(), password)
      router.replace('/(tabs)')
    } catch (err: any) {
      toast.show(err?.response?.data?.message ?? 'Login failed', 'error')
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>OQENS</Text>
        <Text style={styles.heading}>Welcome back</Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.email}
          leftIcon="mail"
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureEntry
          error={errors.password}
          leftIcon="lock"
          placeholder="Your password"
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.forgotLink}
          accessibilityLabel="Forgot password"
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <Button
          label="Log In"
          onPress={handleLogin}
          loading={isLoading}
          disabled={!email || !password}
          fullWidth
          size="lg"
          style={{ marginTop: spacing.sm }}
        />

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          onPress={() => router.replace('/(auth)/register')}
          style={styles.registerLink}
          accessibilityLabel="Go to register"
        >
          <Text style={styles.registerText}>
            Don't have an account? <Text style={{ color: colors.accent }}>Sign up</Text>
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
  logo: {
    fontFamily: fonts.heading, fontSize: fontSize.xl,
    color: colors.accent, textAlign: 'center', marginBottom: spacing.xl,
  },
  heading: {
    fontFamily: fonts.heading, fontSize: fontSize.xl,
    color: colors.textPrimary, marginBottom: spacing.xl,
  },
  forgotLink: { alignSelf: 'flex-end', marginTop: -spacing.sm, marginBottom: spacing.sm },
  forgotText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.accent },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    fontFamily: fonts.body, fontSize: fontSize.sm,
    color: colors.textMuted, marginHorizontal: spacing.sm,
  },
  registerLink: { alignItems: 'center' },
  registerText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textSecondary },
})
