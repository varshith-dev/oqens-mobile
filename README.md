# android.oqens — OQENS Mobile App

React Native + Expo app for [oqens.me](https://oqens.me). Connects to the same `api.oqens.me` backend as the web app.

## Status: ✅ Production Ready

All core features implemented and tested. Ready for beta testing and Play Store submission.

## Stack
- Expo SDK 51 + Expo Router (file-based routing)
- React Native 0.74
- TypeScript
- EAS Build for APK/AAB

## Features

### ✅ Authentication
- Welcome screen with branding
- Email/password login
- User registration
- Secure token storage (expo-secure-store)
- Auto-login on app launch

### ✅ Feed & Discovery
- Home feed with 3 tabs (For you, Following, Popular)
- Infinite scroll with pagination
- Pull-to-refresh
- Real-time like/comment counts
- Post filtering by status and visibility

### ✅ Content Creation
- Create text posts
- Create link posts with preview
- Create code posts with syntax highlighting
- Post type selector
- Character limits and validation

### ✅ Social Features
- Like/unlike posts
- Comment on posts
- Follow/unfollow users
- View user profiles
- Activity notifications
- Notification badges

### ✅ Search & Explore
- Search users by username/display name
- Search posts by title/description
- Trending topics/tags
- Real-time search with debouncing

### ✅ Profile Management
- View own profile
- View other user profiles
- Edit profile (coming soon)
- Follower/following counts
- Post count and stats

### ✅ Post Details
- Full post view with comments
- Comment thread
- Like/share actions
- Author profile link
- Tag navigation

## Project Structure
```
android.oqens/
├── app/
│   ├── (auth)/          ← welcome, login, register
│   ├── (tabs)/          ← home feed, explore, create, notifications, profile
│   ├── post/[id].tsx    ← post detail + comments
│   ├── profile/[username].tsx ← user profile
│   └── _layout.tsx      ← root navigation
├── components/
│   └── PostCard.tsx     ← reusable post component
├── context/
│   └── AuthContext.tsx  ← auth state management
├── hooks/
│   └── useDebounce.ts   ← search debouncing
├── lib/
│   ├── api.ts           ← axios client + rpcQuery/rpcFunction helpers
│   └── theme.ts         ← colors, spacing, radius
├── app.json             ← Expo configuration
├── eas.json             ← EAS Build configuration
├── BUILD.md             ← Build and deployment guide
└── package.json
```

## Quick Start

### Development

```bash
cd android.oqens
npm install
npx expo start
```

Scan QR code with Expo Go app (Android) or Camera (iOS).

### Build APK for Testing

```bash
npm install -g eas-cli
eas login
npm run build:preview
```

See [BUILD.md](./BUILD.md) for complete build and deployment guide.

---

## API Integration

All requests go through `lib/api.ts`:

```typescript
// Query builder (mirrors web awsClient pattern)
const { data } = await rpcQuery({
  table: 'posts',
  action: 'select',
  select: 'id, title, content',
  filters: [{ type: 'eq', col: 'status', val: 'published' }],
  limit: 20
})

// Call stored procedures
const result = await rpcFunction('get_posts_counts', { post_ids: ['id1', 'id2'] })
```

---

## Configuration

### Environment Variables

Create `.env` from `.env.example`:

```env
EXPO_PUBLIC_API_URL=https://api.oqens.me/api
```

### App Configuration

Edit `app.json` for:
- App name and slug
- Bundle identifiers
- Permissions
- Icons and splash screens
- EAS project ID

---

## Architecture

### Navigation
- Expo Router (file-based)
- Stack navigation for auth flow
- Tab navigation for main app
- Modal screens for post/profile details

### State Management
- React Context for auth
- Local state for UI
- No Redux/MobX needed

### Data Fetching
- Axios with interceptors
- JWT auto-injection
- Retry logic
- 30s timeout

### Storage
- expo-secure-store for auth tokens
- AsyncStorage for preferences (future)

---

## Testing

Run the app and test:
- Login/register flow
- Feed loading and scrolling
- Post creation
- Like/comment
- Search
- Notifications
- Profile viewing

---
- Auth token stored in `expo-secure-store` under key `The Oqens-auth` (same key as web localStorage)
- All DB queries go through `POST https://api.oqens.me/api/rpc/query` — same backend as web
- Zero mock data — everything is live from the production API
