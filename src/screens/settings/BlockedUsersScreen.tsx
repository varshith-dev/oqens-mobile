import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '../../components/ui/Avatar'
import { BottomSheet } from '../../components/shared/BottomSheet'
import { Skeleton } from '../../components/shared/Skeleton'
import { EmptyState } from '../../components/shared/EmptyState'
import { usersApi } from '../../api/users'
import { useToast } from '../../hooks/useToast'
import { colors, fonts, fontSize, spacing } from '../../theme'

export default function BlockedUsersScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await usersApi.getBlocked()
      setUsers(res.data.users ?? res.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = async (userId: string) => {
    try {
      await usersApi.unblockUser(userId)
      setUsers(u => u.filter(x => x.id !== userId))
      toast.show('User unblocked', 'success')
    } catch {
      toast.show('Failed to unblock', 'error')
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Blocked Users</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={{ gap: 1 }}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={[styles.row, { gap: spacing.md }]}>
              <Skeleton variant="circle" width={44} />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Skeleton variant="line" width="50%" height={14} />
                <Skeleton variant="line" width="35%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={u => u.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Avatar uri={item.avatar_url} name={item.display_name} size="md" />
              <View style={styles.info}>
                <Text style={styles.name}>{item.display_name}</Text>
                <Text style={styles.handle}>@{item.username}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelected(item)}
                style={styles.unblockBtn}
                accessibilityLabel={`Unblock ${item.display_name}`}
              >
                <Text style={styles.unblockText}>Unblock</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<EmptyState icon="shield" title="No blocked users" subtitle="You haven't blocked anyone." />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomSheet
        visible={!!selected}
        onClose={() => setSelected(null)}
        title={`Unblock ${selected?.display_name}?`}
        actions={[
          { label: 'Unblock', onPress: () => handleUnblock(selected?.id) },
          { label: 'Cancel', onPress: () => setSelected(null) },
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
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  info: { flex: 1 },
  name: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.textPrimary },
  handle: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  unblockBtn: { padding: spacing.sm },
  unblockText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.error },
})
