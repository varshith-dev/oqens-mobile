import React, { useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Button } from '../../components/ui/Button'
import { authApi } from '../../api/auth'
import { useToast } from '../../hooks/useToast'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'

export default function VerifyEmailScreen() {
  const router = useRouter()
  const toast = useToast()
  const { email } = useLocalSearchParams<{ email: string }>()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputs = useRef<(TextInput | null)[]>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(c => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const handleChange = (val: string, idx: number) => {
    const next = [...code]
    next[idx] = val.slice(-1)
    setCode(next)
    if (val && idx < 5) inputs.current[idx + 1]?.focus()
    if (next.every(c => c) && val) handleVerify(next.join(''))
  }

  const handleVerify = async (fullCode?: string) => {
    const c = fullCode ?? code.join('')
    if (c.length < 6) return
    setLoading(true)
    try {
      await authApi.verifyEmail(email, c)
      router.replace('/(tabs)')
    } catch {
      toast.show('Invalid code. Try again.', 'error')
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await authApi.resendCode(email)
      toast.show('Code resent', 'success')
      setCooldown(60)
    } catch {
      toast.show('Failed to resend', 'error')
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.heading}>Verify your email</Text>
      <Text style={styles.sub}>We sent a 6-digit code to {email}</Text>

      <View style={styles.otpRow}>
        {code.map((c, i) => (
          <TextInput
            key={i}
            ref={r => { inputs.current[i] = r }}
            style={[styles.otpBox, c && styles.otpFilled]}
            value={c}
            onChangeText={v => handleChange(v, i)}
            keyboardType="number-pad"
            maxLength={1}
            accessibilityLabel={`Code digit ${i + 1}`}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !c && i > 0) {
                inputs.current[i - 1]?.focus()
              }
            }}
          />
        ))}
      </View>

      <Button
        label="Verify"
        onPress={() => handleVerify()}
        loading={loading}
        disabled={code.some(c => !c)}
        fullWidth size="lg"
        style={{ marginTop: spacing.xl }}
      />

      <TouchableOpacity
        onPress={handleResend}
        disabled={cooldown > 0}
        style={styles.resendBtn}
        accessibilityLabel="Resend verification code"
      >
        <Text style={[styles.resendText, cooldown > 0 && { color: colors.textMuted }]}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </Text>
      </TouchableOpacity>
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
  otpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  otpBox: {
    width: 48, height: 56, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    textAlign: 'center', fontSize: fontSize.lg,
    fontFamily: fonts.heading, color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  otpFilled: { borderColor: colors.accent },
  resendBtn: { alignItems: 'center', marginTop: spacing.xl },
  resendText: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.accent },
})
