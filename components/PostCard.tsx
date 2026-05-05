import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, spacing } from '../lib/theme'

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
  code_snippet?: string
  code_language?: string
  type: string
  created_at: string
  profile?: {
    id: string
    username: string
    display_name: string
    profile_picture_url: string | null
    is_verified: boolean
    role?: string
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
  const ago = timeAgo(post.created_at)

  const tags = post.post_tags?.map(pt => pt.tags).filter(Boolean) || []
  const mediaUrls = post.content_url ? post.content_url.split(',').filter(Boolean) : []
  const hasMedia = mediaUrls.length > 0 && post.type === 'meme'
  const hasCode = post.code_snippet && post.type === 'code'

  // Role badge colors
  const getRoleBadge = (role?: string) => {
    if (!role || role === 'user') return null
    const badges: Record<string, { label: string; color: string; bg: string }> = {
      admin: { label: 'ADMIN', color: '#EF4444', bg: '#FEE2E2' },
      moderator: { label: 'MOD', color: '#F59E0B', bg: '#FEF3C7' },
      verified: { label: 'PRO', color: '#10B981', bg: '#D1FAE5' },
    }
    return badges[role.toLowerCase()]
  }

  const roleBadge = getRoleBadge(post.profile?.role)

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
          onPress={(e) => {
            e.stopPropagation()
            const uname = post.profile?.username
            if (uname) {
              router.push(`/profile/${uname}`)
            }
          }}
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
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName} numberOfLines={1}>
                {post.profile?.display_name || post.profile?.username}
              </Text>
              {post.profile?.is_verified && (
                <Ionicons name="checkmark-circle" size={14} color="#3B82F6" style={{ marginLeft: 3 }} />
              )}
              {roleBadge && (
                <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
                  <Text style={[styles.roleBadgeText, { color: roleBadge.color }]}>
                    {roleBadge.label}
                  </Text>
                </View>
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

      {/* Title */}
      {post.title && <Text style={styles.title}>{post.title}</Text>}

      {/* Media (Images/Videos) */}
      {hasMedia && (
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: mediaUrls[0] }}
            style={styles.media}
            resizeMode="cover"
          />
          {mediaUrls.length > 1 && (
            <View style={styles.mediaCount}>
              <Ionicons name="images" size={12} color={colors.white} />
              <Text style={styles.mediaCountText}>{mediaUrls.length}</Text>
            </View>
          )}
        </View>
      )}

      {/* Code Snippet */}
      {hasCode && (
        <View style={styles.codeContainer}>
          <View style={styles.codeHeader}>
            <Ionicons name="code-slash" size={14} color={colors.gray500} />
            <Text style={styles.codeLanguage}>{post.code_language || 'Code'}</Text>
          </View>
          <Text style={styles.codeSnippet} numberOfLines={8}>
            {post.code_snippet}
          </Text>
        </View>
      )}

      {/* Description */}
      {post.description && (
        <Text style={styles.description} numberOfLines={3}>{post.description}</Text>
      )}

      {/* Link Preview */}
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
          onPress={(e) => {
            e.stopPropagation()
            onLikeToggle(post.id)
          }}
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
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  displayName: { fontSize: 14, fontWeight: '700', color: colors.black },
  username: { fontSize: 12, color: colors.gray500, marginTop: 1 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, marginLeft: 4 },
  roleBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm },
  tag: { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, color: colors.gray700, fontWeight: '500' },
  title: { fontSize: 16, fontWeight: '700', color: colors.black, marginBottom: 4, lineHeight: 22 },
  description: { fontSize: 14, color: colors.gray700, lineHeight: 20, marginBottom: spacing.sm },
  mediaContainer: { position: 'relative', marginBottom: spacing.sm, borderRadius: radius.md, overflow: 'hidden' },
  media: { width: '100%', height: 280, backgroundColor: colors.gray100 },
  mediaCount: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  mediaCountText: { fontSize: 11, fontWeight: '700', color: colors.white },
  codeContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    backgroundColor: '#2D2D2D',
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  codeLanguage: { fontSize: 11, fontWeight: '600', color: colors.gray300, textTransform: 'uppercase' },
  codeSnippet: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#D4D4D4',
    padding: spacing.sm,
    lineHeight: 18,
  },
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
