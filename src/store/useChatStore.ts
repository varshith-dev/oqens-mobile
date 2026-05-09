import { create } from 'zustand'
import { messagesApi } from '../api/messages'

export interface Thread {
  id: string
  participant: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
    is_online: boolean
  }
  last_message: string
  last_message_at: string
  unread_count: number
}

export interface Message {
  id: string
  thread_id: string
  sender_id: string
  content: string
  created_at: string
}

interface ChatStore {
  threads: Thread[]
  messages: Record<string, Message[]>
  isLoadingThreads: boolean
  fetchThreads: () => Promise<void>
  fetchMessages: (threadId: string) => Promise<void>
  sendMessage: (threadId: string, content: string) => Promise<void>
}

export const useChatStore = create<ChatStore>((set, get) => ({
  threads: [],
  messages: {},
  isLoadingThreads: false,

  fetchThreads: async () => {
    set({ isLoadingThreads: true })
    try {
      const res = await messagesApi.getThreads()
      set({ threads: res.data.threads ?? res.data ?? [] })
    } finally {
      set({ isLoadingThreads: false })
    }
  },

  fetchMessages: async (threadId) => {
    const res = await messagesApi.getMessages(threadId)
    const msgs = res.data.messages ?? res.data ?? []
    set(state => ({ messages: { ...state.messages, [threadId]: msgs } }))
  },

  sendMessage: async (threadId, content) => {
    const res = await messagesApi.sendMessage(threadId, content)
    const msg: Message = res.data.message ?? res.data
    set(state => ({
      messages: {
        ...state.messages,
        [threadId]: [...(state.messages[threadId] ?? []), msg],
      },
    }))
  },
}))
