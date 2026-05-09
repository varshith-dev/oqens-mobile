import React, { useState } from 'react'
import {
  ScrollView, Share, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as Haptics from 'expo-haptics'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { BottomSheet } from '../shared/BottomSheet'
import { useToast } from '../../hooks/useToast'
import { useFeedStore, Post } from '../../store/useFeedStore'
import { useAuthStore } from '../../store/useAuthStore'
import { postsApi } from '../../api/posts'
import { colors, fonts, fontSize, spacing, radius, shadow } from '../../theme'
import { formatTimeAgo, formatCount } from '../../utils/format'

interface Props {
  post: Post
  onDeleted?: () => void
}

export function PostCard({ post, onDeleted }: Props) {
  const router = useRouter()
  const toast = useToast()
  const toggleLike = useFeedStore(s => s.toggleLike)
  const toggleBookmark = useFeedStore(s => s.toggleBookmark)
  const currentUser = useAuthStore(s => s.user)
  const [expanded, setExpanded] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)

  const isOwn = currentUser?.id === post.user_id
  const bodyTruncated = post.content.length > 200 && !expanded

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    toggleLike(post.id)
  }

  const handleShare = async () => {
    await Share.share({ url: `https://oqens.app/posts/${post.id}`, message: post.content })
  }

  const handleDelete = async () => {
    try {
      await postsApi.deletePost(post.id)
      toast.show('Post deleted', 'success')
      onDeleted?.()
    } catch {
      toast.show('Failed to delete', 'error')
    }
  }

  const menuActions = [
    { label: 'Copy Link', onPress: () => toast.show('Link copied', 'success') },
    { label: 'Report Post', onPress: () => toast.show('Reported', 'info') },
    { label: 'Hide Post', onPress: () => toast.show('Post hidden', 'neutral') },
    ...(isOwn ? [
      { label: 'Delete Post', onPress: handleDelete, destructive: true },
    ] : []),
  ]

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push(`/users/${post.author.username}`)}
          accessibilityLabel={`View ${post.author.display_name}'s profile`}
        >
          <Avatar uri={post.author.avatar_url} name={post.author.display_name} size="md" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.authorInfo}
          onPress={() => router.push(`/users/${post.author.username}`)}
          accessibilityLabel={`View ${post.author.display_name}'s profile`}
        >
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{post.author.display_name}</Text>
            {post.author.is_verified && (
              <Feather name="check-circle" size={14} color={colors.accent} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.handle}>@{post.author.username} · {formatTimeAgo(post.created_at)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuBtn}
          accessibilityLabel="Post options"
        >
          <Feather name="more-horizontal" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      {post.title && (
        <TouchableOpacity onPress={() => router.push(`/posts/${post.id}`)} accessibilityLabel="View post">
          <Text style={styles.title}>{post.title}</Text>
        </TouchableOpacity>
      )}

      {/* Body */}
      <TouchableOpacity onPress={() => router.push(`/posts/${post.id}`)} accessibilityLabel="View post">
        <Text style={styles.body} numberOfLines={bodyTruncated ? 4 : undefined}>
          {post.content}
        </Text>
        {bodyTruncated && (
          <TouchableOpacity onPress={() => setExpanded(true)} accessibilityLabel="Read more">
            <Text style={styles.readMore}>Read more</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Media */}
      {post.type === 'media' && post.media_url && post.media_type === 'image' && (
        <Image
          source={{ uri: post.media_url }}
          style={styles.image}
          contentFit="cover"
          placeholder={{ color: colors.surface }}
          accessibilityLabel="Post image"
        />
      )}

      {post.type === 'code' && (
        <View style={styles.codeBlock}>
          {post.language && <Text style={styles.codeLang}>{post.language}</Text>}
          <Text style={styles.codeText} numberOfLines={8}>{post.content}</Text>
        </View>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow}>
          {post.tags.map(tag => (
            <TouchableOpacity
              key={tag}
              onPress={() => router.push(`/tags/${tag}`)}
              style={styles.tagBtn}
              accessibilityLabel={`View #${tag} feed`}
            >
              <Badge label={`#${tag}`} variant="accent" size="sm" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleLike}
          style={styles.actionBtn}
          accessibilityLabel={post.is_liked ? 'Unlike post' : 'Like post'}
        >
          <Feather
            name="heart"
            size={18}
            color={post.is_liked ? colors.like : colors.textMuted}
          />
          <Text style={[styles.actionCount, post.is_liked && { color: colors.like }]}>
            {formatCount(post.likes_count)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/posts/${post.id}`)}
          style={styles.actionBtn}
          accessibilityLabel="View comments"
        >
          <Feather name="message-circle" size={18} color={colors.textMuted} />
          <Text style={styles.actionCount}>{formatCount(post.comments_count)}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={styles.actionBtn} accessibilityLabel="Share post">
          <Feather name="share-2" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleBookmark(post.id) }}
          style={[styles.actionBtn, { marginLeft: 'auto' }]}
          accessibilityLabel={post.is_bookmarked ? 'Remove bookmark' : 'Bookmark post'}
        >
          <Feather
            name="bookmark"
            size={18}
            color={post.is_bookmarked ? colors.accent : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <BottomSheet visible={menuVisible} onClose={() => setMenuVisible(false)} actions={menuActions} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  authorInfo: { flex: 1, marginLeft: spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  displayName: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.textPrimary },
  handle: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 1 },
  menuBtn: { padding: spacing.xs, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontFamily: fonts.semibold, fontSize: fontSize.md,
    color: colors.textPrimary, marginBottom: spacing.xs,
  },
  body: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textPrimary, lineHeight: 22 },
  readMore: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.accent, marginTop: spacing.xs },
  image: {
    width: '100%', aspectRatio: 16 / 9,
    borderRadius: radius.md, marginTop: spacing.sm,
    backgroundColor: colors.surface,
  },
  codeBlock: {
    backgroundColor: colors.codeBg, borderRadius: radius.md,
    padding: spacing.md, marginTop: spacing.sm,
  },
  codeLang: {
    fontFamily: fonts.medium, fontSize: fontSize.xs,
    color: colors.textMuted, marginBottom: spacing.xs, textTransform: 'uppercase',
  },
  codeText: { fontFamily: 'monospace', fontSize: fontSize.sm, color: '#CDD6F4' },
  tagsRow: { marginTop: spacing.sm },
  tagBtn: { marginRight: spacing.xs },
  actions: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.md, gap: spacing.base,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    minHeight: 44, minWidth: 44,
  },
  actionCount: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted },
})
