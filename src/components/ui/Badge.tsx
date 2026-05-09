import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'

type Variant = 'accent' | 'success' | 'warning' | 'error' | 'muted'
type Size = 'sm' | 'md'

const BG: Record<Variant, string> = {
  accent:  colors.accentSoft,
  success: colors.successBg,
  warning: colors.warningBg,
  error:   colors.errorBg,
  muted:   colors.surface,
}
const TEXT: Record<Variant, string> = {
  accent:  colors.accent,
  success: colors.success,
  warning: colors.warning,
  error:   colors.error,
  muted:   colors.textMuted,
}

interface Props {
  label: string
  variant?: Variant
  size?: Size
}

export function Badge({ label, variant = 'muted', size = 'md' }: Props) {
  return (
    <View style={[styles.base, { backgroundColor: BG[variant], paddingVertical: size === 'sm' ? 2 : 4 }]}>
      <Text style={[styles.text, { color: TEXT[variant], fontSize: size === 'sm' ? fontSize.xs : fontSize.sm }]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
  },
  text: { fontFamily: fonts.medium },
})
