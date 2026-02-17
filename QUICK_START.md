# Quick Start: Google OAuth Setup

## TL;DR - What Happened

✅ **Code is done.** Google OAuth button added to Sign In and Sign Up pages. Ready to use after Supabase configuration.

---

## What You Need to Do Now (15-20 minutes)

### 1. Get Google OAuth Credentials (5 min)

Go to [Google Cloud Console](https://console.cloud.google.com):
1. Create new project: "React Supabase Auth"
2. Enable Google+ API
3. Create OAuth 2.0 credentials:
   - Type: Web application
   - Authorized redirect URI: `https://sdgsmaxevwrinigwsdeu.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret

### 2. Configure Supabase (10 min)

Go to [Supabase Dashboard](https://app.supabase.com):

**Step 1: Add Google Provider**
- Go to Authentication → Providers → Google
- Toggle ENABLE
- Paste Client ID and Client Secret from Google
- Click SAVE

**Step 2: Add URLs**
- Go to Authentication → URL Configuration
- Site URL: `http://localhost:5173`
- Redirect URLs: Add `http://localhost:5173` and `http://localhost:5173/`
- Click SAVE

**Step 3: Choose Email Confirmation**
- Go to Authentication → Providers → Email
- **Development:** Disable "Confirm email" (easier testing)
- **Production:** Enable "Confirm email" (recommended)
- Click SAVE

**Step 4: Create `.env.local`**
- Go to Settings → API
- Copy Project URL and Anon Key
- Create file `.env.local` in project root:
  ```
  VITE_SUPABASE_URL=https://sdgsmaxevwrinigwsdeu.supabase.co
  VITE_SUPABASE_ANON_KEY=your_anon_key_here
  ```

### 3. Test (3 min)

```bash
npm run dev
```

Go to: `http://localhost:5173/auth/sign-in`

Click "Continue with Google" → should redirect to Google

✅ If that works, you're done!

---

## What Was Implemented

### New Files
- ✅ `src/components/GoogleOAuthButton.tsx` - Google OAuth button
- ✅ `src/components/index.ts` - Component exports

### Modified Files
- ✅ `src/pages/auth/SignInPage.tsx` - Added Google button
- ✅ `src/pages/auth/SignUpPage.tsx` - Added Google button
- ✅ `src/index.css` - Added button & divider styles

### Features
- ✅ Sign in with Google
- ✅ Sign up with Google
- ✅ Account auto-linking (same email)
- ✅ Session persistence
- ✅ Works with existing email/password auth
- ✅ Protected routes work with OAuth

---

## Documentation Files

- **`SUPABASE_SETUP_GUIDE.md`** - Detailed step-by-step instructions
- **`IMPLEMENTATION_SUMMARY.md`** - Technical overview
- **`AUTH_REVIEW.md`** - Complete auth system review (from earlier)
- **`ARCHITECTURE.md`** - Visual architecture diagrams

---

## Key URLs After Setup

- Sign In: `http://localhost:5173/auth/sign-in`
- Sign Up: `http://localhost:5173/auth/sign-up`
- Home: `http://localhost:5173/`
- Protected: `http://localhost:5173/protected`

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid Redirect URI" | Check Google Cloud Console has exact URI: `https://sdgsmaxevwrinigwsdeu.supabase.co/auth/v1/callback` |
| Button doesn't work | Make sure Google provider is ENABLED (toggle ON) in Supabase |
| API Keys error | Create `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| Session not persisting | Make sure `.env.local` is in project root, restart dev server |

See `SUPABASE_SETUP_GUIDE.md` for detailed troubleshooting.

---

## Done! 🎉

That's it. Code is ready, just needs Supabase config.

Questions? Check the documentation files above.
