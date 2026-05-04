# android.oqens — OQENS Mobile App

React Native + Expo app for [oqens.me](https://oqens.me). Connects to the same `api.oqens.me` backend as the web app.

## Stack
- Expo SDK 51 + Expo Router (file-based routing)
- React Native 0.74
- TypeScript
- EAS Build for APK/AAB

## Project Structure
```
android.oqens/
├── app/
│   ├── (auth)/          ← welcome, login, register
│   ├── (tabs)/          ← home feed, explore, create, notifications, profile
│   ├── post/[id].tsx    ← post detail + comments
│   └── profile/[username].tsx
├── components/
│   └── PostCard.tsx
├── context/
│   └── AuthContext.tsx
├── hooks/
│   └── useDebounce.ts
├── lib/
│   ├── api.ts           ← axios client + rpcQuery/rpcFunction helpers
│   └── theme.ts         ← colors, spacing, radius
├── app.json
├── eas.json
└── package.json
```

## Setup

```bash
cd android.oqens
npm install
npx expo start
```

## Build APK (preview)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Build for Play Store

```bash
eas build --platform android --profile production
```

## Notes
- Auth token stored in `expo-secure-store` under key `The Oqens-auth` (same key as web localStorage)
- All DB queries go through `POST https://api.oqens.me/api/rpc/query` — same backend as web
- Zero mock data — everything is live from the production API
