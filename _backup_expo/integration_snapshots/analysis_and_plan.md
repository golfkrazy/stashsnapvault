# Auth + Stripe Integration Analysis & Plan

**Date:** 2026-01-27  
**Template:** E2E (React + Vite + Supabase Auth)  
**Target:** StashSnap (React Native + Expo Router)

---

## PART 1: TEMPLATE ANALYSIS

### Template Architecture Summary

The E2E template is a **React web application** built with:

#### Core Technologies
- **Framework:** React 19.0.0 + Vite 6.2.6
- **Routing:** React Router DOM 7.6.2 (createBrowserRouter)
- **Authentication:** Supabase Auth 2.49.4
- **Language:** TypeScript 5.7.3
- **Platform:** Web (browser-based)

#### Architectural Principles

1. **Provider-Based Architecture**
   - Root layout wraps all routes with `Providers.tsx`
   - `SessionProvider` provides auth context to entire app
   - Uses React Context API for state management

2. **Authentication Flow**
   - Supabase client singleton (`src/supabase/index.ts`)
   - Session context with `onAuthStateChange` listener
   - Protected routes via `AuthProtectedRoute` component
   - Loading state during auth initialization

3. **Route Protection Pattern**
   - Public routes: `/`, `/auth/sign-in`, `/auth/sign-up`
   - Protected routes: `/protected` (requires session)
   - 404 fallback for unauthorized access

#### Required Environment Variables

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

#### Folder Structure

```
E2E/
├── src/
│   ├── components/
│   │   ├── GoogleOAuthButton.tsx
│   │   └── index.ts
│   ├── context/
│   │   └── SessionContext.tsx          # Auth state management
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── SignInPage.tsx
│   │   │   └── SignUpPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── ProtectedPage.tsx
│   │   ├── LoadingPage.tsx
│   │   └── 404Page.tsx
│   ├── router/
│   │   ├── index.tsx                   # Route definitions
│   │   └── AuthProtectedRoute.tsx      # Route guard
│   ├── supabase/
│   │   └── index.ts                    # Supabase client
│   ├── config.ts                       # Env validation
│   ├── Providers.tsx                   # Root layout
│   └── main.tsx                        # Entry point
├── .env.example
└── package.json
```

#### Key Components

**1. SessionContext (`src/context/SessionContext.tsx`)**
- Manages global auth state
- Provides `useSession()` hook
- Listens to `onAuthStateChange` events
- Shows loading page during initialization

**2. Supabase Client (`src/supabase/index.ts`)**
- Singleton instance
- Configured with URL and anon key
- Used throughout app for auth operations

**3. AuthProtectedRoute (`src/router/AuthProtectedRoute.tsx`)**
- Checks session state
- Renders `<Outlet />` if authenticated
- Shows 404 if not authenticated

**4. GoogleOAuthButton (`src/components/GoogleOAuthButton.tsx`)**
- Calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Handles OAuth flow
- Error handling with alerts

#### Authentication Features

✅ Email/password sign-up  
✅ Email/password sign-in  
✅ Google OAuth  
✅ Session persistence  
✅ Protected routes  
✅ Auto sign-out  
✅ Session refresh

#### Stripe Integration

> **NOTE:** The template name mentions Stripe, but after reviewing `architecture.md` and `implementation_summary.md`, **no Stripe code is present**. The template only implements authentication. We'll need to clarify with the user if Stripe integration is required.

---

## PART 2: TARGET PROJECT ANALYSIS

### StashSnap Architecture Summary

StashSnap is a **React Native mobile application** built with:

#### Core Technologies
- **Framework:** React Native 0.81.5 + Expo 54.0.20
- **Routing:** Expo Router 6.0.13 (file-based routing)
- **Navigation:** React Navigation 7.1.8
- **Language:** TypeScript 5.9.2
- **Platform:** iOS, Android, Web (cross-platform)

#### Current Architecture

1. **File-Based Routing (Expo Router)**
   - Routes defined by file structure in `app/` directory
   - `app/_layout.tsx` is root layout
   - `app/(tabs)/` contains tab-based navigation
   - No React Router DOM (incompatible with React Native)

2. **Provider Hierarchy**
   - `ThemeProvider` from `@react-navigation/native`
   - No auth provider currently exists
   - No session management

3. **Current Routes**
   - `app/(tabs)/index.tsx` - Home tab
   - `app/(tabs)/explore.tsx` - Explore tab
   - `app/modal.tsx` - Modal screen
   - Tab-based navigation with Stack navigator

#### Folder Structure

```
stashsnap/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx              # Tab navigator
│   │   ├── index.tsx                # Home tab
│   │   └── explore.tsx              # Explore tab
│   ├── _layout.tsx                  # Root layout
│   └── modal.tsx
├── components/
│   ├── ui/
│   │   ├── collapsible.tsx
│   │   ├── icon-symbol.tsx
│   │   └── icon-symbol.ios.tsx
│   ├── external-link.tsx
│   ├── haptic-tab.tsx
│   ├── hello-wave.tsx
│   ├── parallax-scroll-view.tsx
│   ├── themed-text.tsx
│   └── themed-view.tsx
├── constants/
│   └── theme.ts
├── hooks/
│   ├── use-color-scheme.ts
│   ├── use-color-scheme.web.ts
│   └── use-theme-color.ts
├── assets/
├── docs/
├── research/
└── package.json
```

#### Key Differences from Template

| Aspect | Template (E2E) | Target (StashSnap) |
|--------|----------------|-------------------|
| **Platform** | Web only | Mobile + Web |
| **Routing** | React Router DOM | Expo Router |
| **Navigation** | Browser history | React Navigation |
| **Environment** | Vite (`import.meta.env`) | Expo (`process.env` or `expo-constants`) |
| **Auth** | Supabase | None (to be added) |
| **State** | Context API | None (to be added) |
| **Styling** | CSS files | StyleSheet API |

#### Missing Features (to be integrated)

- ❌ Authentication system
- ❌ Supabase integration
- ❌ Session management
- ❌ Protected routes
- ❌ Auth screens (sign-in, sign-up)
- ❌ OAuth integration
- ❌ Environment variable management
- ❌ Stripe integration (if required)

---

## PART 3: INTEGRATION CHALLENGES

### Critical Incompatibilities

#### 1. **Routing System Mismatch**
- **Template:** Uses `react-router-dom` with `createBrowserRouter`
- **Target:** Uses `expo-router` with file-based routing
- **Solution:** Rewrite all routing logic to use Expo Router conventions

#### 2. **Platform Differences**
- **Template:** Web-only (DOM, CSS, browser APIs)
- **Target:** React Native (no DOM, StyleSheet, native APIs)
- **Solution:** Adapt all components to React Native equivalents

#### 3. **Environment Variables**
- **Template:** Vite env vars (`import.meta.env.VITE_*`)
- **Target:** Expo env vars (`process.env.EXPO_PUBLIC_*` or `expo-constants`)
- **Solution:** Use `expo-constants` or `.env` with proper Expo configuration

#### 4. **Navigation Patterns**
- **Template:** `<Navigate>` component, `useNavigate()` hook
- **Target:** `router.push()`, `router.replace()` from `expo-router`
- **Solution:** Replace all navigation calls with Expo Router equivalents

#### 5. **Styling**
- **Template:** CSS files with classes
- **Target:** React Native StyleSheet
- **Solution:** Convert all CSS to StyleSheet objects

#### 6. **Component Libraries**
- **Template:** HTML elements (`<div>`, `<button>`, `<input>`)
- **Target:** React Native components (`<View>`, `<Pressable>`, `<TextInput>`)
- **Solution:** Rewrite all UI components for React Native

---

## PART 4: INTEGRATION PLAN (Plan B Checklist)

### Step 1: Normalize Versions and Tooling

#### 1.1 Install Required Dependencies

```bash
npm install @supabase/supabase-js@^2.49.4
npm install @react-native-async-storage/async-storage  # Already installed
npm install expo-secure-store  # For secure token storage
npm install expo-web-browser  # For OAuth flows
npm install expo-auth-session  # For OAuth flows
```

#### 1.2 Update Environment Configuration

- Create `.env` file with Supabase credentials
- Install `expo-constants` for env access (already installed)
- Configure `app.json` for environment variables

#### 1.3 Version Compatibility Check

- ✅ React 19.1.0 (compatible with template's 19.0.0)
- ✅ TypeScript 5.9.2 (compatible with template's 5.7.3)
- ⚠️ Supabase needs to be installed
- ⚠️ Auth-related Expo packages needed

---

### Step 2: Merge Folder Structures

#### 2.1 Create New Directories

```
stashsnap/
├── app/
│   ├── (auth)/                      # NEW: Auth screens group
│   │   ├── sign-in.tsx              # NEW
│   │   └── sign-up.tsx              # NEW
│   └── (protected)/                 # NEW: Protected routes group
│       └── profile.tsx              # NEW (example)
├── lib/                             # NEW: Utilities
│   ├── supabase.ts                  # NEW: Supabase client
│   └── config.ts                    # NEW: Env validation
├── contexts/                        # NEW: Context providers
│   └── session-context.tsx          # NEW: Auth state
└── components/
    └── auth/                        # NEW: Auth components
        └── google-oauth-button.tsx  # NEW
```

#### 2.2 Preserve Existing Structure

- Keep `app/(tabs)/` for main navigation
- Keep existing `components/`, `hooks/`, `constants/`
- Add new folders alongside existing ones

---

### Step 3: Merge Providers into Unified Root Layout

#### 3.1 Current Root Layout (`app/_layout.tsx`)

```tsx
// Current structure
<ThemeProvider>
  <Stack>
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="modal" />
  </Stack>
</ThemeProvider>
```

#### 3.2 Updated Root Layout (with SessionProvider)

```tsx
// New structure
<SessionProvider>
  <ThemeProvider>
    <Stack>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(protected)" />
      <Stack.Screen name="modal" />
    </Stack>
  </ThemeProvider>
</SessionProvider>
```

#### 3.3 Provider Hierarchy

```
SessionProvider (outermost - auth state)
  └── ThemeProvider (theme/navigation)
      └── Stack (routing)
          └── Screens
```

---

### Step 4: Merge Environment Variables

#### 4.1 Create `.env` File

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

#### 4.2 Create `lib/config.ts`

```typescript
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('EXPO_PUBLIC_SUPABASE_URL is required');
if (!supabaseAnonKey) throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is required');

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
```

#### 4.3 Update `app.json`

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": process.env.EXPO_PUBLIC_SUPABASE_URL,
      "supabaseAnonKey": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}
```

---

### Step 5: Rewrite Imports and Resolve Path Differences

#### 5.1 Path Alias Configuration

StashSnap uses `@/` alias (configured in `tsconfig.json`):

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### 5.2 Import Mapping

| Template Import | Target Import |
|----------------|---------------|
| `../supabase` | `@/lib/supabase` |
| `../context/SessionContext` | `@/contexts/session-context` |
| `../config` | `@/lib/config` |
| `react-router-dom` | `expo-router` |

#### 5.3 Component Import Mapping

| Template (Web) | Target (React Native) |
|----------------|----------------------|
| `<div>` | `<View>` |
| `<button>` | `<Pressable>` or `<Button>` |
| `<input>` | `<TextInput>` |
| `<a>` | `<Link>` (expo-router) |
| `<Navigate>` | `router.replace()` |
| `useNavigate()` | `useRouter()` |

---

### Step 6: Validate All Flows End-to-End

#### 6.1 Authentication Flow Validation

- [ ] Sign-up with email/password
- [ ] Sign-in with email/password
- [ ] Google OAuth (mobile)
- [ ] Session persistence (AsyncStorage)
- [ ] Auto sign-out on token expiry
- [ ] Session refresh

#### 6.2 Navigation Flow Validation

- [ ] Public routes accessible without auth
- [ ] Protected routes redirect to sign-in
- [ ] Post-login redirect to home
- [ ] Tab navigation works with auth
- [ ] Modal navigation works with auth

#### 6.3 Platform-Specific Validation

- [ ] iOS build and run
- [ ] Android build and run
- [ ] Web build and run (Expo web)
- [ ] Deep linking works
- [ ] OAuth redirect works on all platforms

---

### Step 7: Cleanup Duplicates and Unused Files

#### 7.1 Remove Unused Dependencies

- Check for duplicate utilities
- Remove template-specific web dependencies
- Clean up unused imports

#### 7.2 Consolidate Utilities

- Merge any duplicate helper functions
- Standardize naming conventions
- Remove commented-out code

#### 7.3 Update Documentation

- Update README with auth setup
- Document environment variables
- Add Supabase setup guide

---

### Step 8: Generate Project Tree Snapshots

After each major step, generate a snapshot:

```bash
# PowerShell command
tree /F /A > integration_snapshots/snapshot_v1_initial.txt
tree /F /A > integration_snapshots/snapshot_v2_dependencies.txt
tree /F /A > integration_snapshots/snapshot_v3_folders.txt
tree /F /A > integration_snapshots/snapshot_v4_providers.txt
tree /F /A > integration_snapshots/snapshot_v5_auth_screens.txt
tree /F /A > integration_snapshots/snapshot_v6_final.txt
```

---

## PART 5: FILE-BY-FILE MERGE PLAN

### Phase 1: Core Infrastructure

#### 1. Install Dependencies

**File:** `package.json`

**Action:** Add dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.49.4",
    "expo-secure-store": "~14.0.0",
    "expo-web-browser": "~15.0.8",
    "expo-auth-session": "~6.0.8"
  }
}
```

---

#### 2. Create Supabase Client

**File:** `lib/supabase.ts` (NEW)

**Source:** `E2E/src/supabase/index.ts`

**Changes:**
- Use AsyncStorage for web
- Use SecureStore for native
- Configure auth options for mobile

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// Use SecureStore for native, AsyncStorage for web
const storage = Platform.OS === 'web' ? AsyncStorage : {
  getItem: async (key: string) => await SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) => await SecureStore.setItemAsync(key, value),
  removeItem: async (key: string) => await SecureStore.deleteItemAsync(key),
};

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
```

---

#### 3. Create Config File

**File:** `lib/config.ts` (NEW)

**Source:** `E2E/src/config.ts`

**Changes:**
- Use Expo Constants instead of Vite env
- Remove alert() calls (not available in RN)
- Use console.warn for errors

```typescript
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl) {
  console.warn('EXPO_PUBLIC_SUPABASE_URL is required');
  throw new Error('EXPO_PUBLIC_SUPABASE_URL is required');
}

if (!supabaseAnonKey) {
  console.warn('EXPO_PUBLIC_SUPABASE_ANON_KEY is required');
  throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is required');
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
```

---

#### 4. Create Session Context

**File:** `contexts/session-context.tsx` (NEW)

**Source:** `E2E/src/context/SessionContext.tsx`

**Changes:**
- Remove LoadingPage import (create RN version)
- Use React Native components
- Add proper TypeScript types

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
});

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStateListener = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );

    return () => {
      authStateListener.data.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

---

### Phase 2: Root Layout Integration

#### 5. Update Root Layout

**File:** `app/_layout.tsx` (MODIFY)

**Changes:**
- Wrap with SessionProvider
- Add auth and protected route groups
- Configure stack screens

```typescript
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SessionProvider } from '@/contexts/session-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SessionProvider>
  );
}
```

---

### Phase 3: Auth Screens

#### 6. Create Sign-In Screen

**File:** `app/(auth)/sign-in.tsx` (NEW)

**Source:** `E2E/src/pages/auth/SignInPage.tsx`

**Changes:**
- Convert to React Native components
- Use Expo Router navigation
- Adapt form handling for mobile
- Convert CSS to StyleSheet

*(Full implementation to be provided in next phase)*

---

#### 7. Create Sign-Up Screen

**File:** `app/(auth)/sign-up.tsx` (NEW)

**Source:** `E2E/src/pages/auth/SignUpPage.tsx`

**Changes:**
- Same as sign-in screen
- Convert to React Native
- Use Expo Router

---

#### 8. Create Google OAuth Button

**File:** `components/auth/google-oauth-button.tsx` (NEW)

**Source:** `E2E/src/components/GoogleOAuthButton.tsx`

**Changes:**
- Use `expo-auth-session` for OAuth
- Configure redirect URLs
- Handle mobile OAuth flow
- Use React Native Pressable

---

### Phase 4: Protected Routes

#### 9. Create Protected Route Wrapper

**File:** `app/(protected)/_layout.tsx` (NEW)

**Source:** `E2E/src/router/AuthProtectedRoute.tsx`

**Changes:**
- Use Expo Router's `<Redirect>` component
- Check session from context
- Redirect to sign-in if not authenticated

```typescript
import { useSession } from '@/contexts/session-context';
import { Redirect, Stack } from 'expo-router';

export default function ProtectedLayout() {
  const { session } = useSession();

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Stack />;
}
```

---

#### 10. Create Example Protected Screen

**File:** `app/(protected)/profile.tsx` (NEW)

**Source:** `E2E/src/pages/ProtectedPage.tsx`

**Changes:**
- Convert to React Native
- Display user info from session
- Add sign-out button

---

### Phase 5: Environment Configuration

#### 11. Create .env File

**File:** `.env` (NEW)

**Source:** `E2E/.env.example`

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

---

#### 12. Update app.json

**File:** `app.json` (MODIFY)

**Changes:**
- Add extra config for env vars
- Configure deep linking for OAuth
- Add scheme for redirects

```json
{
  "expo": {
    "scheme": "stashsnap",
    "extra": {
      "supabaseUrl": process.env.EXPO_PUBLIC_SUPABASE_URL,
      "supabaseAnonKey": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}
```

---

## PART 6: VALIDATION CHECKLIST

### Pre-Integration Checklist

- [x] Template architecture understood
- [x] Target project architecture understood
- [x] Incompatibilities identified
- [x] Integration plan created
- [ ] User approval received

### Post-Integration Testing

#### Authentication Tests

- [ ] Sign-up with email/password works
- [ ] Sign-in with email/password works
- [ ] Sign-out works
- [ ] Session persists across app restarts
- [ ] Session refreshes automatically
- [ ] Google OAuth works on iOS
- [ ] Google OAuth works on Android
- [ ] Google OAuth works on web

#### Navigation Tests

- [ ] Public routes accessible without auth
- [ ] Protected routes require auth
- [ ] Redirect to sign-in works
- [ ] Post-login redirect works
- [ ] Tab navigation works
- [ ] Deep linking works

#### Platform Tests

- [ ] iOS build succeeds
- [ ] Android build succeeds
- [ ] Web build succeeds
- [ ] All platforms run without errors

---

## PART 7: RISKS AND MITIGATION

### High-Risk Areas

1. **OAuth on Mobile**
   - **Risk:** OAuth redirect handling is complex on mobile
   - **Mitigation:** Use `expo-auth-session` with proper redirect URLs

2. **Session Storage**
   - **Risk:** SecureStore may fail on some devices
   - **Mitigation:** Fallback to AsyncStorage with encryption

3. **Deep Linking**
   - **Risk:** OAuth callbacks may not work
   - **Mitigation:** Test thoroughly on all platforms, configure app.json properly

4. **Environment Variables**
   - **Risk:** Expo env vars work differently than Vite
   - **Mitigation:** Use `expo-constants` with proper configuration

### Medium-Risk Areas

1. **Styling Conversion**
   - **Risk:** CSS to StyleSheet conversion may miss edge cases
   - **Mitigation:** Test all screens visually

2. **Navigation Patterns**
   - **Risk:** React Router patterns don't map 1:1 to Expo Router
   - **Mitigation:** Carefully review all navigation calls

---

## PART 8: NEXT STEPS

### Immediate Actions Required

1. **User Confirmation**
   - Confirm Stripe integration is needed (not in template)
   - Approve integration plan
   - Provide Supabase credentials

2. **Snapshot Creation**
   - Generate initial project tree snapshot
   - Document current state

3. **Begin Integration**
   - Follow Plan B checklist step-by-step
   - Generate snapshots after each phase
   - Test incrementally

---

## SUMMARY

### What We're Integrating

✅ **Authentication System**
- Email/password auth
- Google OAuth
- Session management
- Protected routes

❓ **Stripe Integration**
- Not present in template
- Needs clarification

### Major Adaptations Required

1. **React Router → Expo Router**
2. **Web Components → React Native Components**
3. **Vite Env → Expo Env**
4. **CSS → StyleSheet**
5. **Browser APIs → React Native APIs**

### Estimated Effort

- **Phase 1-2 (Infrastructure):** 2-3 hours
- **Phase 3 (Auth Screens):** 3-4 hours
- **Phase 4 (Protected Routes):** 1-2 hours
- **Phase 5 (Environment):** 1 hour
- **Testing & Debugging:** 4-6 hours

**Total:** 11-16 hours

---

**Ready to proceed?** Please confirm:
1. Is Stripe integration required?
2. Do you have Supabase credentials ready?
3. Should I begin with Phase 1?
