# OQENS Android — Deployment Checklist

Pre-flight checklist before building and releasing the Android app.

---

## ✅ Pre-Build Checklist

### Code Quality
- [x] All TypeScript files compile without errors
- [x] No unused imports or variables
- [x] Consistent code formatting
- [x] All components have proper types
- [x] Error boundaries in place

### Configuration
- [x] `app.json` configured correctly
  - [x] App name: "OQENS"
  - [x] Bundle ID: `me.oqens.app`
  - [x] Version: `1.0.0`
  - [x] Permissions listed
  - [x] Icons and splash screen
  - [x] EAS project ID set
- [x] `eas.json` build profiles configured
  - [x] Preview (APK)
  - [x] Production (AAB)
- [x] `.env` file created with API URL
- [x] API endpoint verified: `https://api.oqens.me/api`

### Features Implemented
- [x] Authentication (login, register, logout)
- [x] Home feed with tabs
- [x] Post creation (text, link, code)
- [x] Like/comment functionality
- [x] Search and explore
- [x] Notifications
- [x] User profiles
- [x] Follow/unfollow
- [x] Post details with comments

### Testing
- [ ] Test on Android emulator
- [ ] Test on physical Android device
- [ ] Test all auth flows
- [ ] Test feed loading and scrolling
- [ ] Test post creation
- [ ] Test social interactions
- [ ] Test search functionality
- [ ] Test profile viewing
- [ ] Test notifications
- [ ] Test error states
- [ ] Test offline behavior

---

## 🔨 Build Steps

### 1. Install Dependencies

```bash
cd android.oqens
npm install
```

### 2. Verify Configuration

```bash
# Check app.json
cat app.json | grep version
cat app.json | grep package

# Check API URL
cat .env
```

### 3. Login to EAS

```bash
eas login
```

### 4. Build Preview APK (Testing)

```bash
npm run build:preview
```

Or:

```bash
eas build --platform android --profile preview
```

**Expected output:**
- Build URL
- QR code to track progress
- APK download link when complete

### 5. Test Preview Build

1. Download APK from build URL
2. Install on test device
3. Run through testing checklist
4. Fix any issues
5. Rebuild if needed

### 6. Build Production AAB (Play Store)

```bash
eas build --platform android --profile production
```

**Expected output:**
- Build URL
- AAB download link when complete

---

## 📱 Play Store Submission

### Prerequisites
- [ ] Google Play Console account ($25 one-time fee)
- [ ] App created in Play Console
- [ ] Store listing prepared
- [ ] Privacy policy URL
- [ ] Screenshots (phone + tablet)
- [ ] Feature graphic (1024x500)
- [ ] App icon (512x512)

### Store Listing Content

**Short Description** (80 chars max):
```
Connect with developers. Share code. Build together.
```

**Full Description** (4000 chars max):
```
OQENS is the social platform built for developers.

FEATURES:
• Share code snippets, links, and ideas
• Follow developers and stay updated
• Discover trending topics and projects
• Like, comment, and engage with the community
• Search for users and content
• Get notified of activity

BUILT FOR DEVELOPERS:
• Clean, distraction-free interface
• Code syntax highlighting
• Link previews
• Tag-based discovery
• Fast and responsive

Join the developer community on OQENS.

Connect. Share. Build together.
```

**Category**: Social

**Content Rating**: Everyone

**Privacy Policy**: https://oqens.me/privacy

### Screenshots Needed
- [ ] Home feed
- [ ] Post detail
- [ ] Create post
- [ ] User profile
- [ ] Search/explore
- [ ] Notifications

### Submission Steps

1. **Upload AAB**
   - Go to Play Console → Your App → Production
   - Create new release
   - Upload AAB file
   - Add release notes

2. **Complete Store Listing**
   - Add app description
   - Upload screenshots
   - Add feature graphic
   - Set category and tags

3. **Set Content Rating**
   - Complete questionnaire
   - Get rating certificate

4. **Review and Publish**
   - Review all sections
   - Submit for review
   - Wait for approval (1-3 days)

---

## 🚀 Post-Launch

### Monitoring
- [ ] Set up crash reporting (Sentry/Bugsnag)
- [ ] Monitor Play Console reviews
- [ ] Track download metrics
- [ ] Monitor API error rates
- [ ] Check user feedback

### Updates
- [ ] Plan v1.1.0 features
- [ ] Set up CI/CD pipeline
- [ ] Create update schedule
- [ ] Prepare release notes template

---

## 📊 Success Metrics

Track these after launch:
- Downloads
- Active users (DAU/MAU)
- Retention rate (D1, D7, D30)
- Crash-free rate (target: >99%)
- Average session duration
- Posts created per user
- Engagement rate (likes, comments)

---

## 🐛 Known Issues

None currently. Update this section as issues are discovered.

---

## 📞 Support

### For Build Issues
- Check [EAS Build docs](https://docs.expo.dev/build/introduction/)
- Review build logs in EAS dashboard
- Check Expo forums

### For App Issues
- Check backend API status
- Review app logs
- Test on different devices
- Check network connectivity

---

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Core features implemented
- Ready for beta testing

---

## Next Steps

1. ✅ Complete pre-build checklist
2. ⏳ Build preview APK
3. ⏳ Test on devices
4. ⏳ Build production AAB
5. ⏳ Submit to Play Store
6. ⏳ Monitor and iterate

---

**Last Updated**: 2024-01-XX
**Status**: Ready for preview build
