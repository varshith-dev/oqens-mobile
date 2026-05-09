import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator, FlatList, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { PostCard } from '../../components/post/PostCard'
import { EmptyState } from '../../components/shared/EmptyState'
import { FollowButton } from '../../components/ui/FollowButton'
import { Skeleton } from '../../components/shared/Skeleton'
import client from '../../api/client'
import { useDebounce } from '../../hooks/useDebounce'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'
import { ASYNC_STORAGE_RECENT_SEARCHES_KEY } from '../../utils/constants'

export default function ExploreScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'people' | 'posts' | 'tags'>('all')
  const [loading, setLoading] = useState(false)
  const [trending, setTrending] = useState<any[]>([])
  const [suggested, setSuggested] = useState<any[]>([])
  const [popular, setPopular] = useState<any[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    loadDefaults()
    loadRecentSearches()
  }, [])

  useEffect(() => {
    if (debouncedQuery.trim()) search(debouncedQuery)
    else setResults(null)
  }, [debouncedQuery])

  const loadDefaults = async () => {
    try {
      const [t, s, p] = await Promise.all([
        client.get('/explore/trending'),
        client.get('/explore/suggested'),
        client.get('/explore/popular'),
      ])
      setTrending(t.data.tags ?? t.data ?? [])
      setSuggested(s.data.users ?? s.data ?? [])
      setPopular(p.data.posts ?? p.data ?? [])
    } catch { /* non-critical */ }
  }

  const loadRecentSearches = async () => {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_RECENT_SEARCHES_KEY)
    if (raw) setRecentSearches(JSON.parse(raw))
  }

  const saveSearch = async (q: string) => {
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 8)
    setRecentSearches(updated)
    await AsyncStorage.setItem(ASYNC_STORAGE_RECENT_SEARCHES_KEY, JSON.stringify(updated))
  }

  const search = async (q: string) => {
    setLoading(true)
    try {
      const res = await client.get('/search', { params: { q, type: 'all' } })
      setResults(res.data)
      saveSearch(q)
    } catch {
      setResults({ users: [], posts: [], tags: [] })
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => { setQuery(''); setResults(null) }

  const FILTERS = ['all', 'people', 'posts', 'tags'] as const

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search people, posts, tags…"
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel="Search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} accessibilityLabel="Clear search">
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Active search */}
      {query.length > 0 ? (
        <>
          {/* Filter tabs */}
          <View style={styles.filterRow}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterTab, filter === f && styles.filterTabActive]}
                accessibilityLabel={`Filter by ${f}`}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={{ padding: spacing.base, gap: spacing.md }}>
              {[...Array(4)].map((_, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                  <Skeleton variant="circle" width={40} />
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <Skeleton variant="line" width="50%" height={14} />
                    <Skeleton variant="line" width="35%" height={12} />
                  </View>
                </View>
              ))}
            </View>
          ) : results ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {(filter === 'all' || filter === 'people') && results.users?.map((u: any) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.userRow}
                  onPress={() => router.push(`/users/${u.username}`)}
                  accessibilityLabel={`View ${u.display_name}'s profile`}
                >
                  <Avatar uri={u.avatar_url} name={u.display_name} size="md" />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{u.display_name}</Text>
                    <Text style={styles.userHandle}>@{u.username}</Text>
                  </View>
                  <FollowButton userId={u.id} isFollowing={u.is_following ?? false} size="sm" />
                </TouchableOpacity>
              ))}
              {(filter === 'all' || filter === 'tags') && results.tags?.map((t: any) => (
                <TouchableOpacity
                  key={t.tag}
                  style={styles.tagRow}
                  onPress={() => router.push(`/tags/${t.tag}`)}
                  accessibilityLabel={`View #${t.tag} feed`}
                >
                  <View style={styles.tagIcon}>
                    <Text style={styles.tagHash}>#</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{t.tag}</Text>
                    <Text style={styles.userHandle}>{t.post_count} posts</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
              {(filter === 'all' || filter === 'posts') && results.posts?.map((p: any) => (
                <PostCard key={p.id} post={p} />
              ))}
              {!results.users?.length && !results.tags?.length && !results.posts?.length && (
                <EmptyState icon="search" title={`No results for "${query}"`} />
              )}
            </ScrollView>
          ) : null}
        </>
      ) : (
        /* Default state */
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RECENT</Text>
              <View style={styles.chipsRow}>
                {recentSearches.map(s => (
                  <TouchableOpacity key={s} onPress={() => setQuery(s)} style={styles.chip} accessibilityLabel={`Search ${s}`}>
                    <Text style={styles.chipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Trending */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TRENDING TOPICS</Text>
            {trending.map((t, i) => (
              <TouchableOpacity
                key={t.tag}
                style={styles.trendRow}
                onPress={() => router.push(`/tags/${t.tag}`)}
                accessibilityLabel={`View #${t.tag} feed`}
              >
                <Text style={styles.trendRank}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trendTag}>#{t.tag}</Text>
                  <Text style={styles.trendCount}>{t.post_count} posts</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Suggested people */}
          {suggested.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SUGGESTED PEOPLE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: spacing.base }}>
                {suggested.map((u: any) => (
                  <TouchableOpacity
                    key={u.id}
                    style={styles.suggestedCard}
                    onPress={() => router.push(`/users/${u.username}`)}
                    accessibilityLabel={`View ${u.display_name}'s profile`}
                  >
                    <Avatar uri={u.avatar_url} name={u.display_name} size="lg" />
                    <Text style={styles.suggestedName} numberOfLines={1}>{u.display_name}</Text>
                    <Text style={styles.suggestedHandle} numberOfLines={1}>@{u.username}</Text>
                    <FollowButton userId={u.id} isFollowing={u.is_following ?? false} size="sm" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Popular posts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>POPULAR POSTS</Text>
            {popular.map((p: any) => <PostCard key={p.id} post={p} />)}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchRow: { padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, height: 44,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textPrimary },
  filterRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  filterTab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  filterTabActive: { borderBottomColor: colors.accent },
  filterText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textMuted },
  filterTextActive: { color: colors.accent },
  section: { paddingTop: spacing.base },
  sectionTitle: {
    fontFamily: fonts.medium, fontSize: fontSize.xs,
    color: colors.textMuted, paddingHorizontal: spacing.base,
    marginBottom: spacing.sm, letterSpacing: 0.5,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.base, gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  chipText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  trendRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  trendRank: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.textMuted, width: 20 },
  trendTag: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.textPrimary },
  trendCount: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  userInfo: { flex: 1 },
  userName: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.textPrimary },
  userHandle: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  tagRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tagIcon: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  tagHash: { fontFamily: fonts.heading, fontSize: fontSize.md, color: colors.accent },
  suggestedCard: {
    width: 120, alignItems: 'center', marginRight: spacing.md,
    padding: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.md, gap: spacing.xs,
  },
  suggestedName: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textPrimary },
  suggestedHandle: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary },
})
