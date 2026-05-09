import React, { useEffect, useState } from 'react'
import {
  ActionSheetIOS, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { Button } from '../../components/ui/Button'
import { BottomSheet } from '../../components/shared/BottomSheet'
import { postsApi } from '../../api/posts'
import { useFeedStore } from '../../store/useFeedStore'
import { useToast } from '../../hooks/useToast'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'
import { ASYNC_STORAGE_DRAFTS_KEY } from '../../utils/constants'

type PostType = 'media' | 'article' | 'code'

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'Kotlin', 'Swift', 'C++', 'HTML', 'CSS', 'SQL', 'Other']

export default function CreatePostScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const refreshFeed = useFeedStore(s => s.refreshFeed)
  const [postType, setPostType] = useState<PostType>('media')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mediaUri, setMediaUri] = useState<string | null>(null)
  const [language, setLanguage] = useState('JavaScript')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [loading, setLoading] = useState(false)
  const [langSheetVisible, setLangSheetVisible] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => { checkDraft() }, [])

  const checkDraft = async () => {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_DRAFTS_KEY)
    if (raw) {
      const drafts = JSON.parse(raw)
      if (drafts.length > 0) setHasDraft(true)
    }
  }

  const restoreDraft = async () => {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_DRAFTS_KEY)
    if (!raw) return
    const drafts = JSON.parse(raw)
    if (drafts[0]) {
      const d = drafts[0]
      setPostType(d.postType ?? 'media')
      setTitle(d.title ?? '')
      setContent(d.content ?? '')
      setTags(d.tags ?? [])
      setLanguage(d.language ?? 'JavaScript')
      setHasDraft(false)
    }
  }

  const saveDraft = async () => {
    const draft = { postType, title, content, tags, language }
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_DRAFTS_KEY)
    const drafts = raw ? JSON.parse(raw) : []
    await AsyncStorage.setItem(ASYNC_STORAGE_DRAFTS_KEY, JSON.stringify([draft, ...drafts].slice(0, 5)))
    toast.show('Draft saved', 'success')
  }

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    })
    if (!result.canceled) setMediaUri(result.assets[0].uri)
  }

  const addTag = (val: string) => {
    const cleaned = val.replace(/[^a-z0-9]/gi, '').toLowerCase()
    if (cleaned && !tags.includes(cleaned) && tags.length < 8) {
      setTags(t => [...t, cleaned])
    }
    setTagInput('')
  }

  const isValid = () => {
    if (postType === 'media') return content.trim().length > 0
    if (postType === 'article') return title.trim().length > 0 && content.trim().length > 0
    if (postType === 'code') return content.trim().length > 0
    return false
  }

  const handlePost = async () => {
    if (!isValid()) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('type', postType)
      fd.append('content', content.trim())
      fd.append('visibility', visibility)
      if (title) fd.append('title', title.trim())
      if (language && postType === 'code') fd.append('language', language)
      tags.forEach(t => fd.append('tags[]', t))
      if (mediaUri) fd.append('media', { uri: mediaUri, name: 'media.jpg', type: 'image/jpeg' } as any)
      await postsApi.createPost(fd)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      toast.show('Post published!', 'success')
      await refreshFeed()
      router.back()
    } catch (err: any) {
      toast.show(err?.response?.data?.message ?? 'Failed to post', 'error')
    } finally {
      setLoading(false)
    }
  }

  const TYPES: PostType[] = ['media', 'article', 'code']

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} accessibilityLabel="Cancel">
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Post</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={saveDraft} style={styles.draftBtn} accessibilityLabel="Save draft">
              <Text style={styles.draftText}>Draft</Text>
            </TouchableOpacity>
            <Button label="Post" onPress={handlePost} loading={loading} disabled={!isValid()} size="sm" />
          </View>
        </View>

        {/* Draft banner */}
        {hasDraft && (
          <View style={styles.draftBanner}>
            <Text style={styles.draftBannerText}>You have a saved draft</Text>
            <View style={styles.draftBannerActions}>
              <TouchableOpacity onPress={restoreDraft} accessibilityLabel="Restore draft">
                <Text style={styles.draftAction}>Restore</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setHasDraft(false)} accessibilityLabel="Discard draft">
                <Text style={[styles.draftAction, { color: colors.error }]}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Type selector */}
        <View style={styles.typeRow}>
          {TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeTab, postType === t && styles.typeTabActive]}
              onPress={() => setPostType(t)}
              accessibilityLabel={`${t} post type`}
            >
              <Text style={[styles.typeText, postType === t && styles.typeTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {/* Title (article + media optional) */}
          {(postType === 'article' || postType === 'media') && (
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder={postType === 'article' ? 'Article title…' : 'Add a title… (optional)'}
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Post title"
            />
          )}

          {/* Code language picker */}
          {postType === 'code' && (
            <TouchableOpacity
              style={styles.langPicker}
              onPress={() => setLangSheetVisible(true)}
              accessibilityLabel="Select language"
            >
              <Text style={styles.langText}>{language}</Text>
              <Feather name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Content */}
          <TextInput
            style={[styles.contentInput, postType === 'code' && styles.codeInput]}
            value={content}
            onChangeText={setContent}
            placeholder={
              postType === 'media' ? "What's on your mind?" :
              postType === 'article' ? 'Write your article…' :
              'Paste your code here…'
            }
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={postType === 'media' ? 500 : undefined}
            accessibilityLabel="Post content"
          />
          {postType === 'media' && (
            <Text style={styles.charCount}>{content.length}/500</Text>
          )}

          {/* Media picker */}
          {postType === 'media' && (
            <TouchableOpacity style={styles.mediaPicker} onPress={pickMedia} accessibilityLabel="Add media">
              {mediaUri
                ? <>
                    <Image source={{ uri: mediaUri }} style={styles.mediaPreview} contentFit="cover" accessibilityLabel="Selected media" />
                    <TouchableOpacity style={styles.removeMedia} onPress={() => setMediaUri(null)} accessibilityLabel="Remove media">
                      <Feather name="x" size={16} color="#fff" />
                    </TouchableOpacity>
                  </>
                : <View style={styles.mediaPlaceholder}>
                    <Feather name="image" size={24} color={colors.textMuted} />
                    <Text style={styles.mediaPlaceholderText}>Add photo or video</Text>
                  </View>
              }
            </TouchableOpacity>
          )}

          {/* Tags */}
          <View style={styles.tagsSection}>
            <View style={styles.tagsRow}>
              {tags.map(t => (
                <TouchableOpacity
                  key={t}
                  style={styles.tagChip}
                  onPress={() => setTags(prev => prev.filter(x => x !== t))}
                  accessibilityLabel={`Remove tag ${t}`}
                >
                  <Text style={styles.tagChipText}>#{t}</Text>
                  <Feather name="x" size={12} color={colors.accent} />
                </TouchableOpacity>
              ))}
            </View>
            {tags.length < 8 && (
              <TextInput
                style={styles.tagInput}
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add tags…"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                onSubmitEditing={() => addTag(tagInput)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === ' ' || nativeEvent.key === ',') addTag(tagInput)
                }}
                accessibilityLabel="Tag input"
              />
            )}
          </View>

          {/* Visibility */}
          <View style={styles.visibilityRow}>
            {(['public', 'private'] as const).map(v => (
              <TouchableOpacity
                key={v}
                style={[styles.visTab, visibility === v && styles.visTabActive]}
                onPress={() => setVisibility(v)}
                accessibilityLabel={`${v} visibility`}
              >
                <Text style={[styles.visText, visibility === v && styles.visTextActive]}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <BottomSheet
        visible={langSheetVisible}
        onClose={() => setLangSheetVisible(false)}
        title="Select Language"
        actions={LANGUAGES.map(l => ({ label: l, onPress: () => setLanguage(l) }))}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerBtn: { minWidth: 60 },
  cancelText: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.textSecondary },
  title: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  draftBtn: { padding: spacing.xs },
  draftText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  draftBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.accentSoft, paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
  },
  draftBannerText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.accent },
  draftBannerActions: { flexDirection: 'row', gap: spacing.md },
  draftAction: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.accent },
  typeRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  typeTab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  typeTabActive: { borderBottomColor: colors.accent },
  typeText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textMuted },
  typeTextActive: { color: colors.accent },
  body: { padding: spacing.base, gap: spacing.md, paddingBottom: spacing['3xl'] },
  titleInput: {
    fontFamily: fonts.semibold, fontSize: fontSize.lg,
    color: colors.textPrimary, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  langPicker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  langText: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.textPrimary },
  contentInput: {
    fontFamily: fonts.body, fontSize: fontSize.base,
    color: colors.textPrimary, minHeight: 120, textAlignVertical: 'top',
  },
  codeInput: {
    fontFamily: 'monospace', backgroundColor: colors.codeBg,
    color: '#CDD6F4', borderRadius: radius.md, padding: spacing.md,
  },
  charCount: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'right' },
  mediaPicker: {
    height: 160, borderRadius: radius.md,
    backgroundColor: colors.surface, overflow: 'hidden',
  },
  mediaPreview: { width: '100%', height: '100%' },
  removeMedia: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  mediaPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  mediaPlaceholderText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted },
  tagsSection: { gap: spacing.sm },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.accentSoft, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
  },
  tagChipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.accent },
  tagInput: {
    fontFamily: fonts.body, fontSize: fontSize.base,
    color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
  },
  visibilityRow: { flexDirection: 'row', gap: spacing.sm },
  visTab: {
    flex: 1, paddingVertical: spacing.sm, alignItems: 'center',
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  visTabActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  visText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textMuted },
  visTextActive: { color: colors.accent },
})
