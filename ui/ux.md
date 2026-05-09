# OQENS App — Full UI/UX Redesign

## Goal
Rebuild the entire OQENS React Native (Expo) app UI from scratch. Replace the current dated purple design with a clean, minimal, light social app aesthetic. No patches — full replacement of all screens and components.

---

## Design System

**Colors** (store in `src/theme/colors.ts`, import everywhere — no hardcoded hex values):

| Token | Value | Usage |
|---|---|---|
| `bg` | `#FFFFFF` | Screen backgrounds |
| `surface` | `#F5F7FA` | Cards, inputs |
| `border` | `#E5E7EB` | Dividers, outlines |
| `accent` | `#0066FF` | CTAs, active tabs, links |
| `accentSoft` | `#EBF2FF` | Badge backgrounds, tinted chips |
| `textPrimary` | `#0A0A0F` | Headings, body |
| `textSecondary` | `#6B7280` | Timestamps, metadata |
| `textMuted` | `#9CA3AF` | Placeholders, disabled |
| `success` | `#00C9A7` | Online dot, success toast |
| `error` | `#EF4444` | Error states |

**Typography** (load via `expo-google-fonts`):
- Headings → `PlusJakartaSans_700Bold`
- Body / UI → `DMSans_400Regular` and `DMSans_500Medium`
- No other fonts. No system defaults.

**Spacing** — use an 8pt grid: `4, 8, 12, 16, 20, 24, 32, 48`

**Border radius** — `8` for inputs/cards, `12` for modals, `999` for avatars and pills

**Shadows** — one universal card shadow:
```
shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.06, shadowRadius: 4, elevation: 2
```

---

## Component Library

Build these in `src/components/ui/` before touching any screen:

**`Avatar`** — circular, sizes: `sm` (32), `md` (40), `lg` (56). Show initials fallback if image fails. Add a teal online dot variant.

**`Button`** — variants: `primary` (blue fill, white text), `secondary` (surface fill, primary text), `ghost` (no background, blue text). Sizes: `sm`, `md`, `lg`. Show `ActivityIndicator` when `loading` prop is true.

**`Input`** — white background, `border` color border, `borderFocus` on focus, `textPrimary` text, `textMuted` placeholder. Include `leftIcon` and `rightIcon` slots.

**`Card`** — white background, `border` border, `8` radius, universal shadow. Just a container.

**`Badge`** — pill shape, variants: `accent` (blue), `success` (teal), `muted` (surface). Small text, horizontal padding.

**`Skeleton`** — animated shimmer using `Animated` API. Variants: `line` (for text), `circle` (for avatars), `rect` (for post cards). Used everywhere content is loading.

**`EmptyState`** — centered icon (use `@expo/vector-icons` Feather), a heading, a subtitle, and an optional CTA button. Used when lists are empty.

**`Toast`** — bottom-anchored, slide-up animated. Variants: `success`, `error`, `info`. Auto-dismiss after 3s. Replace every single `Alert.alert()` in the codebase with this.

**`TabBar`** — custom bottom tab bar. White background, top border `#E5E7EB`. Active icon + label in `accent` blue. Inactive in `textMuted`. Label font size `12`, `DMSans_500Medium`.

---

## Screen Redesigns

Rebuild every screen with the new design system. No screen keeps old styles.

### Feed Screen
- White background, `16` horizontal padding
- Post card: white, border, 8px radius, shadow. Avatar (40) + display name (`DMSans_500Medium`, 15) + handle + timestamp (`textSecondary`, 13) in a row. Content body in `DMSans_400Regular`, 15, `textPrimary`. Action row: Like, Comment, Share icons in `textMuted` with counts. Thin `border` divider between cards.
- Show `Skeleton` rect cards (×4) while loading
- Show `EmptyState` with a "No posts yet" message if feed is empty
- Pull-to-refresh with `RefreshControl`

### Profile Screen
- Top section: large avatar (56), display name `PlusJakartaSans_700Bold` 20, handle `textSecondary` 14, bio `textMuted` 14. Stats row (Posts · Followers · Following) in clean columns.
- Action buttons using new `Button` component
- Posts grid or list below, consistent with Feed card style
- Skeleton for the whole top section while profile loads

### Explore / Search Screen
- Sticky search `Input` at top with search icon
- Default state: "Trending" section with horizontal `Badge` chips for tags
- Results: same post card or user row (avatar + name + handle + follow button)
- Empty search result → `EmptyState` with "No results for X"

### Notifications Screen
- List of notification rows: avatar (40) + description text + timestamp
- Group by Today / Earlier with `textMuted` section headers
- Unread rows have `accentSoft` background tint
- Empty → `EmptyState`

### Create Post Screen
- Clean sheet-style modal or full screen
- Large `TextInput` (multiline, no border box — just the text area, placeholder in `textMuted`)
- Toolbar at bottom: attach image, tag, character count
- `Button primary` "Post" in top-right header. Disable + show loading state while submitting.

---

## Global Rules

- Remove every `Alert.alert()`. Use the `Toast` component instead.
- Every list screen must handle: loading (Skeleton), empty (EmptyState), error (inline error message + retry button).
- All tap targets minimum `44×44` pt.
- Add `accessibilityLabel` to every interactive element — tabs, buttons, icons.
- Button styles must be consistent everywhere — only use the `Button` component, never inline TouchableOpacity with custom styles.
- Avatar sizes must only be `sm / md / lg` from the Avatar component — no ad-hoc widths.
- Tab bar label size is `12` pt everywhere, no exceptions.