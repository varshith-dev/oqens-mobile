import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { rpcQuery } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { colors, spacing, radius } from '../../lib/theme'
import PostCard from '../../components/PostCard'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (user) loadProfile()
  }, [user])

  async function loadProfile() {
    try {
      const [profileRes, postsRes] = await Promise.all([
        rpcQuery({
          table: 'profiles', action: 'select',
          select: 'id, username, display_name, profile_picture_url, bio, is_verified, role, follower_count, following_count, post_count',
          filters: [{ type: 'eq', col: 'id', val: user!.id }],
          single: true,
        }),
        rpcQuery({
          table: 'posts', action: 'select',
          select: 'id, user_id, title, description, content_url, type, created_at, profile:profiles!posts_user_id_fkey(id, username, display_name, profile_picture_url, is_verified), post_tags(tags(id, name, slug))',
          filters: [
            { type: 'eq', col: 'user_id', val: user!.id },
            { type: 'eq', col: 'status', val: 'published' },
          ],
          order: { col: 'created_at', ascending: false },
          limit: 20,
        }),
      ])
      setProfile(profileRes.data)
      setPosts(postsRes.data || [])
    } catch {}
    finally { setLoading(false) }
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ])
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  const ListHeader = () => (
    <View>
      {/* Cover */}
      <View style={styles.cover} />

      {/* Profile info */}
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
          {profile?.is_verified && (
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={{ marginLeft: 4 }} />
          )}
        </View>
        <Text style={styles.username}>@{profile?.username}</Text>
        {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        {/* Stats */}
        <View style={styles.stats}>
          {[
            { label: 'Posts', value: profile?.post_count || posts.length },
            { label: 'Followers', value: profile?.follower_count || 0 },
            { label: 'Following', value: profile?.following_count || 0 },
          ].map(s => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.black },
  iconBtn: { padding: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { color: colors.gray500, fontSize: 15 },
  cover: { height: 100, backgroundColor: colors.primaryLight },
  profileSection: { padding: spacing.md },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -36 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: colors.white },
  avatarFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 28, fontWeight: '700', color: colors.primary },
  editBtn: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
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
  divider: { height: 1, backgroundColor: colors.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.black, padding: spacing.md, paddingBottom: spacing.sm },
})
