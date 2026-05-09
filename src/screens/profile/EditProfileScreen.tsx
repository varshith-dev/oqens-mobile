import React, { useEffect, useState } from 'react'
import {
  ActionSheetIOS, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { useAuthStore } from '../../store/useAuthStore'
import { usersApi } from '../../api/users'
import { useToast } from '../../hooks/useToast'
import { useDebounce } from '../../hooks/useDebounce'
import { isValidUsername, isValidUrl } from '../../utils/validators'
import { colors, fonts, fontSize, spacing } from '../../theme'

export default function EditProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const { user, updateUser, refreshUser } = useAuthStore()
  const [form, setForm] = useState({
    display_name: user?.display_name ?? '',
    username: user?.username ?? '',
    bio: user?.bio ?? '',
    website: user?.website ?? '',
  })
  const [avatarUri, setAvatarUri] = useState<string | null>(null)
  const [coverUri, setCoverUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const debouncedUsername = useDebounce(form.username, 500)

  useEffect(() => {
    if (debouncedUsername && debouncedUsername !== user?.username) {
      checkUsername(debouncedUsername)
    } else {
      setUsernameAvailable(null)
    }
  }, [debouncedUsername])

  const checkUsername = async (u: string) => {
    if (!isValidUsername(u)) return
    try {
      const res = await usersApi.checkUsername(u)
      setUsernameAvailable(res.data.available)
    } catch { setUsernameAvailable(null) }
  }

  const pickImage = async (type: 'avatar' | 'cover') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    })
    if (!result.canceled) {
      if (type === 'avatar') setAvatarUri(result.assets[0].uri)
      else setCoverUri(result.assets[0].uri)
    }
  }

  const hasChanges = () =>
    form.display_name !== user?.display_name ||
    form.username !== user?.username ||
    form.bio !== (user?.bio ?? '') ||
    form.website !== (user?.website ?? '') ||
    !!avatarUri || !!coverUri

  const handleSave = async () => {
    if (!form.display_name.trim()) return toast.show('Display name required', 'error')
    if (!isValidUsername(form.username)) return toast.show('Invalid username', 'error')
    if (form.website && !isValidUrl(form.website)) return toast.show('Invalid website URL', 'error')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('display_name', form.display_name.trim())
      fd.append('username', form.username.toLowerCase())
      fd.append('bio', form.bio)
      fd.append('website', form.website)
      if (avatarUri) fd.append('avatar', { uri: avatarUri, name: 'avatar.jpg', type: 'image/jpeg' } as any)
      if (coverUri) fd.append('cover', { uri: coverUri, name: 'cover.jpg', type: 'image/jpeg' } as any)
      await usersApi.updateProfile(fd)
      await refreshUser()
      toast.show('Profile updated', 'success')
      router.back()
    } catch (err: any) {
      toast.show(err?.response?.data?.message ?? 'Update failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} accessibilityLabel="Cancel">
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <Button
            label="Save"
            onPress={handleSave}
            loading={loading}
            disabled={!hasChanges()}
            size="sm"
            style={styles.headerBtn}
          />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Cover */}
          <TouchableOpacity onPress={() => pickImage('cover')} style={styles.cover} accessibilityLabel="Change cover photo">
            {coverUri || user?.cover_url
              ? <Image source={{ uri: coverUri ?? user?.cover_url }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="Cover" />
              : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }]}>
                  <Feather name="camera" size={24} color={colors.textMuted} />
                </View>
            }
          </TouchableOpacity>

          {/* Avatar */}
          <TouchableOpacity onPress={() => pickImage('avatar')} style={styles.avatarBtn} accessibilityLabel="Change avatar">
            <Avatar uri={avatarUri ?? user?.avatar_url} name={user?.display_name} size="xl" />
            <View style={styles.avatarOverlay}>
              <Feather name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.fields}>
            <Input label="Display Name" value={form.display_name} onChangeText={set('display_name')} placeholder="Your name" />
            <View>
              <Input
                label="Username"
                value={form.username}
                onChangeText={v => set('username')(v.toLowerCase())}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="yourhandle"
                rightIcon={usernameAvailable === true ? 'check' : usernameAvailable === false ? 'x' : undefined}
              />
              {usernameAvailable === false && (
                <Text style={styles.usernameError}>Username taken</Text>
              )}
            </View>
            <Input label="Bio" value={form.bio} onChangeText={set('bio')} multiline placeholder="Tell people about yourself" />
            <Text style={styles.charCount}>{form.bio.length}/160</Text>
            <Input label="Website" value={form.website} onChangeText={set('website')} keyboardType="url" autoCapitalize="none" placeholder="https://yoursite.com" />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerBtn: { minWidth: 60 },
  cancelText: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.textSecondary },
  title: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.textPrimary },
  content: { paddingBottom: spacing['3xl'] },
  cover: { height: 120, backgroundColor: colors.surface },
  avatarBtn: { marginLeft: spacing.base, marginTop: -36, width: 72, position: 'relative' },
  avatarOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  fields: { padding: spacing.base },
  usernameError: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.error, marginTop: -spacing.sm },
  charCount: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'right', marginTop: -spacing.sm, marginBottom: spacing.sm },
})
