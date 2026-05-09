import React, { useState } from 'react'
import {
  StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'

interface Props extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: keyof typeof Feather.glyphMap
  rightIcon?: keyof typeof Feather.glyphMap
  onRightIconPress?: () => void
  secureEntry?: boolean
  containerStyle?: ViewStyle
}

export function Input({
  label, error, leftIcon, rightIcon, onRightIconPress,
  secureEntry, containerStyle, ...rest
}: Props) {
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(secureEntry ?? false)

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.row,
        focused && styles.focused,
        !!error && styles.errored,
      ]}>
        {leftIcon && (
          <Feather name={leftIcon} size={18} color={colors.textMuted} style={styles.leftIcon} />
        )}
        <TextInput
          {...rest}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
        />
        {secureEntry && (
          <TouchableOpacity onPress={() => setHidden(h => !h)} accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Feather name={hidden ? 'eye' : 'eye-off'} size={18} color={colors.textMuted} style={styles.rightIcon} />
          </TouchableOpacity>
        )}
        {rightIcon && !secureEntry && (
          <TouchableOpacity onPress={onRightIconPress} accessibilityLabel="Input action">
            <Feather name={rightIcon} size={18} color={colors.textMuted} style={styles.rightIcon} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: {
    fontFamily: fonts.medium, fontSize: fontSize.sm,
    color: colors.textSecondary, marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, minHeight: 44,
  },
  focused: { borderColor: colors.accent },
  errored: { borderColor: colors.error },
  leftIcon: { marginLeft: spacing.md },
  rightIcon: { marginRight: spacing.md },
  input: {
    flex: 1, paddingHorizontal: spacing.md,
    fontFamily: fonts.body, fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  error: {
    fontFamily: fonts.body, fontSize: fontSize.xs,
    color: colors.error, marginTop: spacing.xs,
  },
})
