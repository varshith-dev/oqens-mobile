import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { rpcQuery } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { colors, spacing, radius } from '../../lib/theme'
import PostCard from '../../components/PostCard'

export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    if (username) loadProfile()
  }, [username])

  async function loadProfile() {
    try {
      const profileRes = await rpcQuery({
        table: 'profiles', action: 'select',
        select: 'id, username, display_name, profile_picture_url, bio, is_verified, role, follower_count, following_count, post_count',
        filters: [{ type: 'eq', col: 'username', val: username }],
        single: true,
      })
      const p = profileRes.data
      setProfile(p)

      if (p) {
        const [postsRes, followRes] = await Promise.all([
          rpcQuery({
            table: 'posts', action: 'select',
            select: 'id, user_id, title, description, content_url, type, created_at, profile:profiles!posts_user_id_fkey(id, username, display_name, profile_picture_url, is_verified), post_tags(tags(id, name, slug))',
            filters: [
              { type: 'eq', col: 'user_id', val: p.id },
              { type: 'eq', col: 'status', val: 'published' },
            ],
            order: { col: 'created_at', ascending: false },
            limit: 20,
          }),
          user ? rpcQuery({
            table: 'follows', action: 'select', select: 'id',
            filters: [
              { type: 'eq', col: 'follower_id', val: user.id },
              { type: 'eq', col: 'following_id', val: p.id },
            ],
            maybeSingle: true,
          }) : Promise.resolve({ data: null }),
        ])
        setPosts(postsRes.data || [])
        setIsFollowing(!!followRes.data)
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handleFollow() {
    if (!user) return router.push('/(auth)/login')
    setFollowLoading(true)
    const prev = isFollowing
    setIsFollowing(!prev)
    setProfile((p: any) => p ? { ...p, follower_count: (p.follower_count || 0) + (prev ? -1 : 1) } : p)
    try {
      if (prev) {
        await rpcQuery({
          table: 'follows', action: 'delete',
          filters: [
            { type: 'eq', col: 'follower_id', val: user.id },
            { type: 'eq', col: 'following_id', val: profile.id },
          ],
        })
      } else {
        await rpcQuery({
          table: 'follows', action: 'insert',
          data: { follower_id: user.id, following_id: profile.id },
        })
      }
    } catch {
      setIsFollowing(prev)
      setProfile((p: any) => p ? { ...p, follower_count: (p.follower_count || 0) + (prev ? 1 : -1) } : p)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
  }

  if (!profile) {
    return <View style={styles.center}><Text style={styles.errorText}>User not found</Text></View>
  }

  const isOwnProfile = user?.id === profile.id

  const ListHeader = () => (
    <View>
      <View style={styles.cover} />
      <View style={styles.profileSection}>
        <View style={styles.avatarRow}>
          {profile.profile_picture_url ? (
            <Image source={{ uri: profile.profile_picture_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarLetter}>{(profile.display_name || profile.username)[0].toUpperCase()}</Text>
            </View>
          )}
          {!isOwnProfile && (
            <TouchableOpacity
              style={[styles.followBtn, isFollowing && styles.followingBtn]}
              onPress={handleFollow}
              disabled={followLoading}
              activeOpacity={0.85}
            >
              <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.displayName}>{profile.display_name}</Text>
          {profile.is_verified && <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={{ marginLeft: 4 }} />}
        </View>
        <Text style={styles.username}>@{profile.username}</Text>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <View style={styles.stats}>
          {[
            { label: 'Posts', value: profile.post_count || posts.length },
            { label: 'Followers', value: profile.follower_count || 0 },
            { label: 'Following', value: profile.following_count || 0 },
          ].map(s => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  )

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.white }}
      data={posts}
      keyExtractor={item => item.id}
      ListHeaderComponent={<ListHeader />}
      renderItem={({ item }) => (
        <PostCard post={item} likeCount={0} commentCount={0} userLiked={false} onLikeToggle={() => {}} />
      )}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.errorText}>No posts yet</Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.gray500, fontSize: 15 },
  cover: { height: 100, backgroundColor: colors.primaryLight },
  profileSection: { padding: spacing.md },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -36 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: colors.white },
  avatarFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 28, fontWeight: '700', color: colors.primary },
  followBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  followingBtn: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border },
  followBtnText: { fontSize: 14, fontWeight: '700', color: colors.white },
  followingBtnText: { color: colors.black },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  displayName: { fontSize: 20, fontWeight: '800', color: colors.black },
  username: { fontSize: 14, color: colors.gray500, marginTop: 2 },
  bio: { fontSize: 14, color: colors.gray700, marginTop: spacing.sm, lineHeight: 20 },
  stats: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.xl },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.black },
  statLabel: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  divider: { height: 8, backgroundColor: colors.gray100 },
})
