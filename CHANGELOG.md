# Changelog

All notable changes to the OQENS Android app.

---

## [1.0.0] - 2024-01-XX (In Progress)

### ✅ Completed Features

#### Authentication
- Welcome screen with brand identity
- Email/password login
- User registration with validation
- Secure token storage using expo-secure-store
- Auto-login on app launch
- Session persistence
- Sign out functionality

#### Home Feed
- Three-tab feed (For you, Following, Popular)
- Infinite scroll with pagination (15 posts per page)
- Pull-to-refresh
- Real-time like counts
- Real-time comment counts
- Post filtering by status and visibility
- Following tab filters by followed users
- Optimistic UI updates for likes

#### Content Creation
- Create text posts
- Create link posts with URL preview
- Create code posts with monospace display
- Post type selector (text/link/code)
- Title and description fields
- Character limits
- Form validation
- Loading states

#### Social Interactions
- Like/unlike posts with optimistic updates
- Comment on posts
- View comment threads
- Follow/unfollow users
- Follower/following counts
- Real-time count updates

#### Search & Discovery
- Search users by username or display name
- Search posts by title or description
- Trending topics/tags list
- Debounced search (400ms)
- Search result categorization
- Empty states

#### Notifications
- Activity feed
- Notification types: like, comment, follow, mention
- Unread indicators
- Mark as read on view
- Time ago formatting
- Profile avatars with action badges

#### Profile
- Own profile view
- Public profile view
- Profile stats (posts, followers, following)
- User bio display
- Verified badge
- Follow/unfollow button
- Post list on profile
- Cover image placeholder

#### Post Details
- Full post view
- Comment thread
- Like/comment actions
- Author profile link
- Tag display
- Code snippet display
- Link preview
- Time ago formatting
- Comment input with keyboard handling

#### UI/UX
- Custom theme system (cream/black palette)
- Consistent spacing and radius
- Loading states
- Empty states
- Error handling
- Pull-to-refresh
- Optimistic updates
- Smooth animations
- Safe area handling
- Keyboard avoidance

#### Technical
- TypeScript throughout
- Expo Router file-based routing
- Axios with auth interceptor
- RPC query builder (mirrors web client)
- Secure token storage
- Environment configuration
- EAS Build setup
- Production-ready build profiles

---

### 🚧 Known Limitations

- No image upload yet (posts are text/link/code only)
- No edit profile screen
- No push notifications
- No deep linking
- No offline mode
- No image caching
- No video support
- No direct messaging

---

### 📋 Planned Features (v1.1.0)

- [ ] Image upload for posts
- [ ] Edit profile screen
- [ ] Push notifications via Expo Notifications
- [ ] Deep linking for posts/profiles
- [ ] Image caching
- [ ] Offline mode with local storage
- [ ] Share to other apps
- [ ] Bookmark posts
- [ ] Report content
- [ ] Block users

---

### 📋 Future Enhancements (v2.0.0)

- [ ] Video posts
- [ ] Direct messaging
- [ ] Stories
- [ ] Live streaming
- [ ] Voice notes
- [ ] Polls
- [ ] Events
- [ ] Groups
- [ ] Marketplace

---

## Build History

### Preview Builds
- None yet

### Production Builds
- None yet

---

## Notes

- App connects to production API: `https://api.oqens.me/api`
- Uses same backend as web app (oqens.me)
- Auth tokens stored securely via expo-secure-store
- All DB queries go through RPC endpoint
- Zero mock data — everything is live
