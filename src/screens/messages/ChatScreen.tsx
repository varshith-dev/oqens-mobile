import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator, FlatList, KeyboardAvoidingView, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '../../components/ui/Avatar'
import { BottomSheet } from '../../components/shared/BottomSheet'
import { useChatStore } from '../../store/useChatStore'
import { useAuthStore } from '../../store/useAuthStore'
import { messagesApi } from '../../api/messages'
import { useToast } from '../../hooks/useToast'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'
import { formatTimeAgo } from '../../utils/format'

export default function ChatScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const currentUser = useAuthStore(s => s.user)
  const { messages, fetchMessages, sendMessage } = useChatStore()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedMsg, setSelectedMsg] = useState<any>(null)
  const flatRef = useRef<FlatList>(null)
  const pollRef = useRef<ReturnType<typeof setInterval>>()

  const threadMessages = messages[threadId] ?? []

  useEffect(() => {
    fetchMessages(threadId)
    pollRef.current = setInterval(() => fetchMessages(threadId), 5000)
    return () => clearInterval(pollRef.current)
  }, [threadId])

  useEffect(() => {
    if (threadMessages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [threadMessages.length])

  const handleSend = async () => {
    if (!text.trim()) return
    setSending(true)
    try {
      await sendMessage(threadId, text.trim())
      setText('')
    } catch {
      toast.show('Failed to send', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (msgId: string) => {
    try {
      await messagesApi.deleteMessage(threadId, msgId)
      await fetchMessages(threadId)
    } catch {
      toast.show('Failed to delete', 'error')
    }
  }

  const isOwn = (msg: any) => msg.sender_id === currentUser?.id

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        ref={flatRef}
        data={threadMessages}
        keyExtractor={m => m.id}
        inverted={false}
        renderItem={({ item, index }) => {
          const own = isOwn(item)
          const showTime = index === threadMessages.length - 1 ||
            new Date(threadMessages[index + 1]?.created_at).getTime() - new Date(item.created_at).getTime() > 300000
          return (
            <View>
              <TouchableOpacity
                onLongPress={() => setSelectedMsg(item)}
                style={[styles.bubble, own ? styles.ownBubble : styles.otherBubble]}
                accessibilityLabel={`Message: ${item.content}`}
              >
                <Text style={[styles.bubbleText, own ? styles.ownText : styles.otherText]}>
                  {item.content}
                </Text>
              </TouchableOpacity>
              {showTime && (
                <Text style={[styles.timestamp, own ? { textAlign: 'right' } : { textAlign: 'left' }]}>
                  {formatTimeAgo(item.created_at)}
                </Text>
              )}
            </View>
          )
        }}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message…"
          placeholderTextColor={colors.textMuted}
          multiline
          accessibilityLabel="Message input"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || sending}
          style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.4 }]}
          accessibilityLabel="Send message"
        >
          {sending
            ? <ActivityIndicator size="small" color={colors.accent} />
            : <Feather name="send" size={20} color={colors.accent} />
          }
        </TouchableOpacity>
      </View>

      {selectedMsg && (
        <BottomSheet
          visible={!!selectedMsg}
          onClose={() => setSelectedMsg(null)}
          actions={[
            { label: 'Copy', onPress: () => toast.show('Copied', 'success') },
            ...(isOwn(selectedMsg) ? [{ label: 'Delete', onPress: () => handleDelete(selectedMsg.id), destructive: true }] : []),
          ]}
        />
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.sm, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.textPrimary },
  messageList: { padding: spacing.base, gap: spacing.sm },
  bubble: {
    maxWidth: '75%', borderRadius: 18, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginVertical: 2,
  },
  ownBubble: {
    alignSelf: 'flex-end', backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: 'flex-start', backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontFamily: fonts.body, fontSize: fontSize.base, lineHeight: 20 },
  ownText: { color: '#fff' },
  otherText: { color: colors.textPrimary },
  timestamp: {
    fontFamily: fonts.body, fontSize: fontSize.xs,
    color: colors.textMuted, marginHorizontal: spacing.base, marginBottom: spacing.sm,
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: spacing.base, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg,
  },
  input: {
    flex: 1, fontFamily: fonts.body, fontSize: fontSize.base,
    color: colors.textPrimary, maxHeight: 100, paddingVertical: spacing.sm,
  },
  sendBtn: { padding: spacing.sm, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
})
