import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Modal, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { rpcQuery } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { colors, spacing, radius } from '../../lib/theme'
import PostCard from '../../components/PostCard'

function VerifiedTick({ role }: { role?: string }) {
  const isGold = role === 'admin' || role === 'moderator'
  const isGreen = role === 'advertiser'
  const color = isGold ? '#EAB308' : isGreen ? '#22C55E' : '#3B82F6'
  return <Ionicons name="checkmark-circle" size={18} color={color} style={{ marginLeft: 4 }} />
}

function FollowListModal({ visible, title, userId, type, onClose }: {
  visible: boolean; title: string; userId: string; type: 'followers' | 'following'; onClose: () => void
}) {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (visible && userId) load()
  }, [visible, userId])

  async function load() {
    setLoading(true)
    try {
      if (type === 'followers') {
        const res = await rpcQuery({
          table: 'follows', action: 'select',
          select: 'follower_id, profile:profiles!follows_follower_id_fkey(id, username, display_name, profile_picture_url, is_verified, role)',
          filters: [{ type: 'eq', col: 'following_id', val: userId }],
          limit: 50,
        })
        setUsers((res.data || []).map((r: any) => r.profile).filter(Boolean))
      } else {
        const res = await rpcQuery({
          table: 'follows', action: 'select',
          select: 'following_id, profile:profiles!follows_following_id_fkey(id, username, display_name, profile_picture_url, is_verified, role)',
          filters: [{ type: 'eq', col: 'follower_id', val: userId }],
          limit: 50,
        })
        setUsers((res.data || []).map((r: any) => r.profile).filter(Boolean))
      }
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={['top']}>
        <View style={mstyles.header}>
          <Text style={mstyles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.black} /></TouchableOpacity>
        </View>
        {loading ? (
          <View style={mstyles.center}><ActivityIndicator color={colors.primary} /></View>
        ) : (
          <ScrollView>
            {users.map(u => (
              <TouchableOpacity key={u.id} style={mstyles.row}
                onPress={() => { onClose(); router.push(`/profile/${u.username}`) }} activeOpacity={0.7}>
                {u.profile_picture_url ? (
                  <Image source={{ uri: u.profile_picture_url }} style={mstyles.avatar} />
                ) : (
                  <View style={[mstyles.avatar, mstyles.avatarFallback]}>
                    <Text style={mstyles.avatarLetter}>{(u.display_name || u.username || '?')[0].toUpperCase()}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={mstyles.name}>{u.display_name || u.username}</Text>
                    {u.is_verified && <Ionicons name="checkmark-circle" size={13} color="#3B82F6" />}
                  </View>
                  <Text style={mstyles.username}>@{u.username}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {users.length === 0 && <View style={mstyles.center}><Text style={{ color: colors.gray500 }}>No users yet</Text></View>}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  )
}

const mstyles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 17, fontWeight: '700', color: colors.black },
  center: { padding: spacing.xl, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 16, fontWeight: '700', color: colors.primary },
  name: { fontSize: 14, fontWeight: '700', color: colors.black },
  username: { fontSize: 12, color: colors.gray500 },
})

export default function PublicProfileScreen() {
  const params = useLocalSearchParams<{ username: string }>()
  // username can be array in some cases — always take first value
  const username = Array.isArray(params.username) ? params.username[0] : params.username
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [followModal, setFollowModal] = useState<{ type: 'followers' | 'following'; title: string } | null>(null)

  useEffect(() => {
    if (username && username !== 'undefined') {
      setLoading(true)
      setError(null)
      loadProfile()
    } else {
      setLoading(false)
      setError('Invalid profile')
    }
  }, [username])

  async function loadProfile() {
    try {
      console.log('[Profile] Loading username:', username)
      const profileRes = await rpcQuery({
        table: 'profiles', action: 'select',
        select: 'id, username, display_name, profile_picture_url, banner_image_url, bio, is_verified, role, follower_count, following_count, special_badge_config',
        filters: [{ type: 'eq', col: 'username', val: username }],
        limit: 1,
      })
      console.log('[Profile] Response:', JSON.stringify(profileRes))
      // single: true throws 400 if not found — use limit:1 and take first row
      const p = Array.isArray(profileRes.data) ? profileRes.data[0] : profileRes.data
      if (!p) {
        setError('User not found')
        setLoading(false)
        return
      }
      setProfile(p)

      const [postsRes, followRes] = await Promise.all([
        rpcQuery({
          table: 'posts', action: 'select',
          select: 'id, user_id, title, description, content_url, code_snippet, code_language, type, created_at, profile:profiles!posts_user_id_fkey(id, username, display_name, profile_picture_url, is_verified), post_tags(tags(id, name, slug))',
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
          limit: 1,
        }) : Promise.resolve({ data: [] }),
      ])
      setPosts(postsRes.data || [])
      const followRow = Array.isArray(followRes.data) ? followRes.data[0] : followRes.data
      setIsFollowing(!!followRow)
    } catch (e: any) {
      console.error('[Profile] Error:', e?.response?.data || e?.message || e)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
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

  if (error || !profile) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-outline" size={48} color={colors.gray300} />
        <Text style={styles.errorText}>{error || 'User not found'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const isOwnProfile = user?.id === profile.id

  const ListHeader = () => (
    <View>
      {/* Banner */}
      {profile.banner_image_url ? (
        <Image source={{ uri: profile.banner_image_url }} style={styles.banner} resizeMode="cover" />
      ) : (
        <View style={styles.bannerPlaceholder} />
      )}
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
          {(profile.is_verified || ['admin','moderator','advertiser'].includes(profile.role?.toLowerCase())) && (
            <VerifiedTick role={profile.role?.toLowerCase()} />
          )}
        </View>
        <Text style={styles.username}>@{profile.username}</Text>
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <TouchableOpacity style={styles.stat} onPress={() => setFollowModal({ type: 'followers', title: 'Followers' })} activeOpacity={0.7}>
            <Text style={styles.statValue}>{profile.follower_count || 0}</Text>
            <Text style={[styles.statLabel, styles.statLabelLink]}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat} onPress={() => setFollowModal({ type: 'following', title: 'Following' })} activeOpacity={0.7}>
            <Text style={styles.statValue}>{profile.following_count || 0}</Text>
            <Text style={[styles.statLabel, styles.statLabelLink]}>Following</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  )

  return (
    <>
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
      {followModal && profile?.id && (
        <FollowListModal
          visible
          title={followModal.title}
          userId={profile.id}
          type={followModal.type}
          onClose={() => setFollowModal(null)}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.gray500, fontSize: 15 },
  banner: { width: '100%', height: 120 },
  bannerPlaceholder: { height: 100, backgroundColor: colors.primaryLight },
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
  statLabelLink: { color: colors.primary, textDecorationLine: 'underline' },
  divider: { height: 8, backgroundColor: colors.gray100 },
})
