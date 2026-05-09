import React, { useState } from 'react'
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useToast } from '../../src/hooks/useToast'
import { usersApi } from '../../src/api/users'
import { colors, fonts, fontSize, spacing } from '../../src/theme'

export default function EmailSettingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const [likes, setLikes] = useState(true)
  const [comments, setComments] = useState(true)
  const [follows, setFollows] = useState(true)
  const [digest, setDigest] = useState(false)

  const save = async (key: string, val: boolean) => {
    try {
      await usersApi.updateSettings({ [`email_${key}`]: val })
    } catch {
      toast.show('Failed to save', 'error')
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Email Settings</Text>
        <View style={{ width: 44 }} />
      </View>
      {[
        { label: 'Likes on your posts', value: likes, key: 'likes', set: setLikes },
        { label: 'Comments on your posts', value: comments, key: 'comments', set: setComments },
        { label: 'New followers', value: follows, key: 'follows', set: setFollows },
        { label: 'Weekly digest', value: digest, key: 'digest', set: setDigest },
      ].map(item => (
        <View key={item.key} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <Switch
            value={item.value}
            onValueChange={v => { item.set(v); save(item.key, v) }}
            trackColor={{ true: colors.accent }}
            accessibilityLabel={item.label}
          />
        </View>
      ))}
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
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 44,
  },
  label: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textPrimary },
})
