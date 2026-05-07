import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, Image
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { rpcQuery } from '../../lib/api'
import { colors, spacing, radius } from '../../lib/theme'
import { useDebounce } from '../../hooks/useDebounce'
import { useEffect } from 'react'

export default function ExploreScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    loadTrendingTags()
  }, [])

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) search(debouncedQuery)
    else { setResults([]); setSearched(false) }
  }, [debouncedQuery])

  async function loadTrendingTags() {
    try {
      const res = await rpcQuery({
        table: 'tags', action: 'select',
        select: 'id, name, slug, post_count',
        order: { col: 'post_count', ascending: false },
        limit: 20,
      })
      setTags(res.data || [])
    } catch {}
  }

  async function search(q: string) {
    setLoading(true)
    setSearched(true)
    try {
      // Search users
      const usersRes = await rpcQuery({
        table: 'profiles', action: 'select',
        select: 'id, username, display_name, profile_picture_url, is_verified, follower_count',
        filters: [{ type: 'or', val: `username.ilike.%${q}%,display_name.ilike.%${q}%` }],
        limit: 10,
      })
      // Search posts
      const postsRes = await rpcQuery({
        table: 'posts', action: 'select',
        select: 'id, title, description, type, created_at, profile:profiles!posts_user_id_fkey(username, display_name, profile_picture_url)',
        filters: [
          { type: 'eq', col: 'status', val: 'published' },
          { type: 'or', val: `title.ilike.%${q}%,description.ilike.%${q}%` },
        ],
        limit: 10,
      })
      const users = (usersRes.data || []).map((u: any) => ({ ...u, _type: 'user' }))
      const posts = (postsRes.data || []).map((p: any) => ({ ...p, _type: 'post' }))
      setResults([...users, ...posts])
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people, posts, tags..."
            placeholderTextColor={colors.gray300}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false) }}>
              <Ionicons name="close-circle" size={18} color={colors.gray300} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {!searched ? (
        // Trending tags
        <FlatList
          data={tags}
          keyExtractor={item => item.id}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Trending Topics</Text>}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.tagRow} activeOpacity={0.7}>
              <View style={styles.tagRank}>
                <Text style={styles.tagRankText}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tagName}>#{item.name}</Text>
                {item.post_count > 0 && (
                  <Text style={styles.tagCount}>{item.post_count} posts</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.gray300} />
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        // Search results
        <FlatList
          data={results}
          keyExtractor={item => `${item._type}-${item.id}`}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No results for "{query}"</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            if (item._type === 'user') {
              return (
                <TouchableOpacity
                  style={styles.resultRow}
                  onPress={() => router.push(`/profile/${item.username}`)}
                  activeOpacity={0.7}
                >
                  {item.profile_picture_url ? (
                    <Image source={{ uri: item.profile_picture_url }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={styles.avatarLetter}>{(item.display_name || item.username)[0].toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.resultName}>{item.display_name}</Text>
                      {item.is_verified && <Ionicons name="checkmark-circle" size={13} color={colors.primary} />}
                    </View>
                    <Text style={styles.resultSub}>@{item.username}</Text>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>User</Text>
                  </View>
                </TouchableOpacity>
              )
            }
            return (
              <TouchableOpacity
                style={styles.resultRow}
                onPress={() => router.push(`/post/${item.id}`)}
                activeOpacity={0.7}
              >
                <View style={[styles.avatar, styles.postIcon]}>
                  <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName} numberOfLines={1}>{item.title || 'Untitled'}</Text>
                  <Text style={styles.resultSub} numberOfLines={1}>by @{item.profile?.username}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: '#FFF3E0' }]}>
                  <Text style={[styles.typeBadgeText, { color: colors.warning }]}>Post</Text>
                </View>
              </TouchableOpacity>
            )
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  searchWrap: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.black },
  loadingRow: { padding: spacing.sm, alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.black, padding: spacing.md, paddingBottom: spacing.sm },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  tagRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  tagRankText: { fontSize: 12, fontWeight: '700', color: colors.gray700 },
  tagName: { fontSize: 15, fontWeight: '600', color: colors.black },
  tagCount: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: colors.primary },
  postIcon: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  resultName: { fontSize: 15, fontWeight: '600', color: colors.black },
  resultSub: { fontSize: 13, color: colors.gray500, marginTop: 2 },
  typeBadge: { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  typeBadgeText: { fontSize: 11, fontWeight: '600', color: colors.primary },  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { color: colors.gray500, fontSize: 15 },
})
