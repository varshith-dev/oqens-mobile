import React, { useState } from 'react'
import {
  ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { Avatar } from '../../components/ui/Avatar'
import { BottomSheet } from '../../components/shared/BottomSheet'
import { useAuthStore } from '../../store/useAuthStore'
import { useToast } from '../../hooks/useToast'
import { colors, fonts, fontSize, spacing } from '../../theme'

function Row({
  label, onPress, value, isToggle, onToggle, destructive, chevron = true,
}: {
  label: string
  onPress?: () => void
  value?: boolean
  isToggle?: boolean
  onToggle?: (v: boolean) => void
  destructive?: boolean
  chevron?: boolean
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={isToggle}
      accessibilityLabel={label}
      accessibilityRole={isToggle ? 'switch' : 'button'}
    >
      <Text style={[styles.rowLabel, destructive && { color: colors.error }]}>{label}</Text>
      {isToggle
        ? <Switch value={value} onValueChange={onToggle} trackColor={{ true: colors.accent }} />
        : chevron && <Feather name="chevron-right" size={18} color={colors.textMuted} />
      }
    </TouchableOpacity>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

export default function SettingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const { user, logout } = useAuthStore()
  const [logoutSheet, setLogoutSheet] = useState(false)
  const [deleteSheet, setDeleteSheet] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [notifPreview, setNotifPreview] = useState(true)
  const [privateAccount, setPrivateAccount] = useState(false)
  const [showOnline, setShowOnline] = useState(true)

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    await logout()
    router.replace('/(auth)/welcome')
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User row */}
        <TouchableOpacity
          style={styles.userRow}
          onPress={() => router.push('/profile/edit')}
          accessibilityLabel="Edit profile"
        >
          <Avatar uri={user?.avatar_url} name={user?.display_name} size="md" />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.display_name}</Text>
            <Text style={styles.userHandle}>@{user?.username}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <Section title="ACCOUNT">
          <Row label="Edit Profile" onPress={() => router.push('/profile/edit')} />
          <Row label="Change Password" onPress={() => router.push('/settings/change-password')} />
          <Row label="Email Settings" onPress={() => router.push('/settings/email-settings')} />
          <Row label="Get Verified" onPress={() => router.push('/settings/get-verified')} />
          <Row label="Blocked Users" onPress={() => router.push('/settings/blocked-users')} />
        </Section>

        <Section title="NOTIFICATIONS">
          <Row label="Push Notifications" isToggle value={pushEnabled} onToggle={setPushEnabled} />
          <Row label="Email Notifications" isToggle value={emailNotifs} onToggle={setEmailNotifs} />
          <Row label="Notification Preview" isToggle value={notifPreview} onToggle={setNotifPreview} />
        </Section>

        <Section title="PRIVACY">
          <Row label="Private Account" isToggle value={privateAccount} onToggle={setPrivateAccount} />
          <Row label="Show Online Status" isToggle value={showOnline} onToggle={setShowOnline} />
        </Section>

        <Section title="APPEARANCE">
          <Row label="Language" onPress={() => toast.show('Coming soon', 'info')} />
        </Section>

        <Section title="SUPPORT">
          <Row label="Help Center" onPress={() => router.push({ pathname: '/settings/web', params: { url: 'https://help.oqens.app', title: 'Help Center' } })} />
          <Row label="Terms of Service" onPress={() => router.push({ pathname: '/settings/web', params: { url: 'https://oqens.app/terms', title: 'Terms of Service' } })} />
          <Row label="Privacy Policy" onPress={() => router.push({ pathname: '/settings/web', params: { url: 'https://oqens.app/privacy', title: 'Privacy Policy' } })} />
          <Row label="About OQENS" onPress={() => toast.show('OQENS v1.0.0', 'info')} />
        </Section>

        <Section title="ACCOUNT ACTIONS">
          <Row label="Log Out" onPress={() => setLogoutSheet(true)} chevron={false} />
          <Row label="Delete Account" onPress={() => setDeleteSheet(true)} destructive chevron={false} />
        </Section>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      <BottomSheet
        visible={logoutSheet}
        onClose={() => setLogoutSheet(false)}
        title="Log out of OQENS?"
        actions={[
          { label: 'Log Out', onPress: handleLogout, destructive: true },
          { label: 'Cancel', onPress: () => setLogoutSheet(false) },
        ]}
      />

      <BottomSheet
        visible={deleteSheet}
        onClose={() => setDeleteSheet(false)}
        title="Delete your account? This cannot be undone."
        actions={[
          { label: 'Delete Account', onPress: () => toast.show('Contact support to delete your account', 'info'), destructive: true },
          { label: 'Cancel', onPress: () => setDeleteSheet(false) },
        ]}
      />
    </View>
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
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  userInfo: { flex: 1 },
  userName: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.textPrimary },
  userHandle: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  section: { marginTop: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.medium, fontSize: fontSize.xs,
    color: colors.textMuted, paddingHorizontal: spacing.base,
    marginBottom: spacing.xs, letterSpacing: 0.5,
  },
  sectionBody: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    minHeight: 44, borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  rowLabel: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textPrimary },
})
