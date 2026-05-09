import React, { useEffect } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '../../components/ui/Avatar'
import { Skeleton } from '../../components/shared/Skeleton'
import { EmptyState } from '../../components/shared/EmptyState'
import { useChatStore } from '../../store/useChatStore'
import { colors, fonts, fontSize, spacing } from '../../theme'
import { formatTimeAgo, truncate } from '../../utils/format'

export default function InboxScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { threads, isLoadingThreads, fetchThreads } = useChatStore()

  useEffect(() => { fetchThreads() }, [])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity
          onPress={() => router.push('/messages/new')}
          style={styles.composeBtn}
          accessibilityLabel="New message"
        >
          <Feather name="edit" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {isLoadingThreads && threads.length === 0 ? (
        <View style={{ gap: 1 }}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={[styles.row, { gap: spacing.md }]}>
              <Skeleton variant="circle" width={44} />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Skeleton variant="line" width="50%" height={14} />
                <Skeleton variant="line" width="70%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={threads}
          keyExtractor={t => t.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push({ pathname: '/messages/[threadId]', params: { threadId: item.id } })}
              accessibilityLabel={`Chat with ${item.participant.display_name}`}
            >
              <Avatar uri={item.participant.avatar_url} name={item.participant.display_name} size="md" online={item.participant.is_online} />
              <View style={styles.info}>
                <View style={styles.topRow}>
                  <Text style={[styles.name, item.unread_count > 0 && styles.nameBold]}>
                    {item.participant.display_name}
                  </Text>
                  <Text style={styles.time}>{formatTimeAgo(item.last_message_at)}</Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={[styles.preview, item.unread_count > 0 && styles.previewBold]} numberOfLines={1}>
                    {truncate(item.last_message, 50)}
                  </Text>
                  {item.unread_count > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.unread_count}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState icon="message-circle" title="No messages yet" subtitle="Start a conversation with someone." />
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
  composeBtn: { padding: spacing.xs, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  info: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textPrimary },
  nameBold: { fontFamily: fonts.medium },
  time: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  preview: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
  previewBold: { fontFamily: fonts.medium, color: colors.textPrimary },
  badge: {
    backgroundColor: colors.accent, borderRadius: 10,
    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: '#fff' },
})
