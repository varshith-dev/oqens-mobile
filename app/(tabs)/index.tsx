import { useEffect, useState, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Image
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { rpcQuery, rpcFunction, apiClient } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import PostCard from '../../components/PostCard'
import { colors, spacing, radius } from '../../lib/theme'

const PAGE_SIZE = 15
const TABS = ['For you', 'Following', 'Popular']

export default function HomeScreen() {
  const router = useRouter()
  const { user, session } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage] = useState(0)
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadPosts(0, true)
  }, [activeTab])

  useEffect(() => {
    if (session && user) fetchUserLikes()
  }, [session, user])

  async function fetchUserLikes() {
    try {
      const res = await rpcQuery({
        table: 'likes', action: 'select', select: 'post_id',
        filters: [{ type: 'eq', col: 'user_id', val: user!.id }],
      })
      const map: Record<string, boolean> = {}
      res.data?.forEach((l: any) => { map[l.post_id] = true })
      setUserLikes(map)
    } catch {}
  }

  async function loadPosts(pageNum = 0, initial = false) {
    try {
      if (initial) setLoading(true)
      else setLoadingMore(true)

      const start = pageNum * PAGE_SIZE
      const end = start + PAGE_SIZE - 1

      let filters: any[] = [
        { type: 'eq', col: 'status', val: 'published' },
        { type: 'eq', col: 'visibility', val: 'public' },
      ]

      // Following tab — filter by followed users
      if (activeTab === 1 && user) {
        const followRes = await rpcQuery({
          table: 'follows', action: 'select', select: 'following_id',
          filters: [{ type: 'eq', col: 'follower_id', val: user.id }],
        })
        const ids = followRes.data?.map((f: any) => f.following_id) || []
        if (ids.length === 0) {
          setPosts([])
          setHasMore(false)
          return
        }
        filters.push({ type: 'in', col: 'user_id', vals: ids })
      }

      const res = await rpcQuery({
        table: 'posts',
        action: 'select',
        select: `id, user_id, title, description, content_url, type, created_at, is_pinned,
          profile:profiles!posts_user_id_fkey(id, username, display_name, profile_picture_url, is_verified),
          post_tags(tags(id, name, slug))`,
        filters,
        order: { col: 'created_at', ascending: false },
        range: { start, end },
      })

      const data = res.data || []
      setHasMore(data.length >= PAGE_SIZE)

      // Fetch counts
      if (data.length > 0) {
        const ids = data.map((p: any) => p.id)
        const countsRes = await rpcFunction('get_posts_counts', { post_ids: ids })
        const lk: Record<string, number> = {}
        const cm: Record<string, number> = {}
        countsRes.data?.forEach((r: any) => {
          lk[r.post_id] = parseInt(r.like_count) || 0
          cm[r.post_id] = parseInt(r.comment_count) || 0
        })
        setLikeCounts(prev => ({ ...prev, ...lk }))
        setCommentCounts(prev => ({ ...prev, ...cm }))
      }

      if (initial) setPosts(data)
      else setPosts(prev => [...prev, ...data])
      setPage(pageNum)
    } catch (e) {
      console.error('Feed error:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }

  async function handleLike(postId: string) {
    if (!user) return router.push('/(auth)/login')
    const liked = userLikes[postId]
    setUserLikes(prev => ({ ...prev, [postId]: !liked }))
    setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (liked ? -1 : 1) }))
    try {
      if (liked) {
        await rpcQuery({
          table: 'likes', action: 'delete',
          filters: [
            { type: 'eq', col: 'user_id', val: user.id },
            { type: 'eq', col: 'post_id', val: postId },
          ],
        })
      } else {
        await rpcQuery({
          table: 'likes', action: 'upsert',
          data: { post_id: postId, user_id: user.id, emoji: '❤️' },
          onConflict: 'user_id,post_id',
        })
      }
    } catch {
      // revert
      setUserLikes(prev => ({ ...prev, [postId]: liked }))
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (liked ? 1 : -1) }))
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadPosts(0, true)
  }, [activeTab])

  const onEndReached = useCallback(() => {
    if (!loadingMore && hasMore) loadPosts(page + 1)
  }, [loadingMore, hasMore, page])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>OQENS</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/explore')} style={styles.iconBtn}>
            <Ionicons name="search-outline" size={22} color={colors.black} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => { setActiveTab(i); setPosts([]); setPage(0); setHasMore(true) }}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              likeCount={likeCounts[item.id] || 0}
              commentCount={commentCounts[item.id] || 0}
              userLiked={!!userLikes[item.id]}
              onLikeToggle={handleLike}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 16 }} color={colors.primary} /> : null}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/create')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: { fontSize: 20, fontWeight: '900', color: colors.black, letterSpacing: 1 },
  headerRight: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { padding: 4 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: { paddingVertical: 12, paddingHorizontal: spacing.md, marginRight: 4 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.black },
  tabText: { fontSize: 14, fontWeight: '500', color: colors.gray500 },
  tabTextActive: { color: colors.black, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { color: colors.gray500, fontSize: 15 },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: spacing.md,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
})
