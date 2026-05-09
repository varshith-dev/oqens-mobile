import React from 'react'
import { Tabs } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import { useNotifStore } from '../../src/store/useNotifStore'
import { colors, fonts, fontSize, spacing } from '../../src/theme'

function TabIcon({ name, focused, badge }: { name: keyof typeof Feather.glyphMap; focused: boolean; badge?: number }) {
  return (
    <View style={styles.iconWrap}>
      <Feather name={name} size={22} color={focused ? colors.accent : colors.textMuted} />
      {!!badge && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
  )
}

export default function TabsLayout() {
  const unreadCount = useNotifStore(s => s.unreadCount)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) => <TabIcon name="plus-circle" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="flicks"
        options={{
          title: 'Flicks',
          tabBarIcon: ({ focused }) => <TabIcon name="film" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Activity',
          tabBarIcon: ({ focused }) => <TabIcon name="bell" focused={focused} badge={unreadCount} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: spacing.xs,
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  iconWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: colors.error,
    borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: colors.bg,
  },
  badgeText: { fontFamily: fonts.medium, fontSize: 9, color: '#fff' },
})
