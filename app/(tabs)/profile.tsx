import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ActivityIndicator, Alert, Modal, ScrollView
} from 'react-native'
import { useRouter } from 'expo-router'
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

function FollowListModal({
  visible, title, userId, type, onClose
}: {
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
        <View style={modal.header}>
          <Text style={modal.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.black} /></TouchableOpacity>
        </View>
        {loading ? (
          <View style={modal.center}><ActivityIndicator color={colors.primary} /></View>
        ) : (
          <ScrollView>
            {users.map(u => (
              <TouchableOpacity
                key={u.id}
                style={modal.row}
                onPress={() => { onClose(); router.push(`/profile/${u.username}`) }}
                activeOpacity={0.7}
              >
                {u.profile_picture_url ? (
                  <Image source={{ uri: u.profile_picture_url }} style={modal.avatar} />
                ) : (
                  <View style={[modal.avatar, modal.avatarFallback]}>
                    <Text style={modal.avatarLetter}>{(u.display_name || u.username || '?')[0].toUpperCase()}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={modal.name}>{u.display_name || u.username}</Text>
                    {u.is_verified && <Ionicons name="checkmark-circle" size={13} color="#3B82F6" />}
                  </View>
                  <Text style={modal.username}>@{u.username}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {users.length === 0 && (
              <View style={modal.center}><Text style={{ color: colors.gray500 }}>No users yet</Text></View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  )
}

const modal = StyleSheet.create({
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

export default function ProfileScreen() {
  const { user, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [followModal, setFollowModal] = useState<{ type: 'followers' | 'following'; title: string } | null>(null)

  useEffect(() => {
    if (!authLoading && user) loadProfile()
    else if (!authLoading && !user) router.replace('/(auth)/welcome')
  }, [user, authLoading])

  async function loadProfile() {
    try {
      const [profileRes, postsRes] = await Promise.all([
        rpcQuery({
          table: 'profiles', action: 'select',
          select: 'id, username, display_name, profile_picture_url, banner_image_url, bio, is_verified, role, follower_count, following_count, special_badge_config',
          filters: [{ type: 'eq', col: 'id', val: user!.id }],
          limit: 1,
        }),
        rpcQuery({
          table: 'posts', action: 'select',
          select: 'id, user_id, title, description, content_url, code_snippet, code_language, type, created_at, profile:profiles!posts_user_id_fkey(id, username, display_name, profile_picture_url, is_verified, role, special_badge_config), post_tags(tags(id, name, slug))',
          filters: [
            { type: 'eq', col: 'user_id', val: user!.id },
            { type: 'eq', col: 'status', val: 'published' },
          ],
          order: { col: 'created_at', ascending: false },
          limit: 20,
        }),
      ])
      const p = Array.isArray(profileRes.data) ? profileRes.data[0] : profileRes.data
      setProfile(p || {
        id: user!.id, username: user!.username, display_name: user!.display_name,
        profile_picture_url: user!.profile_picture_url, is_verified: user!.is_verified,
        role: user!.role, follower_count: 0, following_count: 0,
      })
      setPosts(postsRes.data || [])
    } catch (e) {
      console.error('Profile error:', e)
      setProfile({
        id: user!.id, username: user!.username, display_name: user!.display_name,
        profile_picture_url: user!.profile_picture_url, is_verified: user!.is_verified,
        role: user!.role, follower_count: 0, following_count: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ])
  }

  if (loading || authLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    )
  }

  const role = profile?.role?.toLowerCase()
  const showTick = profile?.is_verified || role === 'admin' || role === 'moderator' || role === 'advertiser'

  const ListHeader = () => (
    <View>
      {/* Banner */}
      {profile?.banner_image_url ? (
        <Image source={{ uri: profile.banner_image_url }} style={styles.banner} resizeMode="cover" />
      ) : (
        <View style={styles.bannerPlaceholder} />
      )}

      <View style={styles.profileSection}>
        <View style={styles.avatarRow}>
          {profile?.profile_picture_url ? (
            <Image source={{ uri: profile.profile_picture_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarLetter}>
                {(profile?.display_name || profile?.username || '?')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.displayName}>{profile?.display_name}</Text>
          {showTick && <VerifiedTick role={role} />}
        </View>
        <Text style={styles.username}>@{profile?.username}</Text>
        {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => setFollowModal({ type: 'followers', title: 'Followers' })}
            activeOpacity={0.7}
          >
            <Text style={styles.statValue}>{profile?.follower_count || 0}</Text>
            <Text style={[styles.statLabel, styles.statLabelLink]}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => setFollowModal({ type: 'following', title: 'Following' })}
            activeOpacity={0.7}
          >
            <Text style={styles.statValue}>{profile?.following_count || 0}</Text>
            <Text style={[styles.statLabel, styles.statLabelLink]}>Following</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Posts</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.iconBtn}>
          <Ionicons name="log-out-outline" size={22} color={colors.gray700} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        ListHeaderComponent={<ListHeader />}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            likeCount={likeCounts[item.id] || 0}
            commentCount={commentCounts[item.id] || 0}
            userLiked={false}
            onLikeToggle={() => {}}
          />
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No posts yet</Text>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.black },
  iconBtn: { padding: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { color: colors.gray500, fontSize: 15 },
  banner: { width: '100%', height: 120 },
  bannerPlaceholder: { height: 100, backgroundColor: colors.primaryLight },
  profileSection: { padding: spacing.md },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -36 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: colors.white },
  avatarFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 28, fontWeight: '700', color: colors.primary },
  editBtn: {
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 8,
  },
  editBtnText: { fontSize: 13, fontWeight: '600', color: colors.black },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  displayName: { fontSize: 20, fontWeight: '800', color: colors.black },
  username: { fontSize: 14, color: colors.gray500, marginTop: 2 },
  bio: { fontSize: 14, color: colors.gray700, marginTop: spacing.sm, lineHeight: 20 },
  stats: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.xl },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.black },
  statLabel: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  statLabelLink: { color: colors.primary, textDecorationLine: 'underline' },
  divider: { height: 1, backgroundColor: colors.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.black, padding: spacing.md, paddingBottom: spacing.sm },
})
