import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dimensions, FlatList, Share, StyleSheet, Text, TouchableOpacity, View, ViewToken,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { Video, ResizeMode } from 'expo-av'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '../../components/ui/Avatar'
import { flicksApi } from '../../api/flicks'
import { postsApi } from '../../api/posts'
import { colors, fonts, fontSize, spacing } from '../../theme'
import { formatCount } from '../../utils/format'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

function FlickItem({ item, isActive, muted }: { item: any; isActive: boolean; muted: boolean }) {
  const router = useRouter()
  const videoRef = useRef<Video>(null)
  const [playing, setPlaying] = useState(false)
  const [liked, setLiked] = useState(item.is_liked ?? false)
  const [likeCount, setLikeCount] = useState(item.likes_count ?? 0)
  const lastTap = useRef(0)

  useEffect(() => {
    if (isActive) {
      videoRef.current?.playAsync()
      setPlaying(true)
    } else {
      videoRef.current?.pauseAsync()
      setPlaying(false)
    }
  }, [isActive])

  const handleTap = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      // double tap — like
      handleLike()
    } else {
      // single tap — play/pause
      if (playing) { videoRef.current?.pauseAsync(); setPlaying(false) }
      else { videoRef.current?.playAsync(); setPlaying(true) }
    }
    lastTap.current = now
  }

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const next = !liked
    setLiked(next)
    setLikeCount((c: number) => c + (next ? 1 : -1))
    if (next) postsApi.likePost(item.id).catch(() => { setLiked(false); setLikeCount((c: number) => c - 1) })
    else postsApi.unlikePost(item.id).catch(() => { setLiked(true); setLikeCount((c: number) => c + 1) })
  }

  return (
    <View style={styles.flickItem}>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleTap} activeOpacity={1} accessibilityLabel="Toggle play">
        {item.media_url ? (
          <Video
            ref={videoRef}
            source={{ uri: item.media_url }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            isLooping
            isMuted={muted}
            shouldPlay={isActive}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.codeBg }]} />
        )}
      </TouchableOpacity>

      {/* Gradient overlay */}
      <View style={styles.gradient} pointerEvents="none" />

      {/* Bottom left */}
      <View style={styles.bottomLeft}>
        <TouchableOpacity
          style={styles.authorRow}
          onPress={() => router.push(`/users/${item.author?.username}`)}
          accessibilityLabel={`View ${item.author?.display_name}'s profile`}
        >
          <Avatar uri={item.author?.avatar_url} name={item.author?.display_name} size="sm" />
          <Text style={styles.authorName}>@{item.author?.username}</Text>
        </TouchableOpacity>
        <Text style={styles.caption} numberOfLines={2}>{item.content}</Text>
      </View>

      {/* Right actions */}
      <View style={styles.rightActions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn} accessibilityLabel={liked ? 'Unlike' : 'Like'}>
          <Feather name="heart" size={26} color={liked ? colors.like : '#fff'} />
          <Text style={styles.actionCount}>{formatCount(likeCount)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/posts/${item.id}`)}
          style={styles.actionBtn}
          accessibilityLabel="View comments"
        >
          <Feather name="message-circle" size={26} color="#fff" />
          <Text style={styles.actionCount}>{formatCount(item.comments_count ?? 0)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Share.share({ url: `https://oqens.app/posts/${item.id}` })}
          style={styles.actionBtn}
          accessibilityLabel="Share"
        >
          <Feather name="share-2" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function FlicksScreen() {
  const insets = useSafeAreaInsets()
  const [flicks, setFlicks] = useState<any[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [muted, setMuted] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await flicksApi.getFeed(1)
      setFlicks(res.data.posts ?? res.data ?? [])
    } catch { /* non-critical */ }
  }

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0)
  }, [])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={[styles.muteBtn, { top: insets.top + spacing.sm }]}
        onPress={() => setMuted(m => !m)}
        accessibilityLabel={muted ? 'Unmute' : 'Mute'}
      >
        <Feather name={muted ? 'volume-x' : 'volume-2'} size={22} color="#fff" />
      </TouchableOpacity>

      <FlatList
        data={flicks}
        keyExtractor={f => f.id}
        renderItem={({ item, index }) => (
          <FlickItem item={item} isActive={index === activeIndex} muted={muted} />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        getItemLayout={(_, index) => ({ length: SCREEN_HEIGHT, offset: SCREEN_HEIGHT * index, index })}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  flickItem: { height: SCREEN_HEIGHT, width: '100%' },
  gradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 300,
    backgroundColor: 'transparent',
  },
  bottomLeft: {
    position: 'absolute', bottom: 80, left: spacing.base, right: 80,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  authorName: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: '#fff' },
  caption: { fontFamily: fonts.body, fontSize: fontSize.sm, color: '#fff', lineHeight: 20 },
  rightActions: {
    position: 'absolute', bottom: 80, right: spacing.base,
    alignItems: 'center', gap: spacing.xl,
  },
  actionBtn: { alignItems: 'center', gap: spacing.xs, minWidth: 44, minHeight: 44, justifyContent: 'center' },
  actionCount: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: '#fff' },
  muteBtn: {
    position: 'absolute', right: spacing.base, zIndex: 10,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
})
