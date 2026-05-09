import React, { useEffect } from 'react'
import {
  FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PostCard } from '../../components/post/PostCard'
import { Skeleton } from '../../components/shared/Skeleton'
import { EmptyState } from '../../components/shared/EmptyState'
import { useFeedStore } from '../../store/useFeedStore'
import { useNotifStore } from '../../store/useNotifStore'
import { colors, fonts, fontSize, spacing } from '../../theme'

const TABS = [
  { key: 'for_you', label: 'For You' },
  { key: 'following', label: 'Following' },
  { key: 'popular', label: 'Popular' },
] as const

function FeedSkeleton() {
  return (
    <View style={{ padding: spacing.base, gap: spacing.md }}>
      {[...Array(4)].map((_, i) => (
        <View key={i} style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Skeleton variant="circle" width={40} />
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Skeleton variant="line" width="60%" height={14} />
              <Skeleton variant="line" width="40%" height={12} />
            </View>
          </View>
          <Skeleton variant="line" height={14} />
          <Skeleton variant="line" height={14} width="80%" />
          <Skeleton variant="rect" height={180} />
        </View>
      ))}
    </View>
  )
}

export default function FeedScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { posts, isLoading, isRefreshing, activeTab, fetchFeed, refreshFeed, loadMore, setActiveTab } = useFeedStore()
  const unreadCount = useNotifStore(s => s.unreadCount)

  useEffect(() => { fetchFeed() }, [])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>OQENS</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/notifications')}
          style={styles.bellBtn}
          accessibilityLabel="Notifications"
        >
          <Feather name="bell" size={22} color={colors.textPrimary} />
          {unreadCount > 0 && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setActiveTab(t.key)}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            accessibilityLabel={`${t.label} feed`}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && posts.length === 0 ? (
        <FeedSkeleton />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={p => p.id}
          renderItem={({ item }) => <PostCard post={item} />}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refreshFeed} tintColor={colors.accent} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <EmptyState
              icon="wind"
              title="Your feed is empty"
              subtitle="Follow people or explore trending posts."
              action={{ label: 'Explore', onPress: () => router.push('/(tabs)/explore') }}
            />
          }
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
    paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  logo: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.accent },
  bellBtn: { padding: spacing.xs, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.error, borderWidth: 1.5, borderColor: colors.bg,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tab: {
    flex: 1, paddingVertical: spacing.sm + 2,
    alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.accent },
  tabText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textMuted },
  tabTextActive: { color: colors.accent },
})
