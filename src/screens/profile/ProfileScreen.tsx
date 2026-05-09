import React, { useEffect, useState } from 'react'
import {
  FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as WebBrowser from 'expo-web-browser'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { PostCard } from '../../components/post/PostCard'
import { Skeleton } from '../../components/shared/Skeleton'
import { useAuthStore } from '../../store/useAuthStore'
import client from '../../api/client'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'
import { formatCount } from '../../utils/format'

export default function ProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, refreshUser } = useAuthStore()
  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'saved'>('posts')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { loadPosts() }, [activeTab])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const endpoint = activeTab === 'posts' ? '/users/me/posts' : activeTab === 'liked' ? '/users/me/liked' : '/users/me/saved'
      const res = await client.get(endpoint)
      setPosts(res.data.posts ?? res.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refreshUser(), loadPosts()])
    setRefreshing(false)
  }

  if (!user) return null

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover */}
        <View style={styles.cover}>
          {user.cover_url
            ? <Image source={{ uri: user.cover_url }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="Cover photo" />
            : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
          }
        </View>

        {/* Avatar + edit */}
        <View style={styles.avatarRow}>
          <View style={styles.avatarWrap}>
            <Avatar uri={user.avatar_url} name={user.display_name} size="xl" />
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{user.display_name}</Text>
            {user.is_verified && <Feather name="check-circle" size={16} color={colors.accent} style={{ marginLeft: 4 }} />}
          </View>
          <Text style={styles.handle}>@{user.username}</Text>
          {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
          {user.website && (
            <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(user.website!)} accessibilityLabel="Open website">
              <Text style={styles.website}>{user.website}</Text>
            </TouchableOpacity>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.stat} accessibilityLabel={`${user.posts_count} posts`}>
              <Text style={styles.statNum}>{formatCount(user.posts_count)}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stat}
              onPress={() => router.push(`/users/${user.username}/followers`)}
              accessibilityLabel={`${user.followers_count} followers`}
            >
              <Text style={styles.statNum}>{formatCount(user.followers_count)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stat}
              onPress={() => router.push(`/users/${user.username}/following`)}
              accessibilityLabel={`${user.following_count} following`}
            >
              <Text style={styles.statNum}>{formatCount(user.following_count)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          <Button
            label="Edit Profile"
            onPress={() => router.push('/profile/edit')}
            variant="secondary"
            fullWidth
            size="md"
            style={{ marginTop: spacing.md }}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['posts', 'liked', 'saved'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, activeTab === t && styles.tabActive]}
              onPress={() => setActiveTab(t)}
              accessibilityLabel={`${t} tab`}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Posts */}
        {loading
          ? <View style={{ padding: spacing.base, gap: spacing.md }}>
              {[...Array(3)].map((_, i) => <Skeleton key={i} variant="rect" height={140} />)}
            </View>
          : posts.map(p => <PostCard key={p.id} post={p} />)
        }
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  cover: { height: 120, backgroundColor: colors.surface },
  avatarRow: { paddingHorizontal: spacing.base, marginTop: -36 },
  avatarWrap: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: colors.bg,
  },
  info: { paddingHorizontal: spacing.base, paddingTop: spacing.sm, paddingBottom: spacing.base },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  displayName: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.textPrimary },
  handle: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  bio: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  website: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.accent, marginTop: spacing.xs },
  statsRow: { flexDirection: 'row', marginTop: spacing.base, gap: spacing.xl },
  stat: { alignItems: 'center' },
  statNum: { fontFamily: fonts.heading, fontSize: fontSize.md, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary },
  tabRow: {
    flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.accent },
  tabText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textMuted },
  tabTextActive: { color: colors.accent },
})
