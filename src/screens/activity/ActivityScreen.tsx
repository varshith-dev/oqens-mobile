import React, { useEffect } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '../../components/ui/Avatar'
import { Skeleton } from '../../components/shared/Skeleton'
import { EmptyState } from '../../components/shared/EmptyState'
import { useNotifStore, Notification } from '../../store/useNotifStore'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'
import { formatTimeAgo } from '../../utils/format'

const ICON_MAP: Record<string, { name: keyof typeof Feather.glyphMap; color: string }> = {
  like:    { name: 'heart',      color: colors.like },
  comment: { name: 'message-circle', color: colors.accent },
  follow:  { name: 'user-plus',  color: colors.success },
  mention: { name: 'at-sign',    color: colors.warning },
  system:  { name: 'bell',       color: colors.textMuted },
}

function NotifRow({ notif, onPress }: { notif: Notification; onPress: () => void }) {
  const icon = ICON_MAP[notif.type] ?? ICON_MAP.system
  const desc =
    notif.type === 'like'    ? `liked your post` :
    notif.type === 'comment' ? `commented: "${notif.comment_preview}"` :
    notif.type === 'follow'  ? `started following you` :
    notif.type === 'mention' ? `mentioned you in a post` :
    `sent you a notification`

  return (
    <TouchableOpacity
      style={[styles.row, !notif.is_read && styles.unread]}
      onPress={onPress}
      accessibilityLabel={`${notif.actor.display_name} ${desc}`}
    >
      <View style={styles.avatarWrap}>
        <Avatar uri={notif.actor.avatar_url} name={notif.actor.display_name} size="md" />
        <View style={[styles.iconBadge, { backgroundColor: icon.color }]}>
          <Feather name={icon.name} size={9} color="#fff" />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.desc} numberOfLines={2}>
          <Text style={styles.name}>{notif.actor.display_name}</Text>
          {' '}{desc}
        </Text>
        <Text style={styles.time}>{formatTimeAgo(notif.created_at)}</Text>
      </View>
    </TouchableOpacity>
  )
}

function SkeletonRow() {
  return (
    <View style={[styles.row, { gap: spacing.md }]}>
      <Skeleton variant="circle" width={40} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Skeleton variant="line" width="70%" height={13} />
        <Skeleton variant="line" width="30%" height={11} />
      </View>
    </View>
  )
}

export default function ActivityScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { notifications, unreadCount, isLoading, fetchNotifications, markAllRead } = useNotifStore()

  useEffect(() => {
    fetchNotifications()
    return () => { markAllRead() }
  }, [])

  const handlePress = (notif: Notification) => {
    if (notif.type === 'like' || notif.type === 'comment' || notif.type === 'mention') {
      if (notif.post_id) router.push(`/posts/${notif.post_id}`)
    } else if (notif.type === 'follow') {
      router.push(`/users/${notif.actor.username}`)
    }
  }

  const today = notifications.filter(n => {
    const d = new Date(n.created_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })
  const earlier = notifications.filter(n => {
    const d = new Date(n.created_at)
    const now = new Date()
    return d.toDateString() !== now.toDateString()
  })

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} accessibilityLabel="Mark all as read">
            <Text style={styles.markRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading && notifications.length === 0 ? (
        <View style={{ gap: 1 }}>
          {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
        </View>
      ) : (
        <FlatList
          data={[
            ...(today.length ? [{ type: 'header', label: 'Today' }] : []),
            ...today.map(n => ({ type: 'notif', data: n })),
            ...(earlier.length ? [{ type: 'header', label: 'Earlier' }] : []),
            ...earlier.map(n => ({ type: 'notif', data: n })),
          ]}
          keyExtractor={(item: any, i) => item.data?.id ?? `header-${i}`}
          renderItem={({ item }: any) =>
            item.type === 'header'
              ? <Text style={styles.sectionHeader}>{item.label}</Text>
              : <NotifRow notif={item.data} onPress={() => handlePress(item.data)} />
          }
          ListEmptyComponent={
            <EmptyState icon="bell" title="All quiet here" subtitle="Activity from your posts and followers appears here." />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.textPrimary },
  markRead: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.accent },
  sectionHeader: {
    fontFamily: fonts.medium, fontSize: fontSize.xs,
    color: colors.textMuted, backgroundColor: colors.surface,
    paddingHorizontal: spacing.base, paddingVertical: spacing.xs,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  unread: { backgroundColor: colors.accentSoft },
  avatarWrap: { position: 'relative' },
  iconBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.bg,
  },
  content: { flex: 1 },
  desc: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textPrimary, lineHeight: 20 },
  name: { fontFamily: fonts.medium },
  time: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
})
