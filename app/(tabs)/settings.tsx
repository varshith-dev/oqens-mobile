import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, Linking, Image, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuth } from '../../context/AuthContext'
import { colors, spacing, radius } from '../../lib/theme'
import Constants from 'expo-constants'

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0'

function Row({
  icon, label, sublabel, onPress, right, danger,
}: {
  icon: string; label: string; sublabel?: string
  onPress?: () => void; right?: React.ReactNode; danger?: boolean
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress && !right}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon as any} size={17} color={danger ? colors.danger : colors.gray700} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, danger && { color: colors.danger }]}>{label}</Text>
        {sublabel ? <Text style={styles.rowSub}>{sublabel}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={15} color={colors.gray300} /> : null)}
    </TouchableOpacity>
  )
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => { setSigningOut(true); await signOut() },
      },
    ])
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This permanently deletes your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Linking.openURL('https://oqens.me/settings') },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Profile card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push('/(tabs)/profile' as any)}
          activeOpacity={0.7}
        >
          {user?.profile_picture_url ? (
            <Image source={{ uri: user.profile_picture_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarLetter}>
                {(user?.display_name || user?.username || '?')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.display_name || user?.username}</Text>
            <Text style={styles.profileUsername}>@{user?.username}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.gray300} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <SectionHeader title="Account" />
        <View style={styles.section}>
          <Row icon="person-outline" label="Edit Profile" sublabel="Name, bio, photo" onPress={() => Linking.openURL('https://oqens.me/profile')} />
          <Row icon="lock-closed-outline" label="Change Password" onPress={() => Linking.openURL('https://oqens.me/settings')} />
          <Row icon="mail-outline" label="Email Settings" onPress={() => Linking.openURL('https://oqens.me/settings')} />
          <Row icon="shield-checkmark-outline" label="Get Verified" sublabel="Apply for a verified badge" onPress={() => Linking.openURL('https://oqens.me/get-verified')} />
        </View>

        <View style={styles.divider} />

        <SectionHeader title="Notifications" />
        <View style={styles.section}>
          <Row
            icon="notifications-outline"
            label="Push Notifications"
            right={
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
          />
        </View>

        <View style={styles.divider} />

        <SectionHeader title="Support" />
        <View style={styles.section}>
          <Row icon="help-circle-outline" label="Help Center" onPress={() => Linking.openURL('https://oqens.me/help')} />
          <Row icon="document-text-outline" label="Terms of Service" onPress={() => Linking.openURL('https://oqens.me/help/terms')} />
          <Row icon="shield-outline" label="Privacy Policy" onPress={() => Linking.openURL('https://oqens.me/help/privacy')} />
          <Row icon="people-outline" label="Community Guidelines" onPress={() => Linking.openURL('https://oqens.me/community-guidelines')} />
          <Row icon="globe-outline" label="Open in Browser" onPress={() => Linking.openURL('https://oqens.me')} />
        </View>

        <View style={styles.divider} />

        <SectionHeader title="About" />
        <View style={styles.section}>
          <Row icon="information-circle-outline" label="Version" sublabel={`OQENS v${APP_VERSION}`} />
          <Row icon="star-outline" label="Rate the App" onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.oqens.me')} />
        </View>

        <View style={styles.divider} />

        <SectionHeader title="Account Actions" />
        <View style={styles.section}>
          <Row
            icon="log-out-outline"
            label={signingOut ? 'Signing out...' : 'Sign Out'}
            onPress={signingOut ? undefined : handleSignOut}
            danger
            right={signingOut ? <ActivityIndicator size="small" color={colors.danger} /> : undefined}
          />
          <Row icon="trash-outline" label="Delete Account" sublabel="Permanently remove your account" onPress={handleDeleteAccount} danger />
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: 12,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.black },
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, padding: spacing.md, gap: spacing.md,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 19, fontWeight: '700', color: colors.primary },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: colors.black },
  profileUsername: { fontSize: 13, color: colors.gray500, marginTop: 2 },
  sectionHeader: {
    fontSize: 11, fontWeight: '700', color: colors.gray500,
    letterSpacing: 0.7, textTransform: 'uppercase',
    paddingHorizontal: spacing.md, paddingTop: 18, paddingBottom: 6,
  },
  section: {
    backgroundColor: colors.white,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 13,
    gap: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  rowIcon: {
    width: 30, height: 30, borderRadius: 7,
    backgroundColor: '#EFEFEF', alignItems: 'center', justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: '#FEF2F2' },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, color: colors.black, fontWeight: '500' },
  rowSub: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  divider: { height: 8, backgroundColor: '#EBEBEB' },
})
