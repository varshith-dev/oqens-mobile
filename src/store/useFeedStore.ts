import { create } from 'zustand'
import { postsApi } from '../api/posts'

export interface Post {
  id: string
  user_id: string
  type: 'media' | 'article' | 'code' | 'flick'
  title?: string
  content: string
  media_url?: string
  media_type?: 'image' | 'video'
  language?: string
  tags: string[]
  likes_count: number
  comments_count: number
  is_liked: boolean
  is_bookmarked: boolean
  created_at: string
  author: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
    is_verified: boolean
  }
}

type FeedTab = 'for_you' | 'following' | 'popular'

interface FeedStore {
  posts: Post[]
  page: number
  hasMore: boolean
  isLoading: boolean
  isRefreshing: boolean
  activeTab: FeedTab
  fetchFeed: () => Promise<void>
  refreshFeed: () => Promise<void>
  loadMore: () => Promise<void>
  toggleLike: (postId: string) => void
  toggleBookmark: (postId: string) => void
  setActiveTab: (tab: FeedTab) => void
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  posts: [],
  page: 1,
  hasMore: true,
  isLoading: false,
  isRefreshing: false,
  activeTab: 'for_you',

  fetchFeed: async () => {
    if (get().isLoading) return
    set({ isLoading: true, posts: [], page: 1, hasMore: true })
    try {
      const res = await postsApi.getFeed(get().activeTab, 1)
      const posts = res.data.posts ?? res.data ?? []
      set({ posts, page: 1, hasMore: posts.length === 20 })
    } catch {
      set({ posts: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  refreshFeed: async () => {
    set({ isRefreshing: true })
    try {
      const res = await postsApi.getFeed(get().activeTab, 1)
      const posts = res.data.posts ?? res.data ?? []
      set({ posts, page: 1, hasMore: posts.length === 20 })
    } finally {
      set({ isRefreshing: false })
    }
  },

  loadMore: async () => {
    const { isLoading, hasMore, page, posts, activeTab } = get()
    if (isLoading || !hasMore) return
    set({ isLoading: true })
    try {
      const nextPage = page + 1
      const res = await postsApi.getFeed(activeTab, nextPage)
      const newPosts = res.data.posts ?? res.data ?? []
      set({ posts: [...posts, ...newPosts], page: nextPage, hasMore: newPosts.length === 20 })
    } finally {
      set({ isLoading: false })
    }
  },

  toggleLike: (postId) => {
    const posts = get().posts.map(p => {
      if (p.id !== postId) return p
      const liked = !p.is_liked
      // fire and forget — revert on error handled in component
      if (liked) postsApi.likePost(postId).catch(() => get().toggleLike(postId))
      else postsApi.unlikePost(postId).catch(() => get().toggleLike(postId))
      return { ...p, is_liked: liked, likes_count: p.likes_count + (liked ? 1 : -1) }
    })
    set({ posts })
  },

  toggleBookmark: (postId) => {
    const posts = get().posts.map(p => {
      if (p.id !== postId) return p
      const bookmarked = !p.is_bookmarked
      if (bookmarked) postsApi.bookmarkPost(postId).catch(() => get().toggleBookmark(postId))
      else postsApi.unbookmarkPost(postId).catch(() => get().toggleBookmark(postId))
      return { ...p, is_bookmarked: bookmarked }
    })
    set({ posts })
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab })
    get().fetchFeed()
  },
}))
