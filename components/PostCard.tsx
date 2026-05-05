import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, spacing } from '../lib/theme'
import { useAuth } from '../context/AuthContext'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

interface Post {
  id: string
  user_id: string
  title?: string
  description?: string
  content_url?: string
  type: string
  created_at: string
  profile?: {
    id: string
    username: string
    display_name: string
    profile_picture_url: string | null
    is_verified: boolean
  }
  post_tags?: Array<{ tags: { id: string; name: string; slug: string } }>
  like_count?: number
  comment_count?: number
  user_liked?: boolean
}

interface Props {
  post: Post
  likeCount: number
  commentCount: number
  userLiked: boolean
  onLikeToggle: (postId: string) => void
}

export default function PostCard({ post, likeCount, commentCount, userLiked, onLikeToggle }: Props) {
  const router = useRouter()
  const { user } = useAuth()
  const ago = timeAgo(post.created_at)

  const tags = post.post_tags?.map(pt => pt.tags).filter(Boolean) || []

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/post/${post.id}`)}
      activeOpacity={0.97}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.authorRow}
          onPress={() => router.push(`/profile/${post.profile?.username}`)}
          activeOpacity={0.7}
        >
          {post.profile?.profile_picture_url ? (
            <Image source={{ uri: post.profile.profile_picture_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarLetter}>
                {(post.profile?.display_name || post.profile?.username || '?')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{post.profile?.display_name || post.profile?.username}</Text>
              {post.profile?.is_verified && (
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginLeft: 3 }} />
              )}
            </View>
            <Text style={styles.username}>@{post.profile?.username} · {ago}</Text>
          </View>
        </TouchableOpacity>
        <Ionicons name="ellipsis-horizontal" size={18} color={colors.gray500} />
      </View>

      {/* Tags */}
      {tags.length > 0 && (
        <View style={styles.tags}>
          {tags.slice(0, 4).map(tag => (
            <View key={tag.id} style={styles.tag}>
              <Text style={styles.tagText}>#{tag.name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Content */}
      {post.title && <Text style={styles.title}>{post.title}</Text>}
      {post.description && (
        <Text style={styles.description} numberOfLines={3}>{post.description}</Text>
      )}

      {/* Link preview */}
      {post.content_url && post.type === 'link' && (
        <View style={styles.linkPreview}>
          <View style={styles.linkIcon}>
            <Ionicons name="link" size={16} color={colors.primary} />
          </View>
          <Text style={styles.linkUrl} numberOfLines={1}>{post.content_url}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.action}
          onPress={() => onLikeToggle(post.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={userLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={userLiked ? colors.danger : colors.gray500}
          />
          <Text style={[styles.actionCount, userLiked && { color: colors.danger }]}>
            {likeCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={() => router.push(`/post/${post.id}`)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={19} color={colors.gray500} />
          <Text style={styles.actionCount}>{commentCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} activeOpacity={0.7}>
          <Ionicons name="arrow-redo-outline" size={20} color={colors.gray500} />
          <Text style={styles.actionCount}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.action, { marginLeft: 'auto' }]} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={20} color={colors.gray500} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 16, fontWeight: '700', color: colors.primary },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  displayName: { fontSize: 14, fontWeight: '700', color: colors.black },
  username: { fontSize: 12, color: colors.gray500, marginTop: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm },
  tag: { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, color: colors.gray700, fontWeight: '500' },
  title: { fontSize: 16, fontWeight: '700', color: colors.black, marginBottom: 4, lineHeight: 22 },
  description: { fontSize: 14, color: colors.gray700, lineHeight: 20, marginBottom: spacing.sm },
  linkPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkUrl: { fontSize: 13, color: colors.gray700, flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.md },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { fontSize: 13, color: colors.gray500, fontWeight: '500' },
})
