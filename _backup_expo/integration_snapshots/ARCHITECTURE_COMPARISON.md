# Integration Architecture Comparison

## Template (E2E) vs Target (StashSnap)

### Current Template Architecture (Web)

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Web Only)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    index.html + main.tsx                     │
│                    (React DOM Mount)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              React Router (createBrowserRouter)              │
│                     src/router/index.tsx                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Providers.tsx (Root)                      │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          SessionProvider (Auth Context)               │  │
│  │          src/context/SessionContext.tsx               │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Supabase Client (Singleton)                    │  │  │
│  │  │  src/supabase/index.ts                          │  │  │
│  │  │  - createClient(URL, KEY)                       │  │  │
│  │  │  - Browser localStorage                         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  State: { session, loading }                           │  │
│  │  Hook: useSession()                                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Routes                               │
│                                                               │
│  Public Routes:                                              │
│  ├─ / (HomePage)                                             │
│  ├─ /auth/sign-in (SignInPage)                              │
│  └─ /auth/sign-up (SignUpPage)                              │
│                                                               │
│  Protected Routes (AuthProtectedRoute):                      │
│  └─ /protected (ProtectedPage)                              │
│                                                               │
│  Fallback:                                                   │
│  └─ * (404Page)                                              │
└─────────────────────────────────────────────────────────────┘
```

### Current Target Architecture (Mobile)

```
┌─────────────────────────────────────────────────────────────┐
│          iOS / Android / Web (Cross-Platform)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Expo Entry Point (expo-router)              │
│                      app/_layout.tsx                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ThemeProvider (Only)                      │
│              @react-navigation/native                        │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Stack Navigator                          │  │
│  │                                                         │  │
│  │  Routes:                                               │  │
│  │  ├─ (tabs) - Tab navigation                           │  │
│  │  │   ├─ index.tsx (Home)                              │  │
│  │  │   └─ explore.tsx (Explore)                         │  │
│  │  └─ modal.tsx (Modal screen)                          │  │
│  │                                                         │  │
│  │  ❌ NO AUTH SYSTEM                                     │  │
│  │  ❌ NO SESSION MANAGEMENT                              │  │
│  │  ❌ NO PROTECTED ROUTES                                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Integrated Architecture (After Integration)

```
┌─────────────────────────────────────────────────────────────┐
│          iOS / Android / Web (Cross-Platform)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Expo Entry Point (expo-router)              │
│                      app/_layout.tsx                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              🆕 SessionProvider (OUTERMOST)                  │
│              contexts/session-context.tsx                    │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🆕 Supabase Client (Mobile-Adapted)                  │  │
│  │  lib/supabase.ts                                       │  │
│  │  - createClient(URL, KEY)                             │  │
│  │  - SecureStore (iOS/Android)                          │  │
│  │  - AsyncStorage (Web)                                 │  │
│  │  - autoRefreshToken: true                             │  │
│  │  - persistSession: true                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  State: { session, loading }                                 │
│  Hook: useSession()                                          │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           ThemeProvider (Existing)                    │  │
│  │           @react-navigation/native                    │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Stack Navigator                         │  │  │
│  │  │                                                   │  │  │
│  │  │  Public Routes:                                  │  │  │
│  │  │  ├─ (tabs) - Main app (existing)                │  │  │
│  │  │  │   ├─ index.tsx                               │  │  │
│  │  │  │   └─ explore.tsx                             │  │  │
│  │  │  ├─ modal.tsx                                    │  │  │
│  │  │  └─ 🆕 (auth) - Auth screens                    │  │  │
│  │  │      ├─ sign-in.tsx                             │  │  │
│  │  │      └─ sign-up.tsx                             │  │  │
│  │  │                                                   │  │  │
│  │  │  Protected Routes:                               │  │  │
│  │  │  └─ 🆕 (protected) - Guarded routes             │  │  │
│  │  │      ├─ _layout.tsx (Route Guard)               │  │  │
│  │  │      └─ profile.tsx                             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Conversion Map

### Web (Template) → React Native (Target)

| Template Component | Target Component | Notes |
|-------------------|------------------|-------|
| `<div>` | `<View>` | Container |
| `<button>` | `<Pressable>` or `<Button>` | Interactive element |
| `<input type="text">` | `<TextInput>` | Text input |
| `<input type="email">` | `<TextInput keyboardType="email-address">` | Email input |
| `<input type="password">` | `<TextInput secureTextEntry>` | Password input |
| `<a href="...">` | `<Link href="...">` (expo-router) | Navigation link |
| `<Navigate to="...">` | `router.replace("...")` | Programmatic navigation |
| `useNavigate()` | `useRouter()` | Navigation hook |
| `<Outlet />` | `<Slot />` or `<Stack />` | Route outlet |
| CSS classes | `StyleSheet.create({...})` | Styling |
| `className="..."` | `style={styles....}` | Style application |

---

## File Structure Comparison

### Template Structure (E2E)

```
E2E/
├── src/
│   ├── components/
│   │   ├── GoogleOAuthButton.tsx
│   │   └── index.ts
│   ├── context/
│   │   └── SessionContext.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── SignInPage.tsx
│   │   │   └── SignUpPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── ProtectedPage.tsx
│   │   ├── LoadingPage.tsx
│   │   └── 404Page.tsx
│   ├── router/
│   │   ├── index.tsx
│   │   └── AuthProtectedRoute.tsx
│   ├── supabase/
│   │   └── index.ts
│   ├── config.ts
│   ├── Providers.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
└── package.json
```

### Target Structure (StashSnap - Before)

```
stashsnap/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── explore.tsx
│   ├── _layout.tsx
│   └── modal.tsx
├── components/
│   ├── ui/
│   ├── themed-text.tsx
│   └── themed-view.tsx
├── constants/
│   └── theme.ts
├── hooks/
│   └── use-color-scheme.ts
└── package.json
```

### Target Structure (StashSnap - After Integration)

```
stashsnap/
├── app/
│   ├── (tabs)/              [EXISTING]
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── explore.tsx
│   ├── (auth)/              [NEW - Auth screens]
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (protected)/         [NEW - Protected routes]
│   │   ├── _layout.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx          [MODIFIED - Add SessionProvider]
│   └── modal.tsx            [EXISTING]
├── components/
│   ├── auth/                [NEW - Auth components]
│   │   └── google-oauth-button.tsx
│   ├── ui/                  [EXISTING]
│   ├── themed-text.tsx      [EXISTING]
│   └── themed-view.tsx      [EXISTING]
├── contexts/                [NEW - Context providers]
│   └── session-context.tsx
├── lib/                     [NEW - Utilities]
│   ├── supabase.ts
│   └── config.ts
├── constants/               [EXISTING]
│   └── theme.ts
├── hooks/                   [EXISTING]
│   └── use-color-scheme.ts
├── .env                     [NEW - Environment variables]
├── .env.example             [NEW - Template]
├── app.json                 [MODIFIED - Add env config]
└── package.json             [MODIFIED - Add dependencies]
```

---

## Data Flow Comparison

### Template Auth Flow (Web)

```
User visits app
    │
    ▼
SessionProvider mounts
    │
    ▼
Supabase.auth.onAuthStateChange() listener starts
    │
    ▼
Check localStorage for existing session
    │
    ├─ Session found ──────────────┐
    │                               │
    └─ No session ─────────────┐   │
                                │   │
                                ▼   ▼
                        Show LoadingPage
                                │
                                ▼
                        setSession(session | null)
                        setLoading(false)
                                │
                                ▼
                        Render routes
                                │
    ┌───────────────────────────┼───────────────────────────┐
    │                           │                           │
    ▼                           ▼                           ▼
Public routes            Protected routes           Navigate redirects
(accessible)         (check session in guard)     (programmatic nav)
```

### Target Auth Flow (Mobile - After Integration)

```
App launches (iOS/Android/Web)
    │
    ▼
Expo Router initializes
    │
    ▼
app/_layout.tsx mounts
    │
    ▼
SessionProvider mounts
    │
    ▼
Supabase.auth.onAuthStateChange() listener starts
    │
    ▼
Check SecureStore/AsyncStorage for existing session
    │
    ├─ Session found ──────────────┐
    │                               │
    └─ No session ─────────────┐   │
                                │   │
                                ▼   ▼
                        Show ActivityIndicator
                                │
                                ▼
                        setSession(session | null)
                        setLoading(false)
                                │
                                ▼
                        Render Stack Navigator
                                │
    ┌───────────────────────────┼───────────────────────────┐
    │                           │                           │
    ▼                           ▼                           ▼
Public routes            Protected routes           router.push/replace
(tabs, auth)         (check session in _layout)     (programmatic nav)
    │                           │
    │                           ├─ Has session → Render
    │                           └─ No session → <Redirect href="/(auth)/sign-in" />
    │
    └─ User signs in → onAuthStateChange fires → session updated → re-render
```

---

## Environment Variable Mapping

### Template (Vite)

```typescript
// .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

// config.ts
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### Target (Expo)

```typescript
// .env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx

// app.json
{
  "expo": {
    "extra": {
      "supabaseUrl": process.env.EXPO_PUBLIC_SUPABASE_URL,
      "supabaseAnonKey": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}

// lib/config.ts
import Constants from 'expo-constants';
const url = Constants.expoConfig?.extra?.supabaseUrl;
const key = Constants.expoConfig?.extra?.supabaseAnonKey;
```

---

## Storage Mechanism Comparison

### Template (Web)

```typescript
// Automatic browser localStorage
const supabase = createClient(URL, KEY);
// Sessions stored in localStorage automatically
```

### Target (Mobile)

```typescript
// Platform-specific storage
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const storage = Platform.OS === 'web' 
  ? AsyncStorage 
  : {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    };

const supabase = createClient(URL, KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

---

## OAuth Flow Comparison

### Template (Web)

```typescript
// Simple browser redirect
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
});
// Browser redirects to Google
// Google redirects back to app
// Supabase handles callback automatically
```

### Target (Mobile)

```typescript
// Requires expo-auth-session and expo-web-browser
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const redirectUrl = makeRedirectUri({
  scheme: 'stashsnap',
  path: 'auth/callback',
});

const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: redirectUrl,
  },
});
// Opens in-app browser
// Handles redirect back to app
// Deep linking configured in app.json
```

---

## Summary of Changes

### What Stays the Same
- ✅ Supabase authentication logic (core concepts)
- ✅ Session management pattern (Context API)
- ✅ Protected route concept
- ✅ Email/password auth flow
- ✅ Google OAuth concept

### What Changes
- 🔄 Routing system (React Router → Expo Router)
- 🔄 Components (HTML → React Native)
- 🔄 Styling (CSS → StyleSheet)
- 🔄 Environment variables (Vite → Expo)
- 🔄 Storage (localStorage → SecureStore/AsyncStorage)
- 🔄 OAuth implementation (browser redirect → in-app browser)
- 🔄 Navigation (useNavigate → useRouter)
- 🔄 File structure (src/pages → app routes)

### What's New
- 🆕 Cross-platform support (iOS, Android, Web)
- 🆕 Secure token storage (SecureStore)
- 🆕 File-based routing
- 🆕 Deep linking configuration
- 🆕 Platform-specific adaptations
