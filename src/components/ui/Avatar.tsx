import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { colors, fonts, fontSize, radius } from '../../theme'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_MAP: Record<AvatarSize, number> = { sm: 32, md: 40, lg: 56, xl: 72 }
const FONT_MAP: Record<AvatarSize, number> = { sm: fontSize.xs, md: fontSize.sm, lg: fontSize.base, xl: fontSize.md }

interface Props {
  uri?: string | null
  name?: string
  size?: AvatarSize
  online?: boolean
}

function getInitials(name?: string): string {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export function Avatar({ uri, name, size = 'md', online }: Props) {
  const dim = SIZE_MAP[size]
  const dotSize = 10

  return (
    <View style={{ width: dim, height: dim }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: dim, height: dim, borderRadius: radius.full }}
          contentFit="cover"
          placeholder={{ color: colors.surface }}
          accessibilityLabel={name ?? 'Avatar'}
        />
      ) : (
        <View style={[styles.fallback, { width: dim, height: dim, borderRadius: radius.full }]}>
          <Text style={[styles.initials, { fontSize: FONT_MAP[size] }]}>{getInitials(name)}</Text>
        </View>
      )}
      {online && (
        <View style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2 }]} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  initials: { fontFamily: fonts.semibold, color: colors.accent },
  dot: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: colors.online,
    borderWidth: 2, borderColor: colors.bg,
  },
})
