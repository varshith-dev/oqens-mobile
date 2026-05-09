import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type ToastType = 'success' | 'error' | 'info' | 'neutral'

export interface ToastRef {
  show: (message: string, type?: ToastType, duration?: number) => void
}

const BG: Record<ToastType, string> = {
  success: colors.success,
  error:   colors.error,
  info:    colors.accent,
  neutral: colors.textPrimary,
}

export const Toast = forwardRef<ToastRef>((_, ref) => {
  const insets = useSafeAreaInsets()
  const [message, setMessage] = useState('')
  const [type, setType] = useState<ToastType>('info')
  const translateY = useRef(new Animated.Value(100)).current
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useImperativeHandle(ref, () => ({
    show(msg, t = 'info', duration = 3000) {
      if (timer.current) clearTimeout(timer.current)
      setMessage(msg)
      setType(t)
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start()
      timer.current = setTimeout(() => {
        Animated.timing(translateY, { toValue: 100, duration: 250, useNativeDriver: true }).start()
      }, duration)
    },
  }))

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: BG[type], bottom: insets.bottom + spacing.base, transform: [{ translateY }] },
      ]}
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  )
})

Toast.displayName = 'Toast'

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    zIndex: 9999,
  },
  text: {
    color: colors.textInverse,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
})
