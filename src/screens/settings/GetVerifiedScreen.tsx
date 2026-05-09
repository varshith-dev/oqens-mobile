import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { BottomSheet } from '../../components/shared/BottomSheet'
import { usersApi } from '../../api/users'
import { useToast } from '../../hooks/useToast'
import { colors, fonts, fontSize, spacing } from '../../theme'

const REASONS = ['Developer', 'Creator', 'Company', 'Public Figure', 'Other']

export default function GetVerifiedScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const [reason, setReason] = useState('Developer')
  const [legalName, setLegalName] = useState('')
  const [proofLink, setProofLink] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reasonSheet, setReasonSheet] = useState(false)

  const handleSubmit = async () => {
    if (!legalName.trim() || !proofLink.trim()) return toast.show('Fill all required fields', 'error')
    setLoading(true)
    try {
      await usersApi.submitVerificationRequest({ reason, legal_name: legalName, proof_link: proofLink, context })
      setSubmitted(true)
      toast.show("Request submitted, we'll review within 7 days", 'success')
    } catch {
      toast.show('Submission failed', 'error')
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
          <Text style={styles.title}>Get Verified</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.desc}>Apply for a verified badge on your profile.</Text>

          <Text style={styles.label}>Reason</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setReasonSheet(true)} accessibilityLabel="Select reason">
            <Text style={styles.pickerText}>{reason}</Text>
            <Feather name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <Input label="Full Legal Name *" value={legalName} onChangeText={setLegalName} placeholder="As on your ID" />
          <Input label="Proof Link *" value={proofLink} onChangeText={setProofLink} keyboardType="url" autoCapitalize="none" placeholder="GitHub, LinkedIn, company website…" />
          <Input label="Additional Context (optional)" value={context} onChangeText={setContext} multiline placeholder="Tell us more about yourself…" />

          <Button
            label="Submit Request"
            onPress={handleSubmit}
            loading={loading}
            disabled={submitted || !legalName.trim() || !proofLink.trim()}
            fullWidth size="lg"
            style={{ marginTop: spacing.sm }}
          />
          {submitted && <Text style={styles.submitted}>Request submitted ✓</Text>}
        </ScrollView>
      </View>
      <BottomSheet
        visible={reasonSheet}
        onClose={() => setReasonSheet(false)}
        title="Select Reason"
        actions={REASONS.map(r => ({ label: r, onPress: () => setReason(r) }))}
      />
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
  desc: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.xl },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  picker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  pickerText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textPrimary },
  submitted: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.success, textAlign: 'center', marginTop: spacing.md },
})
