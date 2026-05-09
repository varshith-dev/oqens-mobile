import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors, fonts, fontSize, spacing } from '../../theme'
import { Button } from '../ui/Button'

interface Props {
  icon?: keyof typeof Feather.glyphMap
  title: string
  subtitle?: string
  action?: { label: string; onPress: () => void }
}

export function EmptyState({ icon = 'inbox', title, subtitle, action }: Props) {
  return (
    <View style={styles.container}>
      <Feather name={icon} size={48} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="secondary"
          size="md"
          style={{ marginTop: spacing.base }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['2xl'] },
  title: {
    fontFamily: fonts.semibold, fontSize: fontSize.lg,
    color: colors.textPrimary, marginTop: spacing.base, textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body, fontSize: fontSize.base,
    color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center',
  },
})
