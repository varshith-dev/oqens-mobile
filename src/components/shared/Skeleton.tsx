import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View, ViewStyle } from 'react-native'
import { colors, radius } from '../../theme'

interface Props {
  width?: number | string
  height?: number
  variant?: 'line' | 'circle' | 'rect'
  style?: ViewStyle
}

export function Skeleton({ width = '100%', height = 16, variant = 'rect', style }: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const borderRadius =
    variant === 'circle' ? radius.full :
    variant === 'line'   ? radius.sm :
    radius.md

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as any, height: variant === 'circle' ? width as number : height, borderRadius, opacity },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.border },
})
