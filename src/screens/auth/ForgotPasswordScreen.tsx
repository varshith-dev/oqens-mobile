import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { authApi } from '../../api/auth'
import { useToast } from '../../hooks/useToast'
import { colors, fonts, fontSize, spacing } from '../../theme'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim().toLowerCase())
      toast.show('Check your email for a reset link', 'success')
      router.back()
    } catch {
      toast.show('Failed to send reset link', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.heading}>Reset password</Text>
      <Text style={styles.sub}>Enter your email and we'll send you a reset link.</Text>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon="mail"
        placeholder="you@example.com"
      />
      <Button
        label="Send Reset Link"
        onPress={handleSend}
        loading={loading}
        disabled={!email.trim()}
        fullWidth size="lg"
        style={{ marginTop: spacing.sm }}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg,
    paddingHorizontal: spacing.base, paddingTop: spacing['3xl'],
  },
  heading: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary, marginBottom: spacing.sm },
  sub: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.xl },
})
