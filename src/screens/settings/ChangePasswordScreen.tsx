import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { authApi } from '../../api/auth'
import { useToast } from '../../hooks/useToast'
import { isValidPassword } from '../../utils/validators'
import { colors, fonts, fontSize, spacing } from '../../theme'

export default function ChangePasswordScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.current) e.current = 'Required'
    const pw = isValidPassword(form.newPw)
    if (!pw.valid) e.newPw = pw.message!
    if (form.newPw !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await authApi.changePassword(form.current, form.newPw)
      toast.show('Password updated', 'success')
      router.back()
    } catch (err: any) {
      toast.show(err?.response?.data?.message ?? 'Failed to update password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Change Password</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input label="Current Password" value={form.current} onChangeText={set('current')} secureEntry error={errors.current} />
          <Input label="New Password" value={form.newPw} onChangeText={set('newPw')} secureEntry error={errors.newPw} placeholder="Min 8 chars, 1 uppercase, 1 number" />
          <Input label="Confirm New Password" value={form.confirm} onChangeText={set('confirm')} secureEntry error={errors.confirm} />
          <Button label="Update Password" onPress={handleSubmit} loading={loading} disabled={!form.current || !form.newPw || !form.confirm} fullWidth size="lg" style={{ marginTop: spacing.sm }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.sm, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.textPrimary },
  content: { padding: spacing.base, paddingBottom: spacing['3xl'] },
})
