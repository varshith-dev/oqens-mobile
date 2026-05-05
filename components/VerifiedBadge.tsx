import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  role?: string
  size?: number
  isVerified?: boolean
}

/**
 * Verified badge matching web app:
 * - Blue: regular verified users
 * - Gold/Yellow: admin or moderator
 * - Green: advertiser
 */
export default function VerifiedBadge({ role = 'user', size = 16, isVerified = false }: Props) {
  const r = (role || 'user').toLowerCase()
  const isGold = r === 'admin' || r === 'moderator'
  const isGreen = r === 'advertiser'

  if (!isVerified && !isGold && !isGreen) return null

  let color = '#3B82F6' // blue — regular verified
  if (isGold) color = '#EAB308' // gold — admin/mod
  if (isGreen) color = '#22C55E' // green — advertiser

  const finalSize = (isGold || isGreen) ? size * 1.2 : size

  return (
    <Ionicons
      name="checkmark-circle"
      size={finalSize}
      color={color}
      style={{ marginLeft: 3 }}
    />
  )
}
