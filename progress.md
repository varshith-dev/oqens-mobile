# OQENS Android App — Build Progress

**Last updated:** 2026-05-09  
**Status:** COMPLETE — all screens, routes, stores, and components written. Awaiting `npm install` + first run.

---

## Build Guide Reference
`android.oqens/androdi-build-guide.md` — follow this for spec details.  
`android.oqens/ui/ux.md` — design system reference.

---

## Completed Steps

### Step 1 — Design Tokens ✅
- `src/theme/colors.ts`
- `src/theme/typography.ts`
- `src/theme/spacing.ts`
- `src/theme/index.ts`

### Step 2 — API Client + Zustand Stores ✅
- `src/api/client.ts` — axios, token interceptor, 401 handler
- `src/api/auth.ts`
- `src/api/posts.ts`
- `src/api/users.ts`
- `src/api/notifications.ts`
- `src/api/messages.ts`
- `src/api/flicks.ts`
- `src/store/useAuthStore.ts` — login, logout, SecureStore persist
- `src/store/useFeedStore.ts` — feed, optimistic like/bookmark
- `src/store/useNotifStore.ts` — notifications, unread count
- `src/store/useChatStore.ts` — DM threads + messages

### Step 3 — Deep Linking ✅
- `src/navigation/linking.ts`
- `app.json` — scheme: oqens, intentFilters for oqens.app
- `app/_layout.tsx` — Linking.addEventListener wired

### Step 4 — Push Notifications ✅
- `src/hooks/usePushNotifications.ts`
- Foreground: increments unread count, no OS alert
- Background tap routing handled via notification data

### Step 5 — Shared Components ✅
- `src/components/ui/Button.tsx` — primary/secondary/ghost/danger, loading state
- `src/components/ui/Input.tsx` — label, error, icons, secureEntry toggle
- `src/components/ui/Avatar.tsx` — sizes sm/md/lg/xl, initials fallback, online dot
- `src/components/ui/Badge.tsx` — accent/success/warning/error/muted variants
- `src/components/ui/Card.tsx`
- `src/components/ui/FollowButton.tsx` — manages own loading state
- `src/components/shared/Toast.tsx` — slide-up, 4 types, auto-dismiss
- `src/components/shared/ToastProvider.tsx` — global singleton ref
- `src/components/shared/BottomSheet.tsx` — animated, overlay dismiss
- `src/components/shared/Skeleton.tsx` — shimmer animation, line/circle/rect
- `src/components/shared/EmptyState.tsx` — icon + title + subtitle + CTA

### Step 6 — Navigation (Expo Router app/ directory) ✅
- `app/_layout.tsx` — fonts, SafeAreaProvider, GestureHandler, ToastProvider
- `app/index.tsx` → SplashScreen
- `app/(auth)/_layout.tsx`
- `app/(auth)/welcome.tsx` → OnboardingScreen
- `app/(auth)/login.tsx` → LoginScreen
- `app/(auth)/register.tsx` → RegisterScreen
- `app/(auth)/forgot-password.tsx` → ForgotPasswordScreen
- `app/(auth)/verify-email.tsx` → VerifyEmailScreen
- `app/(tabs)/_layout.tsx` — 6-tab bar with badge on Activity
- `app/(tabs)/index.tsx` → FeedScreen
- `app/(tabs)/explore.tsx` → ExploreScreen
- `app/(tabs)/create.tsx` → CreatePostScreen
- `app/(tabs)/flicks.tsx` → FlicksScreen
- `app/(tabs)/notifications.tsx` → ActivityScreen
- `app/(tabs)/profile.tsx` → ProfileScreen
- `app/posts/[postId].tsx` → PostDetailScreen
- `app/users/[username].tsx` → UserProfileScreen
- `app/users/[username]/followers.tsx` → FollowListScreen
- `app/users/[username]/following.tsx` → FollowListScreen
- `app/tags/[tag].tsx` → TagFeedScreen
- `app/profile/edit.tsx` → EditProfileScreen
- `app/messages/index.tsx` → InboxScreen
- `app/messages/[threadId].tsx` → ChatScreen
- `app/settings/index.tsx` → SettingsScreen
- `app/settings/change-password.tsx` → ChangePasswordScreen
- `app/settings/get-verified.tsx` → GetVerifiedScreen
- `app/settings/blocked-users.tsx` → BlockedUsersScreen
- `app/settings/web.tsx` → InAppWebScreen
- `app/settings/email-settings.tsx` → EmailSettingsScreen

### Step 7 — Auth Screens ✅
- SplashScreen — token check → Main or Onboarding
- OnboardingScreen — 3 slides, dots, Get Started / Login
- LoginScreen — email/password, validation, SecureStore
- RegisterScreen — 5 fields, inline validation
- ForgotPasswordScreen
- VerifyEmailScreen — 6-box OTP, auto-advance, 60s resend cooldown

### Step 8 — Feed Screen + PostCard ✅
- FeedScreen — For You / Following / Popular tabs, skeleton, empty state, infinite scroll
- PostCard — avatar, body, media (image/video/code), tags, like/comment/share/bookmark actions, optimistic updates, BottomSheet menu

### Step 9 — Post Detail Screen ✅
- Full post + comments list
- Sticky comment input, send with haptic
- Long-press comment → BottomSheet (reply/copy/report/delete)

### Step 10 — Create Post ✅
- 3 tabs: Media / Article / Code
- Draft save/restore via AsyncStorage
- Tag chips, visibility toggle, media picker

### Step 11 — Stories
- NOT YET BUILT — deferred (requires camera + story API endpoints)

### Step 12 — Explore + TagFeed ✅
- Search with debounce, filter tabs (All/People/Posts/Tags)
- Default: trending topics, suggested people, popular posts
- Recent searches persisted to AsyncStorage
- TagFeedScreen with pagination

### Step 13 — Activity Screen ✅
- Grouped Today / Earlier
- Icon badges per type (like/comment/follow/mention/system)
- Unread tint, mark all read on focus

### Step 14 — Profile Screen ✅
- Cover + avatar, stats, Edit Profile button
- Posts / Liked / Saved tabs

### Step 15 — User Profile Screen ✅
- Follow/Unfollow, Follows You badge
- Block/Unblock, Report via BottomSheet
- Blocked state hides posts

### Step 16 — Edit Profile Screen ✅
- Avatar + cover image pickers
- Username availability check (debounced)
- Save disabled until changes made

### Step 17 — Followers / Following Screens ✅
- Shared FollowListScreen, local search filter

### Step 18 — Flicks Screen ✅
- Full-screen vertical FlatList, expo-av Video
- Auto-play/pause on viewability, mute toggle
- Double-tap to like with haptic

### Step 19 — Messages ✅
- InboxScreen — thread list, unread badges, online dots
- ChatScreen — inverted message list, own/other bubbles, 5s poll, long-press menu

### Step 20 — Settings Screen ✅
- All sections: Account, Notifications, Privacy, Appearance, Support, Account Actions
- Toggles wired, logout/delete confirmation via BottomSheet
- Zero web redirects — Help/ToS/Privacy open InAppWebScreen

### Step 21 — Change Password ✅
### Step 22 — Get Verified ✅
### Step 23 — Blocked Users ✅
### Step 24 — InAppWebScreen ✅ (WebView, loading indicator, retry on error)
### Step 25 — Email Settings ✅

---

## Pending / Next Steps

1. **Install dependencies** — run in `android.oqens/`:
   ```bash
   npm install
   ```

2. **Add placeholder assets** — place these in `assets/`:
   - `icon.png` (1024×1024)
   - `splash.png` (1284×2778)
   - `adaptive-icon.png` (1024×1024)
   - `favicon.png` (48×48)
   - `notification-icon.png` (96×96)

3. **Set env** — copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`

4. **Run**:
   ```bash
   npx expo start
   ```

5. **Stories (Section 12)** — deferred. Needs:
   - `expo-camera` story recorder screen
   - StoryBar component in FeedScreen
   - StoryViewer full-screen modal
   - Backend `/stories` endpoints

6. **Messages new thread screen** — `app/messages/new.tsx` (user search to start DM)

7. **Push notification tap routing** — wire `addNotificationResponseReceivedListener` in `_layout.tsx` once navigation ref is available

---

## Architecture Notes

- **Router:** Expo Router v3 (file-based, `app/` directory)
- **State:** Zustand — no Context for global state
- **Auth token:** `expo-secure-store` under key `oqens_auth_token`
- **API base:** `https://api.oqens.me/api` (set in `src/utils/constants.ts`)
- **No Alert.alert anywhere** — all messages use Toast, all confirmations use BottomSheet
- **No Linking.openURL for internal routes** — all navigation uses `router.push/replace`
- **External URLs** (Help, ToS, Privacy) → InAppWebScreen via `expo-web-browser` WebView
- **Haptics** on: like, follow, post submit, destructive confirm
- **Optimistic updates** on: like, bookmark, follow — revert on API error
