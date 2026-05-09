import React, { useRef, useState } from 'react'
import {
  Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from '../../components/ui/Button'
import { colors, fonts, fontSize, spacing, radius } from '../../theme'

const { width } = Dimensions.get('window')

const SLIDES = [
  { id: '1', title: 'Share what you build', subtitle: 'Post code, articles, and projects with the developer community.' },
  { id: '2', title: 'Discover developers', subtitle: 'Find talented people, follow their work, and get inspired.' },
  { id: '3', title: 'Grow your community', subtitle: 'Build your audience, get feedback, and level up together.' },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const ref = useRef<FlatList>(null)

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.skip}
        onPress={() => router.replace('/(auth)/login')}
        accessibilityLabel="Skip onboarding"
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={ref}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={i => i.id}
        onMomentumScrollEnd={e => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.illustration} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          label="Get Started"
          onPress={() => router.replace('/(auth)/register')}
          variant="primary"
          size="lg"
          fullWidth
        />
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          style={styles.loginLink}
          accessibilityLabel="Go to login"
        >
          <Text style={styles.loginText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  skip: { position: 'absolute', top: 56, right: spacing.base, zIndex: 10, padding: spacing.sm },
  skipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  slide: {
    width, paddingHorizontal: spacing['2xl'],
    alignItems: 'center', justifyContent: 'center', flex: 1,
  },
  illustration: {
    width: 220, height: 220, borderRadius: radius.lg,
    backgroundColor: colors.accentSoft, marginBottom: spacing['2xl'],
  },
  title: {
    fontFamily: fonts.heading, fontSize: fontSize.xl,
    color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body, fontSize: fontSize.base,
    color: colors.textSecondary, textAlign: 'center', lineHeight: 22,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.xl },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.border, marginHorizontal: 4,
  },
  dotActive: { backgroundColor: colors.accent, width: 20 },
  actions: { paddingHorizontal: spacing.base, paddingBottom: spacing['3xl'] },
  loginLink: { alignItems: 'center', marginTop: spacing.base, padding: spacing.sm },
  loginText: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.accent },
})
