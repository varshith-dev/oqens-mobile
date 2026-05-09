import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { colors, radius, shadow, spacing } from '../../theme'

interface Props {
  children: React.ReactNode
  style?: ViewStyle
  padding?: boolean
}

export function Card({ children, style, padding = true }: Props) {
  return (
    <View style={[styles.card, padding && styles.padding, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  padding: { padding: spacing.base },
})
