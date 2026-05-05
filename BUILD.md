# OQENS Android App — Build Guide

Complete guide for building and deploying the OQENS mobile app.

---

## Prerequisites

1. **Node.js** (v18+)
2. **npm** or **yarn**
3. **Expo CLI** (installed globally)
4. **EAS CLI** (for building)
5. **Expo account** (free tier works)

```bash
npm install -g expo-cli eas-cli
```

---

## Initial Setup

### 1. Install Dependencies

```bash
cd android.oqens
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update if needed:

```bash
cp .env.example .env
```

Default API URL: `https://api.oqens.me/api`

### 3. Login to Expo

```bash
eas login
```

Use your Expo account credentials.

---

## Development

### Run on Android Emulator

```bash
npm run android
```

### Run on iOS Simulator (macOS only)

```bash
npm run ios
```

### Run with Expo Go

```bash
npm start
```

Then scan the QR code with:
- **Android**: Expo Go app
- **iOS**: Camera app

---

## Building APK (Preview/Testing)

### 1. Build Preview APK

```bash
npm run build:preview
```

Or directly:

```bash
eas build --platform android --profile preview
```

This creates an APK you can install on any Android device.

### 2. Download APK

After build completes:
1. Go to the build URL shown in terminal
2. Download the APK
3. Transfer to your Android device
4. Install (enable "Install from unknown sources" if needed)

---

## Building for Google Play Store

### 1. Configure Production Build

The `eas.json` is already configured for production builds.

### 2. Build AAB (Android App Bundle)

```bash
eas build --platform android --profile production
```

This creates an `.aab` file optimized for Play Store.

### 3. Submit to Play Store

#### Option A: Manual Upload

1. Download the `.aab` from EAS dashboard
2. Go to [Google Play Console](https://play.google.com/console)
3. Create a new app or select existing
4. Upload the `.aab` under "Production" or "Internal Testing"

#### Option B: Automated Submit

```bash
npm run submit
```

Or:

```bash
eas submit --platform android
```

You'll need:
- Google Play Console account
- Service account JSON key
- App already created in Play Console

---

## Build Profiles

### Development
- Development client with debugging
- Internal distribution only
- Fast iteration

### Preview
- Production-like build
- APK format (easy to share)
- Internal testing
- No app store submission

### Production
- Optimized for release
- AAB format (Play Store requirement)
- Code signing included
- Ready for store submission

---

## Version Management

Update version in `app.json`:

```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    }
  }
}
```

- `version`: User-facing version (1.0.0, 1.1.0, etc.)
- `versionCode`: Integer that must increment with each release

---

## Troubleshooting

### Build Fails

1. Check EAS build logs in terminal
2. Verify `eas.json` configuration
3. Ensure all dependencies are compatible with Expo SDK 51

### App Crashes on Launch

1. Check if API URL is correct in `app.json`
2. Verify backend is accessible
3. Check Expo logs: `npx expo start --clear`

### Authentication Issues

1. Verify API endpoint: `https://api.oqens.me/api`
2. Check network connectivity
3. Clear app data and reinstall

### Build Takes Too Long

- EAS builds run on cloud servers
- First build: 10-20 minutes
- Subsequent builds: 5-10 minutes
- Check build queue: `eas build:list`

---

## Testing Checklist

Before releasing:

- [ ] Test login/register flow
- [ ] Test feed loading and scrolling
- [ ] Test post creation (text, link, code)
- [ ] Test like/comment functionality
- [ ] Test profile viewing
- [ ] Test search/explore
- [ ] Test notifications
- [ ] Test follow/unfollow
- [ ] Test deep links (post/profile URLs)
- [ ] Test on different Android versions
- [ ] Test on different screen sizes
- [ ] Test offline behavior
- [ ] Test app updates

---

## Deployment Workflow

### Internal Testing

1. Build preview APK
2. Share with team via link
3. Collect feedback
4. Iterate

### Beta Testing (Play Store)

1. Build production AAB
2. Upload to "Internal Testing" track
3. Add testers via email
4. Collect feedback
5. Fix issues

### Production Release

1. Build production AAB
2. Upload to "Production" track
3. Fill out store listing
4. Submit for review
5. Monitor crash reports

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: EAS Build
on:
  push:
    branches: [main]
    paths:
      - 'android.oqens/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install -g eas-cli
      - run: cd android.oqens && npm install
      - run: eas build --platform android --profile preview --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Google Play Console](https://play.google.com/console)
- [React Native](https://reactnative.dev/)

---

## Support

For issues:
1. Check [Expo Forums](https://forums.expo.dev/)
2. Review [GitHub Issues](https://github.com/expo/expo/issues)
3. Contact team via internal channels
