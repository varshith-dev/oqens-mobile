import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator, FlatList, KeyboardAvoidingView, Platform,
  ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '../../components/ui/Avatar'
import { PostCard } from '../../components/post/PostCard'
import { Skeleton } from '../../components/shared/Skeleton'
import { BottomSheet } from '../../components/shared/BottomSheet'
import { postsApi } from '../../api/posts'
import { useAuthStore } from '../../store/useAuthStore'
import { useToast } from '../../hooks/useToast'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'
import { formatTimeAgo } from '../../utils/format'
import { Post } from '../../store/useFeedStore'

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  author: { id: string; username: string; display_name: string; avatar_url?: string }
}

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const currentUser = useAuthStore(s => s.user)
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)
  const [menuComment, setMenuComment] = useState<Comment | null>(null)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => { loadPost() }, [postId])

  const loadPost = async () => {
    setLoading(true)
    try {
      const [postRes, commentsRes] = await Promise.all([
        postsApi.getPost(postId),
        postsApi.getComments(postId),
      ])
      setPost(postRes.data.post ?? postRes.data)
      setComments(commentsRes.data.comments ?? commentsRes.data ?? [])
    } catch {
      toast.show('Failed to load post', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSendComment = async () => {
    if (!commentText.trim()) return
    setSending(true)
    try {
      const res = await postsApi.addComment(postId, commentText.trim())
      const newComment = res.data.comment ?? res.data
      setComments(c => [...c, newComment])
      setCommentText('')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      toast.show('Failed to post comment', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await postsApi.deleteComment(postId, commentId)
      setComments(c => c.filter(x => x.id !== commentId))
    } catch {
      toast.show('Failed to delete', 'error')
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back" style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={{ padding: spacing.base, gap: spacing.sm }}>
          <Skeleton variant="rect" height={200} />
          <Skeleton variant="line" height={14} />
          <Skeleton variant="line" height={14} width="70%" />
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back" style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity
          onPress={() => post && Share.share({ url: `https://oqens.app/posts/${post.id}` })}
          style={styles.backBtn}
          accessibilityLabel="Share post"
        >
          <Feather name="share-2" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {post && <PostCard post={post} />}

        {/* Comments */}
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
        </View>

        {comments.map(comment => (
          <TouchableOpacity
            key={comment.id}
            style={styles.commentRow}
            onLongPress={() => setMenuComment(comment)}
            accessibilityLabel="Comment"
          >
            <Avatar uri={comment.author.avatar_url} name={comment.author.display_name} size="sm" />
            <View style={styles.commentBody}>
              <View style={styles.commentMeta}>
                <Text style={styles.commentName}>{comment.author.display_name}</Text>
                <Text style={styles.commentTime}>{formatTimeAgo(comment.created_at)}</Text>
              </View>
              <Text style={styles.commentText}>{comment.content}</Text>
              <TouchableOpacity
                onPress={() => { setCommentText(`@${comment.author.username} `); inputRef.current?.focus() }}
                accessibilityLabel="Reply to comment"
              >
                <Text style={styles.replyBtn}>Reply</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Comment input */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput
          ref={inputRef}
          style={styles.commentInput}
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Add a comment…"
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
          accessibilityLabel="Comment input"
        />
        <TouchableOpacity
          onPress={handleSendComment}
          disabled={!commentText.trim() || sending}
          accessibilityLabel="Send comment"
          style={[styles.sendBtn, (!commentText.trim() || sending) && { opacity: 0.4 }]}
        >
          {sending
            ? <ActivityIndicator size="small" color={colors.accent} />
            : <Feather name="send" size={20} color={colors.accent} />
          }
        </TouchableOpacity>
      </View>

      {menuComment && (
        <BottomSheet
          visible={!!menuComment}
          onClose={() => setMenuComment(null)}
          actions={[
            { label: 'Copy', onPress: () => toast.show('Copied', 'success') },
            { label: 'Reply', onPress: () => { setCommentText(`@${menuComment.author.username} `); inputRef.current?.focus() } },
            { label: 'Report', onPress: () => toast.show('Reported', 'info') },
            ...(currentUser?.id === menuComment.user_id
              ? [{ label: 'Delete', onPress: () => handleDeleteComment(menuComment.id), destructive: true }]
              : []),
          ]}
        />
      )}
    </KeyboardAvoidingView>
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
  commentsHeader: {
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  commentsTitle: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.textPrimary },
  commentRow: {
    flexDirection: 'row', padding: spacing.base,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm,
  },
  commentBody: { flex: 1 },
  commentMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  commentName: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textPrimary },
  commentTime: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary },
  commentText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textPrimary, lineHeight: 20 },
  replyBtn: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.accent, marginTop: spacing.xs },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: spacing.base, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  commentInput: {
    flex: 1, fontFamily: fonts.body, fontSize: fontSize.base,
    color: colors.textPrimary, maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendBtn: { padding: spacing.sm, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
})
