import React, { useEffect, useRef } from 'react'
import {
  Animated, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'

export interface BottomSheetAction {
  label: string
  onPress: () => void
  destructive?: boolean
  icon?: React.ReactNode
}

interface Props {
  visible: boolean
  onClose: () => void
  actions?: BottomSheetAction[]
  children?: React.ReactNode
  title?: string
}

export function BottomSheet({ visible, onClose, actions, children, title }: Props) {
  const insets = useSafeAreaInsets()
  const translateY = useRef(new Animated.Value(400)).current

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start()
    } else {
      Animated.timing(translateY, { toValue: 400, duration: 200, useNativeDriver: true }).start()
    }
  }, [visible])

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Close sheet" />
      <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.base, transform: [{ translateY }] }]}>
        <View style={styles.handle} />
        {title && <Text style={styles.title}>{title}</Text>}
        {children}
        {actions?.map((a, i) => (
          <TouchableOpacity
            key={i}
            style={styles.action}
            onPress={() => { onClose(); a.onPress() }}
            accessibilityLabel={a.label}
          >
            {a.icon && <View style={styles.actionIcon}>{a.icon}</View>}
            <Text style={[styles.actionText, a.destructive && { color: colors.error }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.semibold, fontSize: fontSize.base,
    color: colors.textPrimary, textAlign: 'center',
    marginBottom: spacing.sm, paddingHorizontal: spacing.base,
  },
  action: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    minHeight: 44,
  },
  actionIcon: { marginRight: spacing.sm },
  actionText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textPrimary },
})
