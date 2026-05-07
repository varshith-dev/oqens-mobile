import { useState, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { rpcQuery } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { colors, spacing, radius } from '../../lib/theme'

// ─── Types ────────────────────────────────────────────────────────────────────
type PostType = 'meme' | 'blog' | 'code'
type Visibility = 'public' | 'private'

interface MediaFile {
  uri: string
  type: string
  name: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const POST_TYPES: { key: PostType; label: string; icon: string; desc: string }[] = [
  { key: 'meme',  label: 'Media',   icon: 'image-outline',      desc: 'Photos & videos' },
  { key: 'blog',  label: 'Article', icon: 'document-text-outline', desc: 'Long-form writing' },
  { key: 'code',  label: 'Code',    icon: 'code-slash-outline',  desc: 'Code snippets' },
]

const CODE_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Rust', 'Go',
  'Java', 'C++', 'C#', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'SQL', 'Bash', 'Other',
]

// ─── Tag chip ─────────────────────────────────────────────────────────────────
function TagChip({ tag, onRemove }: { tag: string; onRemove: () => void }) {
  return (
    <View style={tagStyles.chip}>
      <Text style={tagStyles.text}>#{tag}</Text>
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        <Ionicons name="close" size={13} color={colors.primary} />
      </TouchableOpacity>
    </View>
  )
}
const tagStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  text: { fontSize: 13, color: colors.primary, fontWeight: '600' },
})

// ─── Media thumbnail ──────────────────────────────────────────────────────────
function MediaThumb({ uri, onRemove }: { uri: string; onRemove: () => void }) {
  return (
    <View style={mediaStyles.wrap}>
      <Image source={{ uri }} style={mediaStyles.img} resizeMode="cover" />
      <TouchableOpacity style={mediaStyles.remove} onPress={onRemove}>
        <Ionicons name="close-circle" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  )
}
const mediaStyles = StyleSheet.create({
  wrap: { position: 'relative', marginRight: 8 },
  img: { width: 80, height: 80, borderRadius: radius.md, backgroundColor: colors.gray100 },
  remove: { position: 'absolute', top: -6, right: -6 },
})

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CreateScreen() {
  const router = useRouter()
  const { user } = useAuth()

  const [type, setType] = useState<PostType>('meme')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [codeSnippet, setCodeSnippet] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('JavaScript')
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [media, setMedia] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)

  const [mediaUrlInput, setMediaUrlInput] = useState('')

  // ── Media input — paste URL ─────────────────────────────────────────────────
  function addMediaUrl() {
    const url = mediaUrlInput.trim()
    if (!url) return
    if (media.length >= 5) { Alert.alert('Limit reached', 'Max 5 files'); return }
    const isVideo = /\.(mp4|webm|mov|mkv)$/i.test(url)
    setMedia(prev => [...prev, {
      uri: url,
      type: isVideo ? 'video/mp4' : 'image/jpeg',
      name: url.split('/').pop() || `media_${Date.now()}`,
    }].slice(0, 5))
    setMediaUrlInput('')
  }

  function pickMedia() {
    Alert.alert(
      'Add Media',
      'Paste a direct URL to an image or video',
      [{ text: 'OK' }]
    )
  }

  // ── Tag input ───────────────────────────────────────────────────────────────
  function addTag() {
    const t = tagInput.trim().replace(/^#/, '').toLowerCase()
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags(prev => [...prev, t])
    }
    setTagInput('')
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(isDraft: boolean): string | null {
    if (!title.trim()) return 'Title is required'
    if (!isDraft) {
      if (type === 'code' && !codeSnippet.trim()) return 'Code snippet is required'
      if (type === 'meme' && media.length === 0) return 'Upload at least one media file'
      if (type === 'blog' && !description.trim()) return 'Article body is required'
    }
    return null
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(isDraft = false) {
    if (!user) return router.push('/(auth)/login' as any)
    const err = validate(isDraft)
    if (err) { Alert.alert('Missing info', err); return }

    isDraft ? setSavingDraft(true) : setLoading(true)
    try {
      // For now, media URIs are stored directly (in production you'd upload to S3 first)
      const contentUrl = media.map(m => m.uri).join(',') || null

      const payload: any = {
        user_id: user.id,
        type,
        title: title.trim(),
        description: description.trim() || null,
        content_url: contentUrl,
        code_snippet: type === 'code' ? codeSnippet.trim() : null,
        code_language: type === 'code' ? codeLanguage : null,
        status: isDraft ? 'draft' : 'published',
        visibility,
        is_pinned: false,
      }

      const res = await rpcQuery({ table: 'posts', action: 'insert', data: payload })

      if (res.data) {
        // Save tags
        if (tags.length > 0 && res.data.id) {
          for (const tagName of tags) {
            try {
              // Get or create tag
              const tagRes = await rpcQuery({
                table: 'tags', action: 'select',
                select: 'id', filters: [{ type: 'eq', col: 'slug', val: tagName }], limit: 1,
              })
              let tagId = tagRes.data?.[0]?.id
              if (!tagId) {
                const newTag = await rpcQuery({
                  table: 'tags', action: 'insert',
                  data: { name: tagName, slug: tagName, post_count: 1 },
                })
                tagId = newTag.data?.id
              }
              if (tagId) {
                await rpcQuery({
                  table: 'post_tags', action: 'insert',
                  data: { post_id: res.data.id, tag_id: tagId },
                })
              }
            } catch {}
          }
        }

        // Reset
        setTitle(''); setDescription(''); setCodeSnippet(''); setTags([]); setMedia([])
        router.push('/(tabs)' as any)
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message || 'Failed to post')
    } finally {
      setLoading(false)
      setSavingDraft(false)
    }
  }

  const canPost = title.trim().length > 0 && (
    type === 'code' ? codeSnippet.trim().length > 0 :
    type === 'meme' ? media.length > 0 :
    description.trim().length > 0
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.draftBtn, savingDraft && { opacity: 0.6 }]}
              onPress={() => handleSubmit(true)}
              disabled={savingDraft || loading}
              activeOpacity={0.7}
            >
              {savingDraft
                ? <ActivityIndicator size="small" color={colors.gray700} />
                : <Text style={styles.draftBtnText}>Draft</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.postBtn, (!canPost || loading) && styles.postBtnDisabled]}
              onPress={() => handleSubmit(false)}
              disabled={!canPost || loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Text style={styles.postBtnText}>Post</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >

          {/* ── Type selector ── */}
          <View style={styles.typeRow}>
            {POST_TYPES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.typeBtn, type === t.key && styles.typeBtnActive]}
                onPress={() => setType(t.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={t.icon as any}
                  size={16}
                  color={type === t.key ? colors.primary : colors.gray500}
                />
                <Text style={[styles.typeBtnText, type === t.key && styles.typeBtnTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.form}>

            {/* ── Title ── */}
            <TextInput
              style={styles.titleInput}
              placeholder="Title"
              placeholderTextColor={colors.gray300}
              value={title}
              onChangeText={setTitle}
              maxLength={200}
              returnKeyType="next"
            />

            {/* ── Media upload ── */}
            {type === 'meme' && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Media</Text>
                <View style={styles.mediaRow}>
                  {media.map((m, i) => (
                    <MediaThumb
                      key={i}
                      uri={m.uri}
                      onRemove={() => setMedia(prev => prev.filter((_, idx) => idx !== i))}
                    />
                  ))}
                </View>
                {media.length < 5 && (
                  <View style={styles.tagInputRow}>
                    <TextInput
                      style={styles.tagInput}
                      placeholder="Paste image/video URL..."
                      placeholderTextColor={colors.gray300}
                      value={mediaUrlInput}
                      onChangeText={setMediaUrlInput}
                      autoCapitalize="none"
                      keyboardType="url"
                      returnKeyType="done"
                      onSubmitEditing={addMediaUrl}
                    />
                    <TouchableOpacity
                      style={[styles.tagAddBtn, !mediaUrlInput.trim() && { opacity: 0.4 }]}
                      onPress={addMediaUrl}
                      disabled={!mediaUrlInput.trim()}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
                {media.length > 0 && (
                  <Text style={styles.mediaHint}>{media.length}/5 files attached</Text>
                )}
              </View>
            )}

            {/* ── Description / Article body ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                {type === 'blog' ? 'Article body' : type === 'code' ? 'Description (optional)' : 'Caption'}
              </Text>
              <TextInput
                style={[styles.bodyInput, type === 'blog' && styles.bodyInputTall]}
                placeholder={
                  type === 'blog' ? 'Write your article...' :
                  type === 'code' ? 'Describe what this code does...' :
                  "What's on your mind?"
                }
                placeholderTextColor={colors.gray300}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* ── Code snippet ── */}
            {type === 'code' && (
              <View style={styles.section}>
                <View style={styles.sectionLabelRow}>
                  <Text style={styles.sectionLabel}>Code</Text>
                  <TouchableOpacity
                    style={styles.langBtn}
                    onPress={() => setShowLangPicker(v => !v)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.langBtnText}>{codeLanguage}</Text>
                    <Ionicons name="chevron-down" size={13} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                {showLangPicker && (
                  <View style={styles.langPicker}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {CODE_LANGUAGES.map(lang => (
                        <TouchableOpacity
                          key={lang}
                          style={[styles.langOption, codeLanguage === lang && styles.langOptionActive]}
                          onPress={() => { setCodeLanguage(lang); setShowLangPicker(false) }}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.langOptionText, codeLanguage === lang && styles.langOptionTextActive]}>
                            {lang}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View style={styles.codeWrap}>
                  <View style={styles.codeHeader}>
                    <View style={styles.codeDots}>
                      <View style={[styles.codeDot, { backgroundColor: '#FF5F57' }]} />
                      <View style={[styles.codeDot, { backgroundColor: '#FEBC2E' }]} />
                      <View style={[styles.codeDot, { backgroundColor: '#28C840' }]} />
                    </View>
                    <Text style={styles.codeLang}>{codeLanguage}</Text>
                  </View>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="// Paste your code here..."
                    placeholderTextColor="#4A5568"
                    value={codeSnippet}
                    onChangeText={setCodeSnippet}
                    multiline
                    textAlignVertical="top"
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                  />
                </View>
              </View>
            )}

            {/* ── Tags ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tags <Text style={styles.sectionLabelHint}>(up to 8)</Text></Text>
              {tags.length > 0 && (
                <View style={styles.tagsWrap}>
                  {tags.map(t => (
                    <TagChip key={t} tag={t} onRemove={() => setTags(prev => prev.filter(x => x !== t))} />
                  ))}
                </View>
              )}
              {tags.length < 8 && (
                <View style={styles.tagInputRow}>
                  <TextInput
                    style={styles.tagInput}
                    placeholder="Add a tag..."
                    placeholderTextColor={colors.gray300}
                    value={tagInput}
                    onChangeText={setTagInput}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={addTag}
                  />
                  <TouchableOpacity
                    style={[styles.tagAddBtn, !tagInput.trim() && { opacity: 0.4 }]}
                    onPress={addTag}
                    disabled={!tagInput.trim()}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ── Visibility ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Visibility</Text>
              <View style={styles.visRow}>
                {(['public', 'private'] as Visibility[]).map(v => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.visBtn, visibility === v && styles.visBtnActive]}
                    onPress={() => setVisibility(v)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={v === 'public' ? 'globe-outline' : 'lock-closed-outline'}
                      size={15}
                      color={visibility === v ? colors.primary : colors.gray500}
                    />
                    <Text style={[styles.visBtnText, visibility === v && styles.visBtnTextActive]}>
                      {v === 'public' ? 'Public' : 'Private'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.black },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  draftBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border,
    minWidth: 56, alignItems: 'center',
  },
  draftBtnText: { fontSize: 13, fontWeight: '600', color: colors.gray700 },
  postBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingHorizontal: 18, paddingVertical: 8, minWidth: 60, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
  },
  postBtnDisabled: { backgroundColor: colors.gray300, shadowOpacity: 0 },
  postBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },

  // Type selector
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white,
  },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: colors.gray500 },
  typeBtnTextActive: { color: colors.primary },

  // Form
  form: { padding: spacing.md, gap: 20 },
  titleInput: {
    fontSize: 20, fontWeight: '700', color: colors.black,
    paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: colors.border,
  },

  // Section
  section: { gap: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.gray500, textTransform: 'uppercase', letterSpacing: 0.6 },
  sectionLabelHint: { fontWeight: '400', textTransform: 'none', letterSpacing: 0 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // Media
  mediaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addMediaBtn: {
    width: 80, height: 80, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  addMediaText: { fontSize: 10, color: colors.gray500, fontWeight: '600' },
  mediaHint: { fontSize: 12, color: colors.gray500 },

  // Body
  bodyInput: {
    fontSize: 15, color: colors.black, lineHeight: 22,
    minHeight: 100, backgroundColor: colors.gray100,
    borderRadius: radius.md, padding: 12,
  },
  bodyInputTall: { minHeight: 180 },

  // Code
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  langBtnText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  langPicker: {
    backgroundColor: colors.gray100, borderRadius: radius.md,
    paddingVertical: 8, paddingHorizontal: 4,
  },
  langOption: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
    marginHorizontal: 3,
  },
  langOptionActive: { backgroundColor: colors.primary },
  langOptionText: { fontSize: 13, color: colors.gray700, fontWeight: '500' },
  langOptionTextActive: { color: colors.white, fontWeight: '700' },
  codeWrap: { backgroundColor: '#1A1A2E', borderRadius: radius.md, overflow: 'hidden' },
  codeHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#16213E',
  },
  codeDots: { flexDirection: 'row', gap: 5 },
  codeDot: { width: 10, height: 10, borderRadius: 5 },
  codeLang: { fontSize: 11, fontWeight: '600', color: '#8892B0', textTransform: 'uppercase' },
  codeInput: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13, color: '#CDD6F4', padding: 12, lineHeight: 20, minHeight: 160,
  },

  // Tags
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.gray100, borderRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  tagInput: { flex: 1, fontSize: 14, color: colors.black, paddingVertical: 8 },
  tagAddBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },

  // Visibility
  visRow: { flexDirection: 'row', gap: 10 },
  visBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
  },
  visBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  visBtnText: { fontSize: 14, fontWeight: '600', color: colors.gray500 },
  visBtnTextActive: { color: colors.primary },
})
