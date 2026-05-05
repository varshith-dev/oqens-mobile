import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, ActivityIndicator, Image
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { rpcQuery, rpcFunction } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { colors, spacing } from '../../lib/theme'

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(url) ||
    url.includes('/video/') ||
    url.includes('video')
}

// Inline video player using WebView
function VideoPlayer({ uri, isActive }: { uri: string; isActive: boolean }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
        video { width: 100%; height: 100%; object-fit: cover; }
      </style>
    </head>
    <body>
      <video
        src="${uri}"
        ${isActive ? 'autoplay' : ''}
        loop
        playsinline
        webkit-playsinline
        controls
      ></video>
    </body>
    </html>
  `
  return (
    <WebView
      source={{ html }}
      style={styles.media}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      scrollEnabled={false}
      javaScriptEnabled
    />
  )
}

function FlickItem({
  item,
  isActive,
  likeCount,
  commentCount,
  userLiked,
  onLike,
}: {
  item: any
  isActive: boolean
  likeCount: number
  commentCount: number
  userLiked: boolean
  onLike: (id: string) => void
}) {
  const router = useRouter()
  const mediaUrls: string[] = item.content_url
    ? item.content_url.split(',').filter(Boolean)
    : []
  const videoUrl = mediaUrls.find(isVideoUrl)
  const imageUrl = !videoUrl ? mediaUrls[0] : null

  return (
    <View style={styles.flickItem}>
      {/* Media */}
      {videoUrl ? (
        <VideoPlayer uri={videoUrl} isActive={isActive} />
      ) : imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.media} resizeMode="cover" />
      ) : (
        <View style={[styles.media, styles.noMedia]}>
          <Ionicons name="play-circle-outline" size={72} color="rgba(255,255,255,0.2)" />
        </View>
      )}

      {/* Dark gradient overlay at bottom */}
      <View style={styles.gradientOverlay} />

      {/* Bottom info */}
      <View style={styles.bottomInfo}>
        <TouchableOpacity
          style={styles.authorRow}
          onPress={() => router.push(`/profile/${item.profile?.username}`)}
          activeOpacity={0.8}
        >
          {item.profile?.profile_picture_url ? (
            <Image source={{ uri: item.profile.profile_picture_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarLetter}>
                {(item.profile?.display_name || item.profile?.username || '?')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.authorName}>
                {item.profile?.display_name || item.profile?.username}
              </Text>
              {item.profile?.is_verified && (
                <Ionicons name="checkmark-circle" size={13} color="#3B82F6" />
              )}
            </View>
            <Text style={styles.timeText}>{timeAgo(item.created_at)}</Text>
          </View>
        </TouchableOpacity>

        {item.title ? (
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        ) : null}
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        ) : null}
      </View>

      {/* Right action buttons */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onLike(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={userLiked ? 'heart' : 'heart-outline'}
            size={30}
            color={userLiked ? '#EF4444' : colors.white}
          />
          <Text style={styles.actionCount}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push(`/post/${item.id}`)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={28} color={colors.white} />
          <Text style={styles.actionCount}>{commentCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-redo-outline" size={28} color={colors.white} />
          <Text style={styles.actionCount}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function FlicksScreen() {
  const { user } = useAuth()
  const [flicks, setFlicks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({})

  useEffect(() => { loadFlicks() }, [])
  useEffect(() => { if (user && flicks.length > 0) fetchUserLikes() }, [user, flicks.length])

  async function loadFlicks() {
    try {
      const res = await rpcQuery({
        table: 'posts',
        action: 'select',
        select: `id, user_id, title, description, content_url, type, created_at,
          profile:profiles!posts_user_id_fkey(id, username, display_name, profile_picture_url, is_verified)`,
        filters: [
          { type: 'eq', col: 'status', val: 'published' },
          { type: 'eq', col: 'visibility', val: 'public' },
          { type: 'eq', col: 'type', val: 'meme' },
        ],
        order: { col: 'created_at', ascending: false },
        limit: 30,
      })
      const data = res.data || []
      setFlicks(data)

      if (data.length > 0) {
        const ids = data.map((p: any) => p.id)
        const countsRes = await rpcFunction('get_posts_counts', { post_ids: ids })
        const lk: Record<string, number> = {}
        const cm: Record<string, number> = {}
        countsRes.data?.forEach((r: any) => {
          lk[r.post_id] = parseInt(r.like_count) || 0
          cm[r.post_id] = parseInt(r.comment_count) || 0
        })
        setLikeCounts(lk)
        setCommentCounts(cm)
      }
    } catch (e) {
      console.error('Flicks error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUserLikes() {
    if (!user) return
    try {
      const res = await rpcQuery({
        table: 'likes', action: 'select', select: 'post_id',
        filters: [{ type: 'eq', col: 'user_id', val: user.id }],
      })
      const map: Record<string, boolean> = {}
      res.data?.forEach((l: any) => { map[l.post_id] = true })
      setUserLikes(map)
    } catch {}
  }

  async function handleLike(postId: string) {
    if (!user) return
    const liked = userLikes[postId]
    setUserLikes(prev => ({ ...prev, [postId]: !liked }))
    setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (liked ? -1 : 1) }))
    try {
      if (liked) {
        await rpcQuery({
          table: 'likes', action: 'delete',
          filters: [
            { type: 'eq', col: 'user_id', val: user.id },
            { type: 'eq', col: 'post_id', val: postId },
          ],
        })
      } else {
        await rpcQuery({
          table: 'likes', action: 'upsert',
          data: { post_id: postId, user_id: user.id, emoji: '❤️' },
          onConflict: 'user_id,post_id',
        })
      }
    } catch {
      setUserLikes(prev => ({ ...prev, [postId]: liked }))
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (liked ? 1 : -1) }))
    }
  }

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0)
    }
  }, [])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    )
  }

  if (flicks.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer} edges={['top']}>
        <View style={styles.emptyHeader}>
          <Text style={styles.emptyHeaderTitle}>Flicks</Text>
        </View>
        <View style={styles.emptyBody}>
          <Ionicons name="play-circle-outline" size={64} color={colors.gray300} />
          <Text style={styles.emptyTitle}>No Flicks yet</Text>
          <Text style={styles.emptySubtitle}>Media posts will appear here</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={flicks}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <FlickItem
            item={item}
            isActive={index === activeIndex}
            likeCount={likeCounts[item.id] || 0}
            commentCount={commentCounts[item.id] || 0}
            userLiked={!!userLikes[item.id]}
            onLike={handleLike}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />

      {/* Header overlay */}
      <SafeAreaView style={styles.headerOverlay} edges={['top']} pointerEvents="none">
        <Text style={styles.headerTitle}>Flicks</Text>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, backgroundColor: colors.white },
  emptyHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emptyHeaderTitle: { fontSize: 20, fontWeight: '800', color: colors.black },
  emptyBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.gray700 },
  emptySubtitle: { fontSize: 13, color: colors.gray500 },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  flickItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  noMedia: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.45,
    // Simulated gradient using opacity layers
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 0,
    // We use a View with opacity trick below
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 90,
    left: spacing.md,
    right: 72,
    gap: 6,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarFallback: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 14, fontWeight: '700', color: colors.white },
  authorName: { fontSize: 14, fontWeight: '700', color: colors.white },
  timeText: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  title: { fontSize: 15, fontWeight: '700', color: colors.white },
  description: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  rightActions: {
    position: 'absolute',
    right: spacing.md,
    bottom: 100,
    alignItems: 'center',
    gap: spacing.lg,
  },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionCount: { fontSize: 12, fontWeight: '700', color: colors.white },
})
