import React from 'react'
import {
  ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle,
} from 'react-native'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  label: string
  onPress: () => void
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  style?: ViewStyle
  accessibilityLabel?: string
}

const BG: Record<Variant, string> = {
  primary:   colors.accent,
  secondary: colors.surface,
  ghost:     'transparent',
  danger:    colors.error,
}
const TEXT_COLOR: Record<Variant, string> = {
  primary:   colors.textInverse,
  secondary: colors.textPrimary,
  ghost:     colors.accent,
  danger:    colors.textInverse,
}
const BORDER: Record<Variant, string | undefined> = {
  primary:   undefined,
  secondary: colors.border,
  ghost:     undefined,
  danger:    undefined,
}
const PAD: Record<Size, { paddingVertical: number; paddingHorizontal: number }> = {
  sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  md: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.base },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
}
const FONT_SIZE: Record<Size, number> = { sm: fontSize.sm, md: fontSize.base, lg: fontSize.md }
const MIN_HEIGHT: Record<Size, number> = { sm: 36, md: 44, lg: 52 }

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, fullWidth, style, accessibilityLabel,
}: Props) {
  const isDisabled = disabled || loading
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      style={[
        styles.base,
        PAD[size],
        {
          backgroundColor: BG[variant],
          borderColor: BORDER[variant] ?? 'transparent',
          borderWidth: BORDER[variant] ? 1 : 0,
          minHeight: MIN_HEIGHT[size],
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={TEXT_COLOR[variant]} size="small" />
        : <Text style={[styles.label, { color: TEXT_COLOR[variant], fontSize: FONT_SIZE[size] }]}>{label}</Text>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: { fontFamily: fonts.medium },
})
