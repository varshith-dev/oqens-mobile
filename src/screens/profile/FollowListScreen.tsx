import React, { useEffect, useState } from 'react'
import {
  FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '../../components/ui/Avatar'
import { FollowButton } from '../../components/ui/FollowButton'
import { Skeleton } from '../../components/shared/Skeleton'
import { EmptyState } from '../../components/shared/EmptyState'
import { usersApi } from '../../api/users'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'

export default function FollowListScreen() {
  const { username, type } = useLocalSearchParams<{ username: string; type: 'followers' | 'following' }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [users, setUsers] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [username, type])
  useEffect(() => {
    if (!search.trim()) { setFiltered(users); return }
    const q = search.toLowerCase()
    setFiltered(users.filter(u => u.username.includes(q) || u.display_name.toLowerCase().includes(q)))
  }, [search, users])

  const load = async () => {
    setLoading(true)
    try {
      const res = type === 'followers'
        ? await usersApi.getFollowers(username)
        : await usersApi.getFollowing(username)
      const data = res.data.users ?? res.data ?? []
      setUsers(data)
      setFiltered(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{type === 'followers' ? 'Followers' : 'Following'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search…"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Search users"
          />
        </View>
      </View>

      {loading ? (
        <View style={{ gap: 1 }}>
          {[...Array(5)].map((_, i) => (
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
          data={filtered}
          keyExtractor={u => u.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push(`/users/${item.username}`)}
              accessibilityLabel={`View ${item.display_name}'s profile`}
            >
              <Avatar uri={item.avatar_url} name={item.display_name} size="md" />
              <View style={styles.info}>
                <Text style={styles.name}>{item.display_name}</Text>
                <Text style={styles.handle}>@{item.username}</Text>
              </View>
              <FollowButton userId={item.id} isFollowing={item.is_following ?? false} size="sm" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptyState icon="users" title={`No ${type} yet`} />}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  searchRow: { padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, height: 40,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textPrimary },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  info: { flex: 1 },
  name: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.textPrimary },
  handle: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
})
