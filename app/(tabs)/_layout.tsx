import { Tabs } from 'expo-router'
import { View, StyleSheet, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../lib/theme'

function TabIcon({ name, outlineName, focused }: { name: any; outlineName: any; focused: boolean }) {
  return (
    <Ionicons
      name={focused ? name : outlineName}
      size={23}
      color={focused ? colors.primary : colors.gray500}
    />
  )
}

function CreateIcon() {
  return (
    <View style={styles.createBtn}>
      <Ionicons name="add" size={26} color={colors.white} />
    </View>
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
          tabBarIcon: () => <CreateIcon />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="flicks"
        options={{
          title: 'Flicks',
          tabBarIcon: ({ focused }) => <TabIcon name="play-circle" outlineName="play-circle-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="person" outlineName="person-outline" focused={focused} />,
        }}
      />
      {/* Hidden from tab bar */}
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 80 : 62,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 6,
    elevation: 0,
    shadowOpacity: 0,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  createBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
})
