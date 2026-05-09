import React, { useEffect, useState } from 'react'
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as WebBrowser from 'expo-web-browser'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '../../components/ui/Avatar'
import { FollowButton } from '../../components/ui/FollowButton'
import { Button } from '../../components/ui/Button'
import { PostCard } from '../../components/post/PostCard'
import { Skeleton } from '../../components/shared/Skeleton'
import { BottomSheet } from '../../components/shared/BottomSheet'
import { usersApi } from '../../api/users'
import { useToast } from '../../hooks/useToast'
import { colors, fonts, fontSize, spacing } from '../../theme'
import { formatCount } from '../../utils/format'

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [menuVisible, setMenuVisible] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => { load() }, [username])

  const load = async () => {
    setLoading(true)
    try {
      const res = await usersApi.getProfile(username)
      const data = res.data.user ?? res.data
      setProfile(data)
      setIsBlocked(data.is_blocked ?? false)
      const postsRes = await usersApi.getProfile(username)
      setPosts(postsRes.data.posts ?? [])
    } catch {
      toast.show('Failed to load profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleBlock = async () => {
    try {
      if (isBlocked) {
        await usersApi.unblockUser(profile.id)
        setIsBlocked(false)
        toast.show('User unblocked', 'success')
      } else {
        await usersApi.blockUser(profile.id)
        setIsBlocked(true)
        toast.show('User blocked', 'neutral')
      }
    } catch {
      toast.show('Action failed', 'error')
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={{ padding: spacing.base, gap: spacing.md }}>
          <Skeleton variant="rect" height={120} />
          <Skeleton variant="circle" width={72} />
          <Skeleton variant="line" width="50%" height={18} />
          <Skeleton variant="line" width="35%" height={14} />
        </View>
      </View>
    )
  }

  if (!profile) return null

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.username}</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.backBtn} accessibilityLabel="More options">
          <Feather name="more-horizontal" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cover}>
          {profile.cover_url && (
            <Image source={{ uri: profile.cover_url }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="Cover photo" />
          )}
        </View>

        <View style={styles.avatarRow}>
          <Avatar uri={profile.avatar_url} name={profile.display_name} size="xl" />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{profile.display_name}</Text>
            {profile.is_verified && <Feather name="check-circle" size={16} color={colors.accent} style={{ marginLeft: 4 }} />}
          </View>
          <View style={styles.handleRow}>
            <Text style={styles.handle}>@{profile.username}</Text>
            {profile.follows_you && (
              <View style={styles.followsYouBadge}>
                <Text style={styles.followsYouText}>Follows you</Text>
              </View>
            )}
          </View>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          {profile.website && (
            <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(profile.website)} accessibilityLabel="Open website">
              <Text style={styles.website}>{profile.website}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{formatCount(profile.posts_count ?? 0)}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <TouchableOpacity style={styles.stat} onPress={() => router.push(`/users/${username}/followers`)} accessibilityLabel="View followers">
              <Text style={styles.statNum}>{formatCount(profile.followers_count ?? 0)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stat} onPress={() => router.push(`/users/${username}/following`)} accessibilityLabel="View following">
              <Text style={styles.statNum}>{formatCount(profile.following_count ?? 0)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          {isBlocked ? (
            <Button label="Unblock" onPress={handleBlock} variant="secondary" fullWidth style={{ marginTop: spacing.md }} />
          ) : (
            <View style={{ marginTop: spacing.md }}>
              <FollowButton userId={profile.id} isFollowing={profile.is_following ?? false} size="md" />
            </View>
          )}
        </View>

        {isBlocked ? (
          <View style={styles.blockedMsg}>
            <Text style={styles.blockedText}>You have blocked this user.</Text>
          </View>
        ) : (
          posts.map(p => <PostCard key={p.id} post={p} />)
        )}
      </ScrollView>

      <BottomSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        actions={[
          { label: 'Report User', onPress: () => { usersApi.reportUser(profile.id, 'spam'); toast.show('Reported', 'info') } },
          { label: isBlocked ? 'Unblock User' : 'Block User', onPress: handleBlock, destructive: !isBlocked },
        ]}
      />
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
  headerTitle: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.textPrimary },
  cover: { height: 120, backgroundColor: colors.surface },
  avatarRow: { paddingHorizontal: spacing.base, marginTop: -36 },
  info: { paddingHorizontal: spacing.base, paddingTop: spacing.sm, paddingBottom: spacing.base },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  displayName: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.textPrimary },
  handleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  handle: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  followsYouBadge: {
    backgroundColor: colors.surface, borderRadius: 4,
    paddingHorizontal: spacing.xs, paddingVertical: 2,
  },
  followsYouText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textMuted },
  bio: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  website: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.accent, marginTop: spacing.xs },
  statsRow: { flexDirection: 'row', marginTop: spacing.base, gap: spacing.xl },
  stat: { alignItems: 'center' },
  statNum: { fontFamily: fonts.heading, fontSize: fontSize.md, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary },
  blockedMsg: { padding: spacing.base, alignItems: 'center' },
  blockedText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textSecondary },
})
