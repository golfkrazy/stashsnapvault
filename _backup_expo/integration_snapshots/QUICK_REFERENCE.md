# Integration Quick Reference Checklist

**Project:** StashSnap Auth Integration  
**Template:** E2E (React + Supabase Auth)  
**Status:** Ready to Begin

---

## ✅ PRE-INTEGRATION CHECKLIST

### Analysis Complete
- [x] Template architecture analyzed
- [x] Target project architecture analyzed
- [x] Incompatibilities identified
- [x] Integration plan created
- [x] Initial snapshot generated

### User Decisions Required
- [ ] **Stripe integration needed?** (Not in template - clarify)
- [ ] **Supabase credentials ready?** (URL + Anon Key)
- [ ] **Approve integration plan?** (Review analysis_and_plan.md)
- [ ] **Platform priorities?** (iOS, Android, Web - which first?)

---

## 📋 PLAN B INTEGRATION CHECKLIST

### Step 1: Normalize Versions and Tooling

#### 1.1 Install Dependencies
- [ ] `npm install @supabase/supabase-js@^2.49.4`
- [ ] `npm install expo-secure-store` (check if needed)
- [ ] `npm install expo-web-browser` (check if needed)
- [ ] `npm install expo-auth-session` (check if needed)
- [ ] Run `npm install` to verify
- [ ] **Snapshot:** `snapshot_v2_dependencies.txt`

#### 1.2 Environment Setup
- [ ] Create `.env` file
- [ ] Add `EXPO_PUBLIC_SUPABASE_URL`
- [ ] Add `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Create `.env.example` template
- [ ] Add `.env` to `.gitignore`

#### 1.3 Version Verification
- [ ] Verify React 19.1.0 compatible
- [ ] Verify TypeScript 5.9.2 compatible
- [ ] Check for dependency conflicts
- [ ] Run `npm ls` to check tree

---

### Step 2: Merge Folder Structures

#### 2.1 Create New Directories
- [ ] Create `lib/` directory
- [ ] Create `contexts/` directory
- [ ] Create `app/(auth)/` directory
- [ ] Create `app/(protected)/` directory
- [ ] Create `components/auth/` directory
- [ ] **Snapshot:** `snapshot_v3_folders.txt`

#### 2.2 Create Core Files
- [ ] Create `lib/config.ts`
- [ ] Create `lib/supabase.ts`
- [ ] Create `contexts/session-context.tsx`
- [ ] Verify imports work
- [ ] Test Supabase connection

---

### Step 3: Merge Providers

#### 3.1 Update Root Layout
- [ ] Modify `app/_layout.tsx`
- [ ] Import `SessionProvider`
- [ ] Wrap existing providers
- [ ] Add auth and protected screen groups
- [ ] Test app still runs
- [ ] **Snapshot:** `snapshot_v4_providers.txt`

#### 3.2 Verify Provider Hierarchy
- [ ] SessionProvider is outermost
- [ ] ThemeProvider is inside SessionProvider
- [ ] Stack is inside ThemeProvider
- [ ] Loading state shows during auth check
- [ ] No provider errors in console

---

### Step 4: Merge Environment Variables

#### 4.1 Update app.json
- [ ] Add `extra` config section
- [ ] Add `supabaseUrl` mapping
- [ ] Add `supabaseAnonKey` mapping
- [ ] Add `scheme` for deep linking
- [ ] Verify JSON is valid

#### 4.2 Test Environment Access
- [ ] Run app and check Constants.expoConfig
- [ ] Verify env vars are accessible
- [ ] Test config.ts validation
- [ ] Check for error messages

---

### Step 5: Create Auth Screens

#### 5.1 Create Auth Layout
- [ ] Create `app/(auth)/_layout.tsx`
- [ ] Configure Stack navigator
- [ ] Set headerShown options
- [ ] Test navigation to auth group

#### 5.2 Create Sign-In Screen
- [ ] Create `app/(auth)/sign-in.tsx`
- [ ] Convert HTML to React Native components
- [ ] Convert CSS to StyleSheet
- [ ] Implement email/password form
- [ ] Add form validation
- [ ] Add error handling
- [ ] Test sign-in flow
- [ ] **Snapshot:** `snapshot_v5_auth_screens.txt`

#### 5.3 Create Sign-Up Screen
- [ ] Create `app/(auth)/sign-up.tsx`
- [ ] Convert HTML to React Native components
- [ ] Convert CSS to StyleSheet
- [ ] Implement email/password form
- [ ] Add form validation
- [ ] Add error handling
- [ ] Test sign-up flow

#### 5.4 Create OAuth Button
- [ ] Create `components/auth/google-oauth-button.tsx`
- [ ] Implement OAuth flow with expo-auth-session
- [ ] Configure redirect URLs
- [ ] Add Google branding
- [ ] Test OAuth on web
- [ ] Test OAuth on iOS (if available)
- [ ] Test OAuth on Android (if available)

---

### Step 6: Create Protected Routes

#### 6.1 Create Protected Layout
- [ ] Create `app/(protected)/_layout.tsx`
- [ ] Implement route guard logic
- [ ] Add session check
- [ ] Add redirect to sign-in
- [ ] Test unauthorized access

#### 6.2 Create Protected Screen
- [ ] Create `app/(protected)/profile.tsx`
- [ ] Display user information
- [ ] Add sign-out button
- [ ] Test authenticated access
- [ ] Test session display

---

### Step 7: Rewrite Imports and Navigation

#### 7.1 Update Navigation Calls
- [ ] Find all `useNavigate()` calls (should be none in target)
- [ ] Replace with `useRouter()` from expo-router
- [ ] Find all `<Navigate>` components (should be none)
- [ ] Replace with `<Redirect>` or `router.replace()`
- [ ] Test all navigation flows

#### 7.2 Update Import Paths
- [ ] Use `@/` alias for all imports
- [ ] Update relative imports to absolute
- [ ] Verify all imports resolve
- [ ] Check for circular dependencies

---

### Step 8: Validate End-to-End Flows

#### 8.1 Authentication Flows
- [ ] **Sign-up with email/password**
  - [ ] Form validation works
  - [ ] Error messages display
  - [ ] Success creates session
  - [ ] Redirects to home
- [ ] **Sign-in with email/password**
  - [ ] Form validation works
  - [ ] Error messages display
  - [ ] Success creates session
  - [ ] Redirects to home
- [ ] **Google OAuth**
  - [ ] Button displays correctly
  - [ ] Opens OAuth flow
  - [ ] Handles callback
  - [ ] Creates session
  - [ ] Redirects to home
- [ ] **Sign-out**
  - [ ] Clears session
  - [ ] Redirects to public route
  - [ ] Protected routes inaccessible
- [ ] **Session persistence**
  - [ ] Session persists on app restart
  - [ ] Session refreshes automatically
  - [ ] Expired sessions handled

#### 8.2 Navigation Flows
- [ ] **Public routes accessible**
  - [ ] Home tab works
  - [ ] Explore tab works
  - [ ] Modal works
  - [ ] Auth screens accessible
- [ ] **Protected routes guarded**
  - [ ] Redirect to sign-in when not authenticated
  - [ ] Accessible when authenticated
  - [ ] Session check works
- [ ] **Post-login redirect**
  - [ ] Redirects to home after sign-in
  - [ ] Redirects to home after sign-up
  - [ ] Redirects to home after OAuth
- [ ] **Tab navigation**
  - [ ] Tabs work with auth
  - [ ] Session state available in tabs
  - [ ] Sign-out from tabs works

#### 8.3 Platform-Specific Validation
- [ ] **Web**
  - [ ] App builds for web
  - [ ] Auth flows work
  - [ ] OAuth works
  - [ ] Session persists
- [ ] **iOS** (if available)
  - [ ] App builds for iOS
  - [ ] Auth flows work
  - [ ] OAuth works (requires physical device)
  - [ ] Session persists
  - [ ] Deep linking works
- [ ] **Android** (if available)
  - [ ] App builds for Android
  - [ ] Auth flows work
  - [ ] OAuth works
  - [ ] Session persists
  - [ ] Deep linking works

---

### Step 9: Cleanup and Optimization

#### 9.1 Remove Duplicates
- [ ] Check for duplicate utilities
- [ ] Consolidate helper functions
- [ ] Remove unused imports
- [ ] Remove commented code
- [ ] Remove console.log statements

#### 9.2 Update Dependencies
- [ ] Remove unused dependencies
- [ ] Update package.json
- [ ] Run `npm prune`
- [ ] Verify app still works

#### 9.3 Code Quality
- [ ] Run ESLint
- [ ] Fix linting errors
- [ ] Run TypeScript check
- [ ] Fix type errors
- [ ] Format code

---

### Step 10: Documentation

#### 10.1 Create Setup Guides
- [ ] Create `docs/SUPABASE_SETUP.md`
- [ ] Create `docs/AUTH_GUIDE.md`
- [ ] Create `docs/ENVIRONMENT_SETUP.md`
- [ ] Update main `README.md`

#### 10.2 Document Environment Variables
- [ ] List all required env vars
- [ ] Document how to get Supabase credentials
- [ ] Document OAuth setup
- [ ] Document deep linking setup

#### 10.3 Create Testing Guide
- [ ] Document how to test auth flows
- [ ] Document how to test on each platform
- [ ] Document common issues
- [ ] Document troubleshooting steps

---

### Step 11: Generate Final Snapshot

- [ ] Generate `snapshot_v6_final.txt`
- [ ] Compare with `snapshot_v1_initial.txt`
- [ ] Document all changes
- [ ] Create change summary

---

## 🧪 TESTING MATRIX

### Authentication Tests

| Test | Web | iOS | Android | Status |
|------|-----|-----|---------|--------|
| Sign-up (email/password) | [ ] | [ ] | [ ] | ⏳ |
| Sign-in (email/password) | [ ] | [ ] | [ ] | ⏳ |
| Google OAuth | [ ] | [ ] | [ ] | ⏳ |
| Sign-out | [ ] | [ ] | [ ] | ⏳ |
| Session persistence | [ ] | [ ] | [ ] | ⏳ |
| Session refresh | [ ] | [ ] | [ ] | ⏳ |
| Expired session handling | [ ] | [ ] | [ ] | ⏳ |

### Navigation Tests

| Test | Web | iOS | Android | Status |
|------|-----|-----|---------|--------|
| Public routes accessible | [ ] | [ ] | [ ] | ⏳ |
| Protected routes guarded | [ ] | [ ] | [ ] | ⏳ |
| Post-login redirect | [ ] | [ ] | [ ] | ⏳ |
| Tab navigation | [ ] | [ ] | [ ] | ⏳ |
| Deep linking | [ ] | [ ] | [ ] | ⏳ |
| Modal navigation | [ ] | [ ] | [ ] | ⏳ |

### Build Tests

| Test | Status |
|------|--------|
| Web build succeeds | [ ] |
| iOS build succeeds | [ ] |
| Android build succeeds | [ ] |
| No TypeScript errors | [ ] |
| No ESLint errors | [ ] |
| No runtime errors | [ ] |

---

## 📦 DELIVERABLES CHECKLIST

### Code Files
- [ ] `lib/config.ts`
- [ ] `lib/supabase.ts`
- [ ] `contexts/session-context.tsx`
- [ ] `app/(auth)/_layout.tsx`
- [ ] `app/(auth)/sign-in.tsx`
- [ ] `app/(auth)/sign-up.tsx`
- [ ] `app/(protected)/_layout.tsx`
- [ ] `app/(protected)/profile.tsx`
- [ ] `components/auth/google-oauth-button.tsx`
- [ ] Modified `app/_layout.tsx`
- [ ] Modified `app.json`
- [ ] Modified `package.json`

### Configuration Files
- [ ] `.env.example`
- [ ] `.env` (not committed)
- [ ] Updated `.gitignore`

### Documentation
- [ ] `docs/SUPABASE_SETUP.md`
- [ ] `docs/AUTH_GUIDE.md`
- [ ] `docs/ENVIRONMENT_SETUP.md`
- [ ] Updated `README.md`

### Snapshots
- [x] `snapshot_v1_initial.txt`
- [ ] `snapshot_v2_dependencies.txt`
- [ ] `snapshot_v3_folders.txt`
- [ ] `snapshot_v4_providers.txt`
- [ ] `snapshot_v5_auth_screens.txt`
- [ ] `snapshot_v6_final.txt`

### Analysis Documents
- [x] `analysis_and_plan.md`
- [x] `INTEGRATION_SUMMARY.md`
- [x] `ARCHITECTURE_COMPARISON.md`
- [x] `QUICK_REFERENCE.md` (this file)

---

## 🚨 CRITICAL CHECKPOINTS

### Checkpoint 1: After Dependencies
**Before proceeding to Step 2, verify:**
- [ ] All dependencies installed without errors
- [ ] No version conflicts
- [ ] App still runs
- [ ] No new errors in console

### Checkpoint 2: After Core Files
**Before proceeding to Step 3, verify:**
- [ ] Supabase client initializes
- [ ] Config reads environment variables
- [ ] SessionContext provides session
- [ ] No TypeScript errors

### Checkpoint 3: After Provider Integration
**Before proceeding to Step 4, verify:**
- [ ] App still runs
- [ ] Loading state shows during auth check
- [ ] No provider errors
- [ ] Existing routes still work

### Checkpoint 4: After Auth Screens
**Before proceeding to Step 5, verify:**
- [ ] Sign-in screen renders
- [ ] Sign-up screen renders
- [ ] Forms are functional
- [ ] Navigation works

### Checkpoint 5: After Protected Routes
**Before proceeding to Step 6, verify:**
- [ ] Route guard works
- [ ] Redirect to sign-in works
- [ ] Authenticated access works
- [ ] Session data displays

### Final Checkpoint: Before Deployment
**Before marking complete, verify:**
- [ ] All tests pass
- [ ] All platforms build
- [ ] Documentation complete
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

## 📞 SUPPORT CHECKLIST

### Common Issues

- [ ] **"Cannot find module '@/lib/supabase'"**
  - Check tsconfig.json paths configuration
  - Verify file exists at correct location
  - Restart TypeScript server

- [ ] **"EXPO_PUBLIC_SUPABASE_URL is required"**
  - Check .env file exists
  - Verify environment variables are set
  - Restart Expo dev server

- [ ] **"Session is always null"**
  - Check Supabase credentials are correct
  - Verify auth listener is set up
  - Check storage permissions

- [ ] **"OAuth redirect doesn't work"**
  - Verify app.json scheme is set
  - Check Supabase redirect URLs
  - Test on physical device (not simulator)

- [ ] **"Protected routes not redirecting"**
  - Check session-context is providing session
  - Verify route guard logic
  - Check useSession hook is called

---

## ✅ COMPLETION CRITERIA

### Integration is complete when:

1. **All code files created and working**
2. **All tests passing on target platforms**
3. **Documentation complete and accurate**
4. **No errors in console or build**
5. **User can sign up, sign in, and access protected routes**
6. **Session persists across app restarts**
7. **OAuth works on at least one platform**
8. **Code is clean and well-documented**
9. **Snapshots generated and compared**
10. **User has approved final implementation**

---

**Current Status:** ⏳ Awaiting user approval to begin

**Next Step:** User confirms Stripe requirement and provides Supabase credentials

**Estimated Time to Complete:** 14-21 hours (with testing)
