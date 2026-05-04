import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { rpcQuery } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { colors, spacing, radius } from '../../lib/theme'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const ICONS: Record<string, { name: any; color: string }> = {
  like: { name: 'heart', color: '#FF3B30' },
  comment: { name: 'chatbubble', color: colors.primary },
  follow: { name: 'person-add', color: colors.success },
  mention: { name: 'at', color: colors.warning },
}

export default function NotificationsScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  async function fetchNotifications() {
    try {
      const res = await rpcQuery({
        table: 'notifications',
        action: 'select',
        select: 'id, type, message, is_read, created_at, post_id, actor_id, profile:profiles!notifications_actor_id_fkey(username, display_name, profile_picture_url)',
        filters: [{ type: 'eq', col: 'user_id', val: user!.id }],
        order: { col: 'created_at', ascending: false },
        limit: 50,
      })
      setNotifications(res.data || [])

      // Mark all as read
      await rpcQuery({
        table: 'notifications',
        action: 'update',
        data: { is_read: true },
        filters: [
          { type: 'eq', col: 'user_id', val: user!.id },
          { type: 'eq', col: 'is_read', val: false },
        ],
      })
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const icon = ICONS[item.type] || { name: 'notifications', color: colors.primary }
            const ago = timeAgo(item.created_at)
            const profile = item.profile

            return (
              <TouchableOpacity
                style={[styles.row, !item.is_read && styles.rowUnread]}
                onPress={() => item.post_id && router.push(`/post/${item.post_id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarWrap}>
                  {profile?.profile_picture_url ? (
                    <Image source={{ uri: profile.profile_picture_url }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={styles.avatarLetter}>
                        {(profile?.display_name || profile?.username || '?')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.iconBadge, { backgroundColor: icon.color }]}>
                    <Ionicons name={icon.name} size={10} color={colors.white} />
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.notifText}>
                    <Text style={styles.notifName}>{profile?.display_name || profile?.username || 'Someone'} </Text>
                    {item.message}
                  </Text>
                  <Text style={styles.timeText}>{ago}</Text>
                </View>

                {!item.is_read && <View style={styles.dot} />}
              </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="notifications-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.black },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  emptyText: { color: colors.gray500, fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  rowUnread: { backgroundColor: '#F8F7FF' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: colors.primary },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  notifText: { fontSize: 14, color: colors.gray700, lineHeight: 20 },
  notifName: { fontWeight: '700', color: colors.black },
  timeText: { fontSize: 12, color: colors.gray500, marginTop: 3 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
})
