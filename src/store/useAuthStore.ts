import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { OneSignal } from 'react-native-onesignal'
import { authApi } from '../api/auth'
import { SECURE_STORE_TOKEN_KEY, SECURE_STORE_USER_KEY } from '../utils/constants'

export interface User {
  id: string
  username: string
  display_name: string
  email: string
  avatar_url?: string
  cover_url?: string
  bio?: string
  website?: string
  is_verified: boolean
  followers_count: number
  following_count: number
  posts_count: number
}

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { display_name: string; username: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  updateUser: (partial: Partial<User>) => void
  refreshUser: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY)
      const userStr = await SecureStore.getItemAsync(SECURE_STORE_USER_KEY)
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr) })
      }
    } catch {
      // ignore
    } finally {
      set({ isInitialized: true })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await authApi.login({ email, password })
      const token = res.data.session.accessToken
      await SecureStore.setItemAsync(SECURE_STORE_TOKEN_KEY, token)
      set({ token })
      await get().refreshUser()
      // Tell OneSignal which user this device belongs to
      if (get().user?.id) {
        OneSignal.login(get().user!.id)
      }
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (data) => {
    set({ isLoading: true })
    try {
      await authApi.register(data)
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    OneSignal.logout()
    await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY)
    await SecureStore.deleteItemAsync(SECURE_STORE_USER_KEY)
    set({ user: null, token: null })
  },

  updateUser: (partial) => {
    const updated = { ...get().user!, ...partial }
    set({ user: updated })
    SecureStore.setItemAsync(SECURE_STORE_USER_KEY, JSON.stringify(updated))
  },

  refreshUser: async () => {
    try {
      const res = await authApi.me()
      const user = res.data.user ?? res.data
      await SecureStore.setItemAsync(SECURE_STORE_USER_KEY, JSON.stringify(user))
      set({ user })
    } catch {
      // token invalid — logout
      await get().logout()
    }
  },
}))
