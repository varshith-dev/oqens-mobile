import { create } from 'zustand'
import { notificationsApi } from '../api/notifications'

export interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system'
  actor: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
  post_id?: string
  comment_preview?: string
  is_read: boolean
  created_at: string
}

interface NotifStore {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  fetchNotifications: () => Promise<void>
  markAllRead: () => Promise<void>
  incrementUnread: () => void
  resetUnread: () => void
}

export const useNotifStore = create<NotifStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true })
    try {
      const res = await notificationsApi.getAll()
      const notifications: Notification[] = res.data.notifications ?? res.data ?? []
      const unreadCount = notifications.filter(n => !n.is_read).length
      set({ notifications, unreadCount })
    } finally {
      set({ isLoading: false })
    }
  },

  markAllRead: async () => {
    await notificationsApi.markAllRead()
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0,
    }))
  },

  incrementUnread: () => set(state => ({ unreadCount: state.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
}))
