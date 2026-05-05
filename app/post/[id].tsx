import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Image, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Linking
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { rpcQuery, rpcFunction } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { colors, spacing, radius } from '../../lib/theme'

function timeAgo(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `${weeks}w ago`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`
    return `${Math.floor(months / 12)}y ago`
  } catch { return '' }
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [userLiked, setUserLiked] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPost()
  }, [id])

  async function loadPost() {
    try {
      const [postRes, commentsRes] = await Promise.all([
        rpcQuery({
          table: 'posts', action: 'select',
          select: 'id, user_id, title, description, content_url, code_snippet, type, created_at, profile:profiles!posts_user_id_fkey(id, username, display_name, profile_picture_url, is_verified), post_tags(tags(id, name, slug))',
          filters: [{ type: 'eq', col: 'id', val: id }],
          limit: 1,
        }),
        rpcQuery({
          table: 'comments', action: 'select',
          select: 'id, content, created_at, profile:profiles!comments_user_id_fkey(id, username, display_name, profile_picture_url, is_verified)',
          filters: [{ type: 'eq', col: 'post_id', val: id }],
          order: { col: 'created_at', ascending: true },
        }),
      ])
      // single: true throws 400 — use limit:1 and take first row
      const postData = Array.isArray(postRes.data) ? postRes.data[0] : postRes.data
      setPost(postData)
      setComments(commentsRes.data || [])

      // Counts
      const countsRes = await rpcFunction('get_posts_counts', { post_ids: [id] })
      const row = countsRes.data?.[0]
      if (row) {
        setLikeCount(parseInt(row.like_count) || 0)
        setCommentCount(parseInt(row.comment_count) || 0)
      }

      // User liked? — use limit:1 instead of maybeSingle
      if (user) {
        const likeRes = await rpcQuery({
          table: 'likes', action: 'select', select: 'id',
          filters: [
            { type: 'eq', col: 'post_id', val: id },
            { type: 'eq', col: 'user_id', val: user.id },
          ],
          limit: 1,
        })
        const likeData = Array.isArray(likeRes.data) ? likeRes.data[0] : likeRes.data
        setUserLiked(!!likeData)
      }
    } catch (e) {
      console.error('Post load error:', e)
    }
    finally { setLoading(false) }
  }

  async function handleLike() {
    if (!user) return router.push('/(auth)/login')
    const prev = userLiked
    setUserLiked(!prev)
    setLikeCount(c => c + (prev ? -1 : 1))
    try {
      if (prev) {
        await rpcQuery({
          table: 'likes', action: 'delete',
          filters: [
            { type: 'eq', col: 'user_id', val: user.id },
            { type: 'eq', col: 'post_id', val: id },
          ],
        })
      } else {
        await rpcQuery({
          table: 'likes', action: 'upsert',
          data: { post_id: id, user_id: user.id, emoji: '❤️' },
          onConflict: 'user_id,post_id',
        })
      }
    } catch {
      setUserLiked(prev)
      setLikeCount(c => c + (prev ? 1 : -1))
    }
  }

  async function handleComment() {
    if (!user) return router.push('/(auth)/login')
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const res = await rpcQuery({
        table: 'comments', action: 'insert',
        data: { post_id: id, user_id: user.id, content: commentText.trim() },
      })
      if (res.data) {
        const newComment = Array.isArray(res.data) ? res.data[0] : res.data
        // Attach profile
        newComment.profile = {
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          profile_picture_url: user.profile_picture_url,
          is_verified: user.is_verified,
        }
        setComments(prev => [...prev, newComment])
        setCommentCount(c => c + 1)
        setCommentText('')
      }
    } catch (e: any) {
      Alert.alert('Error', 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    )
  }

  const tags = post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || []
  const ago = timeAgo(post.created_at)

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Author */}
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
                {(post.profile?.display_name || '?')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.displayName}>{post.profile?.display_name}</Text>
              {post.profile?.is_verified && (
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
              )}
            </View>
            <Text style={styles.username}>@{post.profile?.username} · {ago}</Text>
          </View>
        </TouchableOpacity>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tags}>
            {tags.map((tag: any) => (
              <View key={tag.id} style={styles.tag}>
                <Text style={styles.tagText}>#{tag.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Content */}
        {post.title && <Text style={styles.title}>{post.title}</Text>}
        {post.description && <Text style={styles.description}>{post.description}</Text>}

        {/* Media images */}
        {post.content_url && post.type === 'meme' && (
          <View style={styles.mediaContainer}>
            {post.content_url.split(',').filter(Boolean).map((url: string, i: number) => (
              <Image key={i} source={{ uri: url.trim() }} style={styles.mediaImage} resizeMode="contain" />
            ))}
          </View>
        )}

        {/* Link */}
        {post.content_url && post.type === 'link' && (
          <TouchableOpacity
            style={styles.linkBox}
            onPress={() => Linking.openURL(post.content_url)}
            activeOpacity={0.8}
          >
            <Ionicons name="link-outline" size={16} color="#3B82F6" />
            <Text style={styles.linkText} numberOfLines={2}>{post.content_url}</Text>
            <Ionicons name="open-outline" size={14} color={colors.gray500} />
          </TouchableOpacity>
        )}

        {/* Code */}
        {post.code_snippet && (
          <View style={styles.codeBox}>
            {post.code_language && (
              <View style={styles.codeHeader}>
                <Ionicons name="code-slash" size={13} color="#9CA3AF" />
                <Text style={styles.codeHeaderText}>{post.code_language}</Text>
              </View>
            )}
            <Text style={styles.codeText}>{post.code_snippet}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.action} onPress={handleLike} activeOpacity={0.7}>
            <Ionicons name={userLiked ? 'heart' : 'heart-outline'} size={22} color={userLiked ? colors.danger : colors.gray500} />
            <Text style={[styles.actionCount, userLiked && { color: colors.danger }]}>{likeCount}</Text>
          </TouchableOpacity>
          <View style={styles.action}>
            <Ionicons name="chatbubble-outline" size={21} color={colors.gray500} />
            <Text style={styles.actionCount}>{commentCount}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />
        <Text style={styles.commentsTitle}>Comments</Text>

        {/* Comments */}
        {comments.map(comment => (
          <View key={comment.id} style={styles.commentRow}>
            {comment.profile?.profile_picture_url ? (
              <Image source={{ uri: comment.profile.profile_picture_url }} style={styles.commentAvatar} />
            ) : (
              <View style={[styles.commentAvatar, styles.avatarFallback]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>
                  {(comment.profile?.display_name || '?')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.commentContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.commentName}>{comment.profile?.display_name}</Text>
                <Text style={styles.commentTime}>
                  · {timeAgo(comment.created_at)}
                </Text>
              </View>
              <Text style={styles.commentText}>{comment.content}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Comment input */}
      <View style={styles.commentInput}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor={colors.gray300}
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!commentText.trim() || submitting) && { opacity: 0.4 }]}
          onPress={handleComment}
          disabled={!commentText.trim() || submitting}
          activeOpacity={0.7}
        >
          {submitting
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Ionicons name="send" size={18} color={colors.white} />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.gray500, fontSize: 15 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: colors.primary },
  displayName: { fontSize: 15, fontWeight: '700', color: colors.black },
  username: { fontSize: 13, color: colors.gray500 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  tag: { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  title: { fontSize: 20, fontWeight: '800', color: colors.black, paddingHorizontal: spacing.md, marginBottom: spacing.sm, lineHeight: 28 },
  description: { fontSize: 15, color: colors.gray700, paddingHorizontal: spacing.md, lineHeight: 22, marginBottom: spacing.md },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    backgroundColor: '#EFF6FF',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  linkText: { flex: 1, fontSize: 13, color: '#1D4ED8' },
  codeBox: {
    marginHorizontal: spacing.md,
    backgroundColor: '#1E1E1E',
    borderRadius: radius.md,
    marginBottom: spacing.md,
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
  codeHeaderText: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase' },
  codeText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13, color: '#D4D4D4', padding: spacing.md, lineHeight: 20 },
  mediaContainer: { marginHorizontal: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  mediaImage: { width: '100%', height: 300, borderRadius: radius.md, backgroundColor: colors.gray100 },
  actions: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 14, color: colors.gray500, fontWeight: '600' },
  divider: { height: 8, backgroundColor: colors.gray100 },
  commentsTitle: { fontSize: 16, fontWeight: '700', color: colors.black, padding: spacing.md, paddingBottom: spacing.sm },
  commentRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  commentAvatar: { width: 36, height: 36, borderRadius: 18 },
  commentContent: { flex: 1 },
  commentName: { fontSize: 13, fontWeight: '700', color: colors.black },
  commentTime: { fontSize: 12, color: colors.gray500 },
  commentText: { fontSize: 14, color: colors.gray700, marginTop: 3, lineHeight: 20 },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.black,
    maxHeight: 80,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
