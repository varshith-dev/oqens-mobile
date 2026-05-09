# OQENS v2.5.5 — Full App Build Guide
**Framework:** Expo Go (SDK 51+) · React Native · TypeScript  
**Type:** Social Community App   
**Agent instruction:** This is a ground-up build specification. Every section is a direct implementation order. Do not summarise, do not skip, do not leave placeholders. Every screen, every action, every state must be fully wired and functional.

---

## SECTION 1 — TECH STACK

Install and configure all of these before touching any screen:

```bash
# Navigation
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context

# UI & Icons
npx expo install @expo/vector-icons expo-image expo-image-picker expo-document-picker

# Fonts
npx expo install expo-font @expo-google-fonts/plus-jakarta-sans @expo-google-fonts/dm-sans

# Media
npx expo install expo-av expo-video expo-camera

# Notifications
npx expo install expo-notifications expo-device

# Deep Linking
npx expo install expo-linking

# Storage & Auth
npx expo install expo-secure-store @react-native-async-storage/async-storage

# Utilities
npx expo install expo-clipboard expo-sharing expo-web-browser expo-haptics

# Animations
npx expo install react-native-reanimated react-native-gesture-handler

# In-app browser / WebView
npx expo install expo-web-browser react-native-webview

# Others
npx expo install expo-status-bar expo-system-ui date-fns
```

---

## SECTION 2 — PROJECT STRUCTURE

```
src/
├── api/
│   ├── client.ts          ← axios instance, interceptors, token refresh
│   ├── auth.ts
│   ├── posts.ts
│   ├── users.ts
│   ├── notifications.ts
│   ├── comments.ts
│   ├── flicks.ts
│   ├── messages.ts
│   └── tags.ts
│
├── store/
│   ├── useAuthStore.ts    ← zustand: user, token, login, logout
│   ├── useFeedStore.ts    ← posts, pagination, optimistic updates
│   ├── useNotifStore.ts   ← unread count, notification list
│   └── useChatStore.ts    ← DM threads
│
├── theme/
│   ├── colors.ts          ← all color tokens
│   ├── typography.ts      ← font sizes, weights, line heights
│   ├── spacing.ts         ← 8pt grid values
│   └── index.ts           ← re-exports everything
│
├── components/
│   ├── ui/                ← base components (Button, Input, Avatar, Badge, etc.)
│   ├── post/              ← PostCard, PostActions, PostMedia, CodeBlock
│   ├── story/             ← StoryRing, StoryBar, StoryViewer
│   ├── feed/              ← FeedList, FeedSkeleton, FeedEmpty
│   ├── notification/      ← NotifRow, NotifIcon
│   ├── user/              ← UserRow, FollowButton, UserCard
│   ├── layout/            ← Header, SafeScreen, KeyboardView
│   └── shared/            ← Skeleton, EmptyState, Toast, BottomSheet, Divider
│
├── screens/
│   ├── auth/
│   │   ├── SplashScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   └── VerifyEmailScreen.tsx
│   ├── feed/
│   │   ├── FeedScreen.tsx
│   │   └── PostDetailScreen.tsx
│   ├── explore/
│   │   ├── ExploreScreen.tsx
│   │   ├── SearchResultsScreen.tsx
│   │   └── TagFeedScreen.tsx
│   ├── create/
│   │   └── CreatePostScreen.tsx
│   ├── flicks/
│   │   └── FlicksScreen.tsx
│   ├── activity/
│   │   └── ActivityScreen.tsx
│   ├── messages/
│   │   ├── InboxScreen.tsx
│   │   └── ChatScreen.tsx
│   ├── profile/
│   │   ├── ProfileScreen.tsx
│   │   ├── UserProfileScreen.tsx
│   │   ├── EditProfileScreen.tsx
│   │   ├── FollowersScreen.tsx
│   │   └── FollowingScreen.tsx
│   └── settings/
│       ├── SettingsScreen.tsx
│       ├── ChangePasswordScreen.tsx
│       ├── EmailSettingsScreen.tsx
│       ├── BlockedUsersScreen.tsx
│       ├── GetVerifiedScreen.tsx
│       └── InAppWebScreen.tsx
│
├── navigation/
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── MainTabNavigator.tsx
│   ├── FeedStack.tsx
│   ├── ExploreStack.tsx
│   ├── ProfileStack.tsx
│   ├── SettingsStack.tsx
│   └── linking.ts         ← deep link config
│
├── hooks/
│   ├── useDebounce.ts
│   ├── usePagination.ts
│   ├── useToast.ts
│   ├── usePushNotifications.ts
│   └── useDeepLink.ts
│
└── utils/
    ├── format.ts          ← formatDate, formatCount (1.2k), truncate
    ├── validators.ts
    └── constants.ts
```

---

## SECTION 3 — DESIGN TOKENS

`src/theme/colors.ts`:
```ts
export const colors = {
  bg:           '#FFFFFF',
  surface:      '#F5F7FA',
  border:       '#E5E7EB',
  accent:       '#0066FF',
  accentSoft:   '#EBF2FF',
  accentPress:  '#0052CC',
  textPrimary:  '#0A0A0F',
  textSecondary:'#6B7280',
  textMuted:    '#9CA3AF',
  textInverse:  '#FFFFFF',
  success:      '#00C9A7',
  successBg:    '#E6FAF7',
  warning:      '#F59E0B',
  warningBg:    '#FEF9EC',
  error:        '#EF4444',
  errorBg:      '#FEF2F2',
  like:         '#EF4444',
  online:       '#00C9A7',
}
```

`src/theme/typography.ts`:
```ts
export const fonts = {
  heading:  'PlusJakartaSans_700Bold',
  semibold: 'PlusJakartaSans_600SemiBold',
  body:     'DMSans_400Regular',
  medium:   'DMSans_500Medium',
}

export const fontSize = {
  xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, '2xl': 30,
}

export const lineHeight = {
  tight: 1.2, normal: 1.5, relaxed: 1.7,
}
```

`src/theme/spacing.ts`:
```ts
export const spacing = { xs:4, sm:8, md:12, base:16, lg:20, xl:24, '2xl':32, '3xl':48 }
export const radius = { sm:6, md:8, lg:12, full:999 }
export const shadow = {
  card: { shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:4, elevation:2 }
}
```

---

## SECTION 4 — DEEP LINKING (CRITICAL — DO THIS FIRST)

OQENS currently opens all links in the browser. This section fixes that entirely.

### 4.1 — app.json configuration

Add to `app.json` under `expo`:
```json
"scheme": "oqens",
"intentFilters": [
  {
    "action": "VIEW",
    "autoVerify": true,
    "data": [
      { "scheme": "https", "host": "oqens.app", "pathPrefix": "/" },
      { "scheme": "http",  "host": "oqens.app", "pathPrefix": "/" }
    ],
    "category": ["BROWSABLE", "DEFAULT"]
  }
]
```

### 4.2 — `src/navigation/linking.ts`

```ts
import * as Linking from 'expo-linking'

const prefix = Linking.createURL('/')

export const linking = {
  prefixes: [prefix, 'https://oqens.app', 'http://oqens.app'],
  config: {
    screens: {
      Main: {
        screens: {
          FeedStack: {
            screens: {
              Feed: '',
              PostDetail: 'posts/:postId',
            },
          },
          ExploreStack: {
            screens: {
              Explore: 'explore',
              SearchResults: 'search',
              TagFeed: 'tags/:tag',
            },
          },
          ProfileStack: {
            screens: {
              Profile: 'profile',
              UserProfile: 'users/:username',
              Followers: 'users/:username/followers',
              Following: 'users/:username/following',
              EditProfile: 'profile/edit',
            },
          },
          Messages: {
            screens: {
              Inbox: 'messages',
              Chat: 'messages/:threadId',
            },
          },
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          VerifyEmail: 'verify-email',
        },
      },
    },
  },
}
```

### 4.3 — RootNavigator

Pass `linking={linking}` to `<NavigationContainer>`. Every navigation action inside the app must use `navigation.navigate()` — never `Linking.openURL()` for internal routes. Any external URL (Help, ToS, Privacy, etc.) must use `expo-web-browser` `WebBrowser.openBrowserAsync(url)` — not the system browser.

### 4.4 — Handle incoming deep links when app is closed

In `App.tsx`, add:
```ts
useEffect(() => {
  const sub = Linking.addEventListener('url', ({ url }) => {
    // Navigation container handles this automatically via linking config
  })
  return () => sub.remove()
}, [])
```

---

## SECTION 5 — PUSH NOTIFICATIONS (Full Setup)

### 5.1 — Registration flow

In `src/hooks/usePushNotifications.ts`:
- On app start, call `Notifications.requestPermissionsAsync()`
- Get `ExpoPushToken` via `Notifications.getExpoPushTokenAsync()`
- POST token to `/users/me/push-token` so backend can send notifications
- Store permission status in `useAuthStore`

### 5.2 — Foreground handler

```ts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,   // use in-app Toast instead
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})
```

When a notification arrives in the foreground: show the `Toast` component (not the OS alert). Increment the `useNotifStore` unread count. Update the Activity tab badge.

### 5.3 — Background / tap handler

```ts
Notifications.addNotificationResponseReceivedListener(response => {
  const { type, postId, userId, threadId } = response.notification.request.content.data
  if (type === 'like' || type === 'comment' || type === 'mention') {
    navigation.navigate('PostDetail', { postId })
  } else if (type === 'follow') {
    navigation.navigate('UserProfile', { username: userId })
  } else if (type === 'message') {
    navigation.navigate('Chat', { threadId })
  }
})
```

### 5.4 — Badge count

Update the Activity tab icon with a red badge showing unread count from `useNotifStore`. Clear badge on ActivityScreen focus.

---

## SECTION 6 — STATE MANAGEMENT

Use **Zustand** (install: `npm install zustand`). No Redux. No Context for global state.

### `useAuthStore`
```ts
interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email, password) => Promise<void>
  register: (data) => Promise<void>
  logout: () => void
  updateUser: (partial: Partial<User>) => void
  refreshUser: () => Promise<void>
}
```
Persist `token` and `user` to `expo-secure-store`. On app start, read from SecureStore — if token exists and is valid, go to Main; else go to Auth.

### `useFeedStore`
```ts
interface FeedStore {
  posts: Post[]
  page: number
  hasMore: boolean
  isLoading: boolean
  isRefreshing: boolean
  activeTab: 'for_you' | 'following' | 'popular'
  fetchFeed: () => Promise<void>
  refreshFeed: () => Promise<void>
  loadMore: () => Promise<void>
  toggleLike: (postId: string) => void       // optimistic
  toggleBookmark: (postId: string) => void   // optimistic
  setActiveTab: (tab) => void
}
```

### `useNotifStore`
```ts
interface NotifStore {
  notifications: Notification[]
  unreadCount: number
  fetchNotifications: () => Promise<void>
  markAllRead: () => Promise<void>
}
```

---

## SECTION 7 — API CLIENT

`src/api/client.ts`:
```ts
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const client = axios.create({
  baseURL: 'https://api.oqens.app/v1',   // replace with actual base URL
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — token expired
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token')
      // trigger logout in useAuthStore
    }
    return Promise.reject(error)
  }
)

export default client
```

---

## SECTION 8 — AUTH SCREENS

### SplashScreen
- Show OQENS logo centered on white background for 2s
- Check SecureStore for token
- If valid token → navigate to Main (replace)
- If no token → navigate to Onboarding (replace)
- No back button ever allowed here

### OnboardingScreen
- 3 slides using a horizontal FlatList with `pagingEnabled`
- Slide 1: "Share what you build" — illustration placeholder + heading + subtitle
- Slide 2: "Discover developers" — same
- Slide 3: "Grow your community" — same
- Bottom: dots indicator + "Get Started" button (primary) + "I already have an account" text link
- "Get Started" → RegisterScreen
- Text link → LoginScreen
- Skip button top-right → LoginScreen

### LoginScreen
- OQENS wordmark top-center
- Email Input (keyboardType email, autoCapitalize none)
- Password Input (secureTextEntry, show/hide toggle)
- "Forgot password?" text link right-aligned → ForgotPasswordScreen
- "Login" Button primary — disabled until both fields non-empty, shows spinner during API call
- Divider "or"
- Google OAuth button (if backend supports — show as secondary button with Google icon)
- Bottom: "Don't have an account? Sign up" → RegisterScreen
- On success: save token to SecureStore, update useAuthStore, navigate to Main (replace)
- On error: show Toast error with API message

### RegisterScreen
- Display Name, Username (validate: lowercase, no spaces, 3-20 chars), Email, Password, Confirm Password
- Inline field-level validation errors (shown below each field on blur)
- "Create Account" Button primary — disabled until all valid
- On success: navigate to VerifyEmailScreen
- On error: show Toast

### ForgotPasswordScreen
- Email input
- "Send Reset Link" button → calls API → shows Toast "Check your email" → pops back

### VerifyEmailScreen
- Instruction text: "We sent a code to {email}"
- 6-box OTP input (build a custom row of 6 TextInput boxes, auto-focus next on input, auto-submit on 6th digit filled)
- "Verify" button
- "Resend code" text button (with 60s cooldown timer)
- On success → navigate to Main (replace)

---

## SECTION 9 — FEED SCREEN

### Layout
- Header: "OQENS" wordmark (PlusJakartaSans_700Bold, 22) left + notification bell icon right (with unread badge dot)
- Sticky tab row below header: "For You" | "Following" | "Popular" — active tab has `#0066FF` bottom border + text, inactive `textMuted`. Switching tabs re-fetches with the correct feed type.
- Story bar (horizontal FlatList, see Section 12)
- FlatList of PostCards
- Pull-to-refresh
- Infinite scroll (load next page at 30% from bottom)

### PostCard component (`src/components/post/PostCard.tsx`)

Structure:
```
[Avatar 40] [DisplayName · @handle · timestamp]      [··· menu]
[Post title if exists — PlusJakartaSans_600SemiBold, 16]
[Post body — DMSans_400Regular, 15, maxLines 4 with "Read more" expand]
[Media: Image / Video / CodeBlock depending on post type]
[Tags row — horizontal scrollable badge pills]
─────────────────────────────────────────────
[❤ Like count] [💬 Comment count] [↗ Share]  [🔖 Bookmark]
```

Rules:
- Avatar tap → UserProfileScreen
- Username tap → UserProfileScreen
- Post body / title tap → PostDetailScreen
- `···` tap → BottomSheet with: "Report Post", "Copy Link", "Hide Post", (if own post: "Delete Post", "Edit Post")
- Like button: optimistic toggle. Filled red heart when liked, outline when not. Count updates immediately.
- Comment button: navigate to PostDetailScreen with comments scroll focused
- Share: call `expo-sharing` or `Share.share({ url: 'https://oqens.app/posts/{id}' })`
- Bookmark: optimistic toggle. Filled blue bookmark when saved, outline when not.
- Tags: each tag badge tap → TagFeedScreen

### Media rendering
- **Image post:** use `expo-image` with `contentFit: 'cover'`, aspect ratio 16:9, border radius 8. Loading: blurred placeholder. Error: gray fallback with image icon.
- **Video post:** use `expo-av` Video component, tap to play/pause, show play icon overlay when paused.
- **Code post:** render a dark surface Card (`#1E1E2E` background) with language label top-right, code in monospace font, copy-to-clipboard icon top-right corner.
- **Article post:** show a gray surface banner with doc icon + "Article" label. Body text previews below.

### Loading state
Show 4 skeleton PostCard placeholders: gray rounded rect for avatar, two lines for name/handle, three lines for body, full-width rect for image area.

### Empty state
"Your feed is empty. Follow people or explore trending posts." with an Explore button.

---

## SECTION 10 — POST DETAIL SCREEN

Route: `PostDetailScreen` receives `{ postId: string }`

Fetch full post data on mount (even if partial data passed via params — always fetch full to get latest likes/comments).

Layout:
- Header: back arrow (black) + "Post" title (black) + share icon right
- ScrollView containing full PostCard (non-truncated body, full image)
- Like row with total count
- Divider
- "Comments" section header + count
- FlatList of CommentRows (nested inside ScrollView using `scrollEnabled={false}` on FlatList)
- Sticky comment input bar at the bottom (above keyboard)

### CommentRow
```
[Avatar 36] [DisplayName DMSans_500Medium 14]  [timestamp textSecondary 12]
             [Comment body DMSans_400Regular 14]
             [Reply · Like count]
```
- Long press on comment → BottomSheet: "Reply", "Copy", "Report", (own: "Delete")
- Reply tap → focus comment input with "@username " pre-filled

### Comment input bar
- Fixed at bottom, white background, top border
- TextInput (multiline, max 500 chars, borderless, placeholder "Add a comment…")
- Send icon button (blue, disabled when empty)
- On send: POST to API, optimistically append to list, clear input, trigger haptic feedback

---

## SECTION 11 — CREATE POST SCREEN (Modal)

Opened as a full-screen modal from the `+` tab button.

### Header
- Left: "Cancel" text button → dismiss modal
- Center: "New Post" heading
- Right: "Draft" text button (saves locally) + "Post" primary button (disabled until valid)

### Post type selector
Segmented 3-tab row: Media | Article | Code
- Active: `#0066FF` border + text
- Inactive: `#E5E7EB` border + `textMuted` text

### Media tab
- Title Input (optional, placeholder "Add a title…", borderless, large font)
- Media picker area: tapping opens action sheet "Choose from Gallery" / "Take Photo" / "Paste URL". Shows image/video thumbnail preview with remove (×) button after selection.
- Caption TextInput (multiline, "What's on your mind?", 500 char max, char counter bottom-right)
- Tags input: text field that adds badge chips on spacebar/comma press. Max 8 tags. Each chip has × to remove.
- Visibility toggle: Public | Private (segmented)

### Article tab
- Title Input (required, placeholder "Article title…", large font)
- Body TextInput (multiline, min height 200, "Write your article…", no char limit)
- Tags + Visibility (same as Media)

### Code tab
- Language picker: tapping opens a BottomSheet list: JavaScript, TypeScript, Python, Rust, Go, Java, Kotlin, Swift, C++, HTML, CSS, SQL, Other
- Code TextInput (monospace font, dark surface `#1E1E2E`, white text, multiline, "Paste your code here…")
- Caption (optional)
- Tags + Visibility

### Submit logic
- Validate required fields per tab (Media: caption required; Article: title + body required; Code: language + code required)
- On "Post" press: show loading spinner on button, call POST /posts API with FormData (for media) or JSON (for article/code)
- On success: dismiss modal, show Toast "Post published!", trigger feed refresh
- On error: show Toast error, keep modal open

### Draft logic
- "Draft" button saves current form state to AsyncStorage under `oqens_drafts` array
- Show Toast "Draft saved"
- Draft is loaded when user opens Create Post and a draft exists — show banner "You have a saved draft" with "Restore" and "Discard" buttons

---

## SECTION 12 — STORIES (Story Bar + Story Viewer)

### StoryBar (horizontal FlatList in FeedScreen)
- Sits between the tab row and the post feed
- First item: own avatar with a `+` icon — tap → camera to create a story
- Subsequent items: other users' avatars with a colored ring (blue if unseen, gray if seen)
- Display name below avatar (truncated to 1 line, 10px)
- Tap a ring → opens StoryViewer

### StoryViewer (full-screen modal)
- Full screen image/video with gradient overlay
- Top: progress bars (one per story segment, animate from 0→100% over 5s each)
- Top-left: avatar + username + "5h ago"
- Top-right: × close button
- Tap left half → previous story; tap right half → next story
- Swipe down → dismiss
- Auto-advance after 5s per segment
- Bottom: reply input bar (same as comment input) — sends a DM to that user

### Story creation
- Open camera using `expo-camera`
- Capture photo or hold for video (max 15s)
- Basic edit: add text overlay, add sticker (emoji picker)
- "Share to Story" button → POST /stories → shows in own story ring

---

## SECTION 13 — EXPLORE SCREEN

### Default state (no query)
- Search input bar at top (real TextInput, not decorative)
- "Trending Topics" section — top 10 hashtags as numbered list rows (rank number + tag + post count + chevron). Tap → TagFeedScreen
- "Suggested People" section — horizontal scroll of UserCard components (avatar + name + follow button)
- "Popular Posts" section — standard PostCard list

### Active search (query.length > 0)
- Debounce 400ms then call GET /search?q={query}&type=all
- Show segmented filter: All | People | Posts | Tags
- FlatList of mixed results:
  - **UserRow:** avatar (40) + name + handle + Follow button. Tap → UserProfileScreen.
  - **PostCard:** same as feed. Tap → PostDetailScreen.
  - **TagRow:** # icon + tag name + post count + chevron. Tap → TagFeedScreen.
- Highlight the query match in result text (bold the matched substring)
- Clear (×) button inside input when non-empty
- Recent searches: stored in AsyncStorage, shown as chips below input before typing

### TagFeedScreen
Route params: `{ tag: string }`
- Header: `#{tag}` + post count subtitle
- Standard PostCard FlatList filtered by that tag
- Loading skeleton + empty state

---

## SECTION 14 — ACTIVITY SCREEN

Fetch GET /notifications on mount and on focus.

### Notification row layout
```
[Avatar 40 + small icon badge]  [Description text]  [timestamp]
```

Icon badge (16×16, overlaps bottom-right of avatar):
- Like → red heart
- Comment → blue chat
- Follow → teal person-add
- Mention → yellow @ symbol
- System → gray bell

Description text (DMSans_400Regular, 14):
- Like: "**{name}** liked your post"
- Comment: "**{name}** commented: "{preview}""
- Follow: "**{name}** started following you"
- Mention: "**{name}** mentioned you in a post"

Unread rows have `#F5F7FA` tinted background.

Section headers: "Today" and "Earlier" — `textMuted` 11px uppercase.

On row tap:
- Like/Comment/Mention → PostDetailScreen
- Follow → UserProfileScreen

Mark all read: call POST /notifications/read-all on screen focus. Reset `useNotifStore.unreadCount` to 0. Clear tab bar badge.

Loading: 6 skeleton notification rows.
Empty: bell icon, "All quiet here", subtitle "Activity from your posts and followers appears here".

---

## SECTION 15 — MESSAGES / DMs

### InboxScreen
- Header: "Messages" + compose icon (top right) → open user search to start new DM
- FlatList of ThreadRows:
  ```
  [Avatar 44 + online dot]  [Name + last message preview]  [timestamp + unread badge]
  ```
- Unread threads: name in `DMSans_500Medium`, thread has unread count badge
- Tap → ChatScreen

### ChatScreen
Route: `{ threadId: string, user: User }`

- Header: avatar (32) + username — tapping navigates to UserProfileScreen
- `FlatList` (inverted) of message bubbles
  - Own messages: right-aligned, `#0066FF` background, white text, border-radius: 18 18 4 18
  - Other messages: left-aligned, `#F5F7FA` background, `textPrimary` text, border-radius: 18 18 18 4
  - Timestamp shown below message group (not per bubble)
  - Image messages: show thumbnail, tap to view full screen
- Sticky input bar at bottom: TextInput + attachment icon + send button
- Long press message → BottomSheet: "Copy", "Reply", "Delete" (own only)
- Real-time: poll GET /messages/{threadId} every 5s OR use WebSocket if backend supports it

---

## SECTION 16 — PROFILE SCREEN (Own)

### Layout
```
[Cover photo area — 120pt height, #F5F7FA if none, tap to update]
[Avatar 72, circular, overlapping cover bottom, tap to update]
[Display name — PlusJakartaSans_700Bold 20]  [✓ if verified]
[@handle — textSecondary 14]
[Bio — DMSans 14, textSecondary, up to 3 lines]
[Website link — if set, blue text, tap opens WebBrowser]
─────────────────────────────────────
[Posts: 20]   [Followers: 47]   [Following: 6]
(each column tappable — Posts scrolls to grid, Followers/Following → list screens)
─────────────────────────────────────
[Edit Profile button — secondary full width]
─────────────────────────────────────
Posts tab | Liked tab | Saved tab    ← segmented control
[Grid of post thumbnails (3 col) or List toggle]
```

### Updating avatar/cover
Tap avatar → action sheet: "Take Photo" / "Choose from Gallery" / "Remove Photo"
Use `expo-image-picker` → upload to API → update store → refresh UI.

---

## SECTION 17 — USER PROFILE SCREEN

Same as ProfileScreen but:
- No edit access
- Show Follow/Unfollow button instead of "Edit Profile"
- Follow button logic:
  - Not following → blue "Follow" primary button
  - Following → white "Following" secondary button. Tap → confirm unfollow via bottom sheet.
  - If user follows you → show "Follows you" badge next to handle
- Header right: `···` → Report User / Block User
- Blocked state: if user is blocked, show "You have blocked this user" with Unblock button, hide all posts

---

## SECTION 18 — EDIT PROFILE SCREEN

All fields are native. Zero web redirects.

Fields:
- Avatar (tappable image picker)
- Cover Photo (tappable image picker)
- Display Name (Input, required)
- Username (Input, required, lowercase, no special chars, 3–20 chars, show availability check with a green tick or red × after 500ms debounce calling GET /users/check-username)
- Bio (Input multiline, max 160 chars, char counter)
- Website (Input, URL validation)

Header right: "Save" — disabled if no changes made, shows spinner during call.

On save success: Toast "Profile updated", pop back, call `useAuthStore.refreshUser()`.
On error: Toast with error message.

---

## SECTION 19 — FOLLOWERS / FOLLOWING SCREENS

Both share the same component, differentiated by route param `type`.

UserRow:
```
[Avatar 44]  [DisplayName DMSans_500Medium 15]   [Follow / Following button]
             [@handle textSecondary 13]
```

- If `type === 'followers'`: list users who follow the profile being viewed
- If `type === 'following'`: list users the profile is following
- Own profile followers/following: Follow back buttons visible for users not followed back
- Other profile: standard follow/unfollow
- Search bar at top to filter the list locally
- Empty state per type

---

## SECTION 20 — FLICKS SCREEN

Full-screen vertical video feed (TikTok/Reels style).

```
FlatList (vertical, pagingEnabled, showsVerticalScrollIndicator: false)
  └── FlickItem (each full screen)
       ├── expo-av Video (cover, muted by default, tap to toggle mute)
       ├── Gradient overlay bottom half
       ├── Bottom-left: [Avatar 36] [username] [caption — 2 lines max, "more" expand]
       │                [Tags row]
       └── Bottom-right: [Like icon + count] [Comment icon + count] [Share icon]
                          [vertical stack, white icons]
```

- Auto-play when item scrolls into view (use `onViewableItemsChanged`)
- Auto-pause when out of view
- Mute button top-right (persists across items)
- Tapping anywhere on video toggles play/pause (not mute)
- Comment icon → opens comments bottom sheet (pulls from same PostDetail comments)
- Share → `Share.share()`
- Double-tap video → like animation (red heart burst) + toggles like

Create Flick: tapping `+` tab and choosing "Flick" → opens camera recorder (expo-camera), max 60s, with basic trim, caption + tags input, then submit.

---

## SECTION 21 — SETTINGS SCREEN

Zero web redirects for anything in the list. Only Help, ToS, Privacy open in-app WebView.

```
[User row — avatar + name + handle → navigates to EditProfileScreen]

ACCOUNT
  Edit Profile          → EditProfileScreen
  Change Password       → ChangePasswordScreen
  Email Settings        → EmailSettingsScreen
  Get Verified          → GetVerifiedScreen
  Blocked Users         → BlockedUsersScreen

NOTIFICATIONS
  Push Notifications    → Toggle (expo-notifications permission check, save to API)
  Email Notifications   → Toggle (save to API)
  Notification Preview  → Toggle (show preview vs "New notification")

PRIVACY
  Private Account       → Toggle (save to API — locks profile to followers only)
  Show Online Status    → Toggle

APPEARANCE
  Language              → Picker (currently just English, but show the picker)

SUPPORT
  Help Center           → InAppWebScreen (url: 'https://help.oqens.app')
  Terms of Service      → InAppWebScreen (url: 'https://oqens.app/terms')
  Privacy Policy        → InAppWebScreen (url: 'https://oqens.app/privacy')
  About OQENS           → simple screen: version, credits, socials

ACCOUNT ACTIONS
  Log Out               → Bottom sheet confirmation → logout()
  Delete Account        → Bottom sheet (type "DELETE" to confirm) → API call → logout
```

Section headers: `textMuted` 11px uppercase with `surface` background strip.

---

## SECTION 22 — CHANGE PASSWORD SCREEN

Fields:
- Current Password (secureTextEntry + show/hide)
- New Password (secureTextEntry + show/hide)
- Confirm New Password (secureTextEntry + show/hide)

Inline validation (shown below field on blur):
- New password: min 8 chars, 1 uppercase, 1 number
- Confirm: must match new

"Update Password" button: disabled until all valid. Spinner during call.
On success: Toast "Password updated", pop back.
On error: Toast.

---

## SECTION 23 — GET VERIFIED SCREEN

Native form — not a web redirect.

Fields:
- Reason for verification (Picker: Developer, Creator, Company, Public Figure, Other)
- Full legal name (Input)
- Proof link (Input, URL — GitHub profile, LinkedIn, company website, etc.)
- Optional bio / context (TextInput multiline)

Submit button: calls POST /verification-requests. On success: Toast "Request submitted, we'll review within 7 days". Disable submit button after successful submission.

---

## SECTION 24 — BLOCKED USERS SCREEN

List of blocked users from GET /users/blocked.

Each row: Avatar + name + handle + "Unblock" ghost button (red text).
Tap "Unblock" → bottom sheet confirmation → DELETE /users/blocked/{id} → remove from list.
Empty state: "You haven't blocked anyone".

---

## SECTION 25 — IN-APP WEB SCREEN

Used for Help, ToS, Privacy — never the system browser.

```tsx
// InAppWebScreen
import { WebView } from 'react-native-webview'

// Route params: { url: string, title: string }
// Header: back arrow + title
// Full screen WebView loading the URL
// Loading: show activity indicator centered
// Error: show error message with "Retry" button
```

---

## SECTION 26 — SHARED COMPONENTS SPEC

Build all of these in `src/components/` before building any screen.

### `<Button>`
Props: `variant` (primary|secondary|ghost|danger), `size` (sm|md|lg), `loading`, `disabled`, `onPress`, `leftIcon`, `rightIcon`, `fullWidth`
- primary: `#0066FF` bg, white text
- secondary: `surface` bg, `textPrimary` text, `border` border
- ghost: transparent bg, `#0066FF` text
- danger: `#EF4444` bg, white text
- loading: shows `ActivityIndicator` in button color, hides label
- min height: 44pt always

### `<Input>`
Props: `label`, `error`, `leftIcon`, `rightIcon`, `secureEntry` (with toggle), all TextInput props
- White bg, `border` border, radius 8
- Focus: `#0066FF` border
- Error: `#EF4444` border + red error text below
- Label: `DMSans_500Medium` 13 above field

### `<Avatar>`
Props: `uri`, `name`, `size` (sm:32|md:40|lg:56|xl:72), `online`
- Shows image if uri exists, else initials on `accentSoft` bg
- `online` prop: teal dot bottom-right (8×8)
- Error fallback: initials

### `<Badge>`
Props: `label`, `variant` (accent|success|warning|error|muted), `size` (sm|md)
- Pill shape, horizontal padding, DMSans_500Medium

### `<Skeleton>`
Props: `width`, `height`, `radius`, `variant` (line|circle|rect)
- Animated shimmer using Reanimated `useSharedValue` + `withRepeat`
- Colors: `#E5E7EB` → `#F5F7FA` → `#E5E7EB`

### `<EmptyState>`
Props: `icon` (Feather icon name), `title`, `subtitle`, `action` ({ label, onPress })
- Centered, `textMuted` icon (48), heading `PlusJakartaSans_600SemiBold` 18, subtitle `DMSans` 14 `textSecondary`, optional Button below

### `<Toast>`
Global singleton. Call via `useToast().show({ message, type, duration })`.
- Slides up from bottom (Reanimated), auto-dismiss after 3s
- `type`: success (teal bg), error (red bg), info (blue bg), neutral (dark bg)
- Show above tab bar

### `<BottomSheet>`
Props: `visible`, `onClose`, `children`
- Dark overlay, white sheet slides up from bottom
- Handle bar at top, dismiss on overlay tap or swipe down
- Used for all confirmation actions and context menus

### `<FollowButton>`
Props: `userId`, `isFollowing`, `size`
- Manages its own loading state
- Primary "Follow" when not following, Secondary "Following" when following
- On "Following" tap → BottomSheet to confirm unfollow

---

## SECTION 27 — GLOBAL RULES (ENFORCE EVERYWHERE)

- **No `Alert.alert()` anywhere.** Use `Toast` for messages, `BottomSheet` for confirmations.
- **No `Linking.openURL()` for internal routes.** Use `navigation.navigate()` only.
- **No external browser for legal/help pages.** Use `InAppWebScreen`.
- **Every API call: loading → success → error states wired.** No silent failures.
- **Every list: loading skeleton → data → empty state → error + retry.**
- **All tap targets minimum 44×44pt.**
- **`accessibilityLabel` on every interactive element.**
- **`KeyboardAvoidingView` on every screen with inputs** (behavior: `padding` on Android).
- **Haptic feedback** (`expo-haptics`) on: like, follow, post submit, destructive confirm.
- **Optimistic updates** on: like, bookmark, follow. Revert on API error with Toast.
- **Image loading**: always use `expo-image` with `placeholder` prop (blurred hash or gray). Never raw `<Image>`.

---

## SECTION 28 — IMPLEMENTATION ORDER

Follow this exactly. Each step depends on the previous.

```
Step 1  → Design tokens (Section 3)
Step 2  → API client + Zustand stores (Sections 6 & 7)
Step 3  → Deep linking config (Section 4)
Step 4  → Push notification setup (Section 5)
Step 5  → All shared components (Section 26)
Step 6  → Navigation structure — all stacks wired (Section 2 + linking)
Step 7  → Auth screens: Splash → Onboarding → Login → Register → Verify (Section 8)
Step 8  → Feed Screen + PostCard component (Section 9)
Step 9  → Post Detail Screen + comments (Section 10)
Step 10 → Create Post modal — all 3 types (Section 11)
Step 11 → Story bar + StoryViewer (Section 12)
Step 12 → Explore + Search + TagFeed (Section 13)
Step 13 → Activity screen (Section 14)
Step 14 → Profile Screen (Section 16)
Step 15 → User Profile Screen (Section 17)
Step 16 → Edit Profile Screen (Section 18)
Step 17 → Followers / Following screens (Section 19)
Step 18 → Flicks screen (Section 20)
Step 19 → Messages — Inbox + Chat (Section 15)
Step 20 → Settings screen (Section 21)
Step 21 → Change Password (Section 22)
Step 22 → Get Verified (Section 23)
Step 23 → Blocked Users (Section 24)
Step 24 → InAppWebScreen (Section 25)
Step 25 → Global audit: remove all Alert.alert, all web redirects, all placeholders
Step 26 → Test every deep link route manually
Step 27 → Test push notification tap routing for all types
```