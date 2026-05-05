# OQENS Android — Developer Guide

Quick reference for developers working on the Android app.

---

## Project Structure

```
android.oqens/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth flow (welcome, login, register)
│   ├── (tabs)/            # Main app tabs
│   ├── post/[id].tsx      # Dynamic post detail
│   ├── profile/[username].tsx  # Dynamic profile
│   └── _layout.tsx        # Root navigation
├── components/            # Reusable components
├── context/              # React Context providers
├── hooks/                # Custom hooks
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   └── theme.ts         # Design tokens
├── assets/              # Images, fonts
├── app.json            # Expo config
├── eas.json            # Build config
└── package.json        # Dependencies
```

---

## Key Concepts

### Navigation (Expo Router)

File-based routing. File structure = route structure.

```typescript
// app/(tabs)/index.tsx → /(tabs)/
// app/post/[id].tsx → /post/123
// app/profile/[username].tsx → /profile/johndoe

import { useRouter } from 'expo-router'
const router = useRouter()
router.push('/post/123')
router.push('/profile/johndoe')
```

### API Client

All API calls go through `lib/api.ts`:

```typescript
import { rpcQuery, rpcFunction } from '../lib/api'

// Query builder (mirrors web awsClient)
const { data } = await rpcQuery({
  table: 'posts',
  action: 'select',
  select: 'id, title, content',
  filters: [{ type: 'eq', col: 'status', val: 'published' }],
  order: { col: 'created_at', ascending: false },
  limit: 20
})

// Call stored procedures
const counts = await rpcFunction('get_posts_counts', { 
  post_ids: ['id1', 'id2'] 
})
```

### Authentication

Managed by `context/AuthContext.tsx`:

```typescript
import { useAuth } from '../context/AuthContext'

function MyComponent() {
  const { user, session, signIn, signOut } = useAuth()
  
  if (!user) return <Text>Not logged in</Text>
  
  return <Text>Hello {user.display_name}</Text>
}
```

### Theme

Design tokens in `lib/theme.ts`:

```typescript
import { colors, spacing, radius } from '../lib/theme'

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radius.md,
  }
})
```

---

## Common Tasks

### Add a New Screen

1. Create file in `app/` directory
2. Export default component
3. Navigation is automatic

```typescript
// app/settings.tsx
export default function SettingsScreen() {
  return <View><Text>Settings</Text></View>
}

// Navigate to it
router.push('/settings')
```

### Add a New Tab

Edit `app/(tabs)/_layout.tsx`:

```typescript
<Tabs.Screen
  name="newTab"
  options={{
    title: 'New Tab',
    tabBarIcon: ({ focused }) => (
      <Ionicons name="star" size={24} />
    ),
  }}
/>
```

### Fetch Data

```typescript
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  async function load() {
    try {
      const res = await rpcQuery({
        table: 'posts',
        action: 'select',
        select: '*',
        limit: 20
      })
      setData(res.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }
  load()
}, [])
```

### Handle Forms

```typescript
const [form, setForm] = useState({ title: '', content: '' })

function update(key: string, value: string) {
  setForm(prev => ({ ...prev, [key]: value }))
}

async function submit() {
  await rpcQuery({
    table: 'posts',
    action: 'insert',
    data: form
  })
}

return (
  <>
    <TextInput value={form.title} onChangeText={v => update('title', v)} />
    <TextInput value={form.content} onChangeText={v => update('content', v)} />
    <Button onPress={submit} title="Submit" />
  </>
)
```

### Optimistic Updates

```typescript
async function handleLike(postId: string) {
  // Update UI immediately
  setLiked(true)
  setCount(prev => prev + 1)
  
  try {
    // Send to server
    await rpcQuery({
      table: 'likes',
      action: 'insert',
      data: { post_id: postId, user_id: user.id }
    })
  } catch {
    // Revert on error
    setLiked(false)
    setCount(prev => prev - 1)
  }
}
```

---

## Styling Guidelines

### Use Theme Tokens

```typescript
// ✅ Good
backgroundColor: colors.cream
padding: spacing.md
borderRadius: radius.md

// ❌ Bad
backgroundColor: '#FAF7F2'
padding: 16
borderRadius: 12
```

### Consistent Spacing

```typescript
// Use theme spacing
gap: spacing.sm    // 8
gap: spacing.md    // 16
gap: spacing.lg    // 24
gap: spacing.xl    // 32
```

### Typography

```typescript
// Headers
fontSize: 20, fontWeight: '800'

// Body
fontSize: 15, fontWeight: '400'

// Small
fontSize: 13, fontWeight: '500'
```

---

## Testing

### Run Development Build

```bash
npm start
```

### Test on Device

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios
```

### Build Preview APK

```bash
npm run build:preview
```

---

## Debugging

### View Logs

```bash
npx expo start
# Press 'j' to open debugger
```

### Common Issues

**App won't start:**
```bash
# Clear cache
npx expo start --clear
```

**Build fails:**
```bash
# Check EAS logs
eas build:list
```

**API errors:**
- Check network tab in debugger
- Verify API URL in `.env`
- Check backend is running

---

## Code Style

### TypeScript

```typescript
// Use interfaces for props
interface Props {
  post: Post
  onLike: (id: string) => void
}

// Type component
export default function PostCard({ post, onLike }: Props) {
  // ...
}
```

### Async/Await

```typescript
// ✅ Good
async function load() {
  try {
    const res = await api.get('/posts')
    setData(res.data)
  } catch (e) {
    console.error(e)
  }
}

// ❌ Bad
function load() {
  api.get('/posts').then(res => {
    setData(res.data)
  }).catch(console.error)
}
```

### Component Structure

```typescript
export default function MyScreen() {
  // 1. Hooks
  const router = useRouter()
  const { user } = useAuth()
  const [data, setData] = useState([])
  
  // 2. Effects
  useEffect(() => {
    load()
  }, [])
  
  // 3. Functions
  async function load() {
    // ...
  }
  
  // 4. Render
  return (
    <View>
      {/* ... */}
    </View>
  )
}

// 5. Styles
const styles = StyleSheet.create({
  // ...
})
```

---

## Performance Tips

### Optimize Lists

```typescript
<FlatList
  data={posts}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <PostCard post={item} />}
  removeClippedSubviews
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

### Memoize Callbacks

```typescript
const handleLike = useCallback((id: string) => {
  // ...
}, [])
```

### Lazy Load Images

```typescript
import { Image } from 'expo-image'

<Image
  source={{ uri: url }}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
/>
```

---

## Resources

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [TypeScript](https://www.typescriptlang.org/)

---

## Getting Help

1. Check this guide
2. Review existing code
3. Check Expo docs
4. Ask the team
5. Search Expo forums
