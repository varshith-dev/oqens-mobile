import React, { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TouchableOpacity } from 'react-native'
import { PostCard } from '../../components/post/PostCard'
import { Skeleton } from '../../components/shared/Skeleton'
import { EmptyState } from '../../components/shared/EmptyState'
import { postsApi } from '../../api/posts'
import { colors, fonts, fontSize, spacing } from '../../theme'

export default function TagFeedScreen() {
  const { tag } = useLocalSearchParams<{ tag: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => { load(1) }, [tag])

  const load = async (p: number) => {
    if (p === 1) setLoading(true)
    try {
      const res = await postsApi.getTagFeed(tag, p)
      const data = res.data.posts ?? res.data ?? []
      setPosts(prev => p === 1 ? data : [...prev, ...data])
      setPage(p)
      setHasMore(data.length === 20)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>#{tag}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {loading && posts.length === 0 ? (
        <View style={{ padding: spacing.base, gap: spacing.md }}>
          {[...Array(3)].map((_, i) => <Skeleton key={i} variant="rect" height={160} />)}
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={p => p.id}
          renderItem={({ item }) => <PostCard post={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(1) }} tintColor={colors.accent} />
          }
          onEndReached={() => hasMore && load(page + 1)}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={<EmptyState icon="hash" title={`No posts for #${tag}`} />}
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
})
