import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'

interface Part {
  type: 'text' | 'mention' | 'hashtag' | 'url' | 'bold' | 'italic' | 'code'
  content: string
  username?: string
  hashtag?: string
  href?: string
  key: string
}

function parseText(text: string): Part[] {
  if (!text) return []
  const parts: Part[] = []
  let lastIndex = 0
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(@[a-zA-Z0-9_.-]+)|(#[a-zA-Z0-9_]+)|((?:https?:\/\/|www\.)[^\s]+)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index), key: `t-${lastIndex}` })
    }
    if (match[1]) {
      parts.push({ type: 'code', content: match[1].slice(1, -1), key: `c-${match.index}` })
    } else if (match[2]) {
      parts.push({ type: 'bold', content: match[2].slice(2, -2), key: `b-${match.index}` })
    } else if (match[3]) {
      parts.push({ type: 'italic', content: match[3].slice(1, -1), key: `i-${match.index}` })
    } else if (match[4]) {
      const username = match[4].substring(1)
      parts.push({ type: 'mention', content: match[4], username, key: `m-${match.index}` })
    } else if (match[5]) {
      const hashtag = match[5].substring(1).toLowerCase()
      parts.push({ type: 'hashtag', content: match[5], hashtag, key: `h-${match.index}` })
    } else if (match[6]) {
      parts.push({ type: 'url', content: match[6], href: match[6], key: `u-${match.index}` })
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex), key: `t-${lastIndex}` })
  }
  return parts
}

interface Props {
  text: string
  style?: any
  numberOfLines?: number
}

export default function RichText({ text, style, numberOfLines }: Props) {
  const router = useRouter()
  if (!text) return null

  const parts = parseText(text)

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map(part => {
        if (part.type === 'mention') {
          return (
            <Text
              key={part.key}
              style={styles.mention}
              onPress={() => router.push(`/profile/${part.username}`)}
            >
              {part.content}
            </Text>
          )
        }
        if (part.type === 'hashtag') {
          return (
            <Text
              key={part.key}
              style={styles.hashtag}
              onPress={() => router.push(`/explore?q=${part.hashtag}`)}
            >
              {part.content}
            </Text>
          )
        }
        if (part.type === 'url') {
          return (
            <Text key={part.key} style={styles.url}>{part.content}</Text>
          )
        }
        if (part.type === 'bold') {
          return <Text key={part.key} style={styles.bold}>{part.content}</Text>
        }
        if (part.type === 'italic') {
          return <Text key={part.key} style={styles.italic}>{part.content}</Text>
        }
        if (part.type === 'code') {
          return <Text key={part.key} style={styles.code}>{part.content}</Text>
        }
        return <Text key={part.key}>{part.content}</Text>
      })}
    </Text>
  )
}

const styles = StyleSheet.create({
  mention: { color: '#3B82F6', fontWeight: '600' },
  hashtag: { color: '#3B82F6', fontWeight: '600' },
  url: { color: '#3B82F6', textDecorationLine: 'underline' },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  code: { fontFamily: 'monospace', backgroundColor: '#F3F4F6', color: '#EC4899' },
})
