import React, { useState } from 'react'
import { usersApi } from '../../api/users'
import { useToast } from '../../hooks/useToast'
import { Button } from './Button'

interface Props {
  userId: string
  isFollowing: boolean
  size?: 'sm' | 'md' | 'lg'
  onToggle?: (following: boolean) => void
}

export function FollowButton({ userId, isFollowing, size = 'sm', onToggle }: Props) {
  const [following, setFollowing] = useState(isFollowing)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handlePress = async () => {
    setLoading(true)
    try {
      if (following) {
        await usersApi.unfollow(userId)
        setFollowing(false)
        onToggle?.(false)
      } else {
        await usersApi.follow(userId)
        setFollowing(true)
        onToggle?.(true)
      }
    } catch {
      toast.show('Action failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      label={following ? 'Following' : 'Follow'}
      onPress={handlePress}
      variant={following ? 'secondary' : 'primary'}
      size={size}
      loading={loading}
      accessibilityLabel={following ? 'Unfollow user' : 'Follow user'}
    />
  )
}
