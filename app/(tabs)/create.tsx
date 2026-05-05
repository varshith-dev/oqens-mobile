import { useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { rpcQuery } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { colors, spacing, radius } from '../../lib/theme'

const POST_TYPES = [
  { key: 'text', label: 'Text', icon: 'text' },
  { key: 'link', label: 'Link', icon: 'link' },
  { key: 'code', label: 'Code', icon: 'code-slash' },
]

export default function CreateScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [type, setType] = useState('text')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contentUrl, setContentUrl] = useState('')
  const [codeSnippet, setCodeSnippet] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('javascript')
  const [loading, setLoading] = useState(false)

  async function handlePost() {
    if (!user) return router.push('/(auth)/login')
    if (!title.trim() && !description.trim() && !codeSnippet.trim()) {
      Alert.alert('Error', 'Please add some content')
      return
    }
    setLoading(true)
    try {
      const payload: any = {
        user_id: user.id,
        type,
        title: title.trim() || null,
        description: description.trim() || null,
        status: 'published',
        visibility: 'public',
        is_pinned: false,
      }
      if (type === 'link') payload.content_url = contentUrl.trim()
      if (type === 'code') {
        payload.code_snippet = codeSnippet.trim()
        payload.code_language = codeLanguage
      }

      const res = await rpcQuery({ table: 'posts', action: 'insert', data: payload })
      if (res.data) {
        setTitle(''); setDescription(''); setContentUrl(''); setCodeSnippet('')
        router.push('/(tabs)')
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message || 'Failed to post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity
            style={[styles.postBtn, loading && { opacity: 0.6 }]}
            onPress={handlePost}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator size="small" color={colors.white} />
              : <Text style={styles.postBtnText}>Post</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          {/* Type selector */}
          <View style={styles.typeRow}>
            {POST_TYPES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.typeBtn, type === t.key && styles.typeBtnActive]}
                onPress={() => setType(t.key)}
                activeOpacity={0.7}
              >
                <Ionicons name={t.icon as any} size={16} color={type === t.key ? colors.primary : colors.gray500} />
                <Text style={[styles.typeBtnText, type === t.key && styles.typeBtnTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.titleInput}
              placeholder="Title (optional)"
              placeholderTextColor={colors.gray300}
              value={title}
              onChangeText={setTitle}
              maxLength={200}
            />

            <TextInput
              style={styles.bodyInput}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.gray300}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />

            {type === 'code' && (
              <>
                <View style={styles.extraField}>
                  <Ionicons name="code-slash-outline" size={18} color={colors.gray500} />
                  <TextInput
                    style={styles.extraInput}
                    placeholder="Language (e.g., javascript)"
                    placeholderTextColor={colors.gray300}
                    value={codeLanguage}
                    onChangeText={setCodeLanguage}
                    autoCapitalize="none"
                  />
                </View>
                <TextInput
                  style={[styles.bodyInput, styles.codeInput]}
                  placeholder="// Paste your code here..."
                  placeholderTextColor={colors.gray300}
                  value={codeSnippet}
                  onChangeText={setCodeSnippet}
                  multiline
                  textAlignVertical="top"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancel: { fontSize: 15, color: colors.gray700, fontWeight: '500' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.black },
  postBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  postBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  typeBtnTextActive: { color: colors.primary },
  form: { padding: spacing.md, gap: spacing.md },
  titleInput: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bodyInput: {
    fontSize: 15,
    color: colors.black,
    minHeight: 120,
    lineHeight: 22,
  },
  codeInput: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: colors.gray100,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 13,
  },
  extraField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gray100,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  extraInput: { flex: 1, fontSize: 14, color: colors.black },
})
