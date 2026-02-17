# Pending: iPhone App Store Steps

## Future Considerations for Apple App Store Distribution

### Current State
- App is currently a web application (React)
- Running on Vite dev server
- Accessible via browser on network

### Options for App Store Distribution

#### 1. Capacitor (Recommended - Easiest Path)
- Wraps existing React web app as native iOS app
- Minimal code changes needed
- Can still use most web code
- **Requirements:**
  - Xcode (Mac only)
  - Apple Developer account ($99/year)
  - Mac machine for building

#### 2. React Native or Expo
- Rewrite app specifically for iOS/Android
- More native feel and performance
- Larger undertaking but more appropriate for long-term
- Better performance on native platforms

#### 3. Progressive Web App (PWA)
- Keep as web app, make it "installable" on home screen
- No App Store submission needed
- Users install directly from Safari
- Easiest option but not in official App Store

### Additional Requirements (All Approaches)
- Apple Developer account ($99/year)
- Mac with Xcode (cannot build iOS apps on Windows)
- App Store review process submission
- Privacy policy and terms of service
- Supabase auth integration may need backend adjustments

### Recommended Next Steps (When Ready)
1. Set up Apple Developer account
2. Install Xcode on Mac
3. Choose approach (Capacitor recommended for quick launch)
4. Implement native wrapper
5. Configure code signing and provisioning profiles
6. Submit to App Store for review

### Timeline
- TBD - decided to defer for now
