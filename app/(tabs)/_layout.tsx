import { Tabs } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../lib/theme'

function TabIcon({ name, outlineName, focused }: { name: any; outlineName: any; focused: boolean }) {
  return (
    <Ionicons
      name={focused ? name : outlineName}
      size={24}
      color={focused ? colors.primary : colors.gray500}
    />
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.label,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" outlineName="home-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => <TabIcon name="search" outlineName="search-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.createBtn}>
              <Ionicons name="add" size={28} color={colors.white} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Activity',
          tabBarIcon: ({ focused }) => <TabIcon name="notifications" outlineName="notifications-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="person" outlineName="person-outline" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  },
  label: { fontSize: 11, fontWeight: '500' },
  createBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
})
