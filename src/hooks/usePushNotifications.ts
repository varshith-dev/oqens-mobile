import { useEffect } from 'react'
import { OneSignal, LogLevel } from 'react-native-onesignal'
import Constants from 'expo-constants'
import { useNotifStore } from '../store/useNotifStore'
import { usersApi } from '../api/users'

const ONESIGNAL_APP_ID =
  Constants.expoConfig?.extra?.oneSignalAppId ?? 'YOUR_ONESIGNAL_APP_ID_HERE'

export function usePushNotifications() {
  const incrementUnread = useNotifStore(s => s.incrementUnread)

  useEffect(() => {
    // Debug logging in dev only
    if (__DEV__) {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose)
    }

    // Initialize
    OneSignal.initialize(ONESIGNAL_APP_ID)

    // Request permission (Android 13+ requires this)
    OneSignal.Notifications.requestPermission(true)

    // Foreground notification received — show in-app toast, increment badge
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
      // Prevent OS notification while app is open — we handle it in-app
      event.preventDefault()
      incrementUnread()
      // The notification data is available at event.notification.additionalData
    })

    // Notification tapped (background/killed state)
    OneSignal.Notifications.addEventListener('click', (event) => {
      const data = event.notification.additionalData as any
      // Deep link routing is handled by the notification's launchURL
      // or you can manually navigate here using a navigation ref
      console.log('OneSignal notification tapped:', data)
    })

    // Get the OneSignal Player ID and send to backend
    OneSignal.User.pushSubscription.addEventListener('change', async (subscription) => {
      const playerId = subscription.current.id
      if (playerId) {
        try {
          await usersApi.savePushToken(playerId)
        } catch {
          // non-critical
        }
      }
    })

    return () => {
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay', () => {})
      OneSignal.Notifications.removeEventListener('click', () => {})
    }
  }, [])
}
