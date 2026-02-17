# Supabase Configuration Guide for Google OAuth

This guide walks you through the 4 manual configuration steps required in the Supabase Dashboard to enable Google OAuth authentication.

---

## Step 1: Enable Google OAuth Provider & Get OAuth Credentials

### 1.1: Enable Google Provider in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **sdgsmaxevwrinigwsdeu**
3. Navigate to **Authentication** → **Providers**
4. Find the **Google** provider
5. Toggle to **ENABLE** (turn on)
6. You'll see a form asking for:
   - **Client ID**
   - **Client Secret**

⚠️ **Don't save yet** - you need to get these credentials from Google Cloud first.

---

### 1.2: Create Google OAuth 2.0 Credentials

You need to create OAuth 2.0 credentials in Google Cloud Console:

#### Step A: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project:
   - Click project dropdown at top
   - Click **NEW PROJECT**
   - Name: `React Supabase Auth`
   - Click **CREATE**
   - Wait for project to be created and switch to it

#### Step B: Enable Google+ API

1. In the left sidebar, click **APIs & Services** → **Library**
2. Search for **"Google+ API"** (or just "Google+")
3. Click the result
4. Click **ENABLE**

#### Step C: Create OAuth 2.0 Client ID

1. Go back to **APIs & Services** in left sidebar
2. Click **Credentials**
3. Click **+ CREATE CREDENTIALS**
4. Select **OAuth client ID**
5. Choose **Web application**
6. Configure:
   - **Name:** `Supabase Auth`
   - **Authorized JavaScript origins:** Add one:
     - `https://sdgsmaxevwrinigwsdeu.supabase.co`
   - **Authorized redirect URIs:** Add one:
     - `https://sdgsmaxevwrinigwsdeu.supabase.co/auth/v1/callback`
   - Click **CREATE**

7. You'll see a popup with:
   - **Client ID** (looks like: `xxx.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-xxx`)

8. **COPY BOTH** - you need these for Supabase

⚠️ **Save these securely** - you'll paste them into Supabase next

---

### 1.3: Paste Credentials into Supabase

Back in your Supabase Dashboard:

1. Go to **Authentication** → **Providers** → **Google** (where you enabled it)
2. Paste:
   - **Client ID** into the Client ID field
   - **Client Secret** into the Client Secret field
3. Click **SAVE**

✅ **Google OAuth is now enabled!**

---

## Step 2: Configure Site URL and Redirect URLs

This tells Supabase where your app is hosted and which URLs are allowed after OAuth:

### 2.1: Set Site URL

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Find **Site URL** field
3. For development, set to: `http://localhost:5173`
4. For production, change to your domain: `https://yourdomain.com`
5. Click **SAVE**

**Why:** This is where users are redirected after email confirmation or OAuth

### 2.2: Add Redirect URLs

In the same **URL Configuration** page:

1. Find **Redirect URLs** section
2. Click **Add URL** (or enter in text area)
3. Add these URLs:
   ```
   http://localhost:5173
   http://localhost:5173/
   http://localhost:5173/auth/sign-in
   http://localhost:5173/auth/sign-up
   ```
4. When you deploy to production, add:
   ```
   https://yourdomain.com
   https://yourdomain.com/
   https://yourdomain.com/auth/sign-in
   https://yourdomain.com/auth/sign-up
   ```
5. Click **SAVE**

**Why:** After OAuth, Supabase redirects to one of these URLs. Without them listed, the redirect will fail.

✅ **Redirect URLs are configured!**

---

## Step 3: Configure Email Confirmation Setting

Choose based on your use case:

### Option A: Require Email Confirmation (Production Recommended)

1. Go to **Authentication** → **Providers** → **Email**
2. Find **Confirm email** toggle
3. Make sure it's **ENABLED** (toggle is on)
4. Click **SAVE**

**What happens:**
- New users receive a confirmation email
- They must click the link to confirm
- Only after confirmation can they sign in
- More secure, prevents typos

**Sign-up flow:**
- User signs up → email sent
- User clicks email link
- User auto-logged in
- Can access protected routes

---

### Option B: Auto-Confirm Emails (Development Only)

1. Go to **Authentication** → **Providers** → **Email**
2. Find **Confirm email** toggle
3. **DISABLE** it (toggle is off)
4. Click **SAVE**

**What happens:**
- New users auto-confirmed immediately
- No email verification needed
- Instant access to app
- Less secure, good for testing

**Sign-up flow:**
- User signs up → auto-confirmed
- User instantly logged in
- Can immediately access protected routes

✅ **Email confirmation is configured!**

---

## Step 6: Set up Storage (Avatars)

> [!IMPORTANT]
> This step requires a manual action in the Supabase Dashboard UI. SQL scripts cannot fully initialize a storage bucket's physical location.

To enable avatar uploads, you need to create a storage bucket and set up permissions:

### 6.1 Create `avatars` Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name it: `avatars`
4. Toggle **Public bucket** to **ON**
5. Click **Create bucket**

### 6.2 Set up Storage Policies

Go to **SQL Editor**, create a new query, and run this SQL:

```sql
-- Allow public access to view any avatar
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow users to upload to their own folder (matches auth.uid)
create policy "Users can upload to their own folder"
  on storage.objects for insert
  with check ( 
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update files in their own folder
create policy "Users can update their own files"
  on storage.objects for update
  using ( 
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete files in their own folder
create policy "Users can delete their own files"
  on storage.objects for delete
  using ( 
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

✅ **Storage is configured!**

---

## Step 7: Set up Inventory Schema

Go to **SQL Editor**, create a new query, and run this SQL:

```sql
-- Create a table for vault items
create table vault_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  category_id uuid references categories(id),
  location text,
  value decimal(12,2) default 0.00,
  photo_url text,
  photo_path text,
  description text,
  effective_date date,
  expiration_date date,
  reminder_enabled boolean default false,
  jurisdiction_city text,
  jurisdiction_state text,
  jurisdiction_country text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table vault_items enable row level security;
-- (Standard CRUD policies follow - see db_scripts/03_create_vault_items.sql)
```

✅ **Inventory Schema is configured!**

---

## Step 8: Advanced Admin & RBAC Setup (CRITICAL)

To enable the Admin Dashboard and fix RLS recursion issues, run the comprehensive script in `db_scripts/09_comprehensive_admin_fix.sql`.

Key components included:
- **`check_is_admin()` SECURITY DEFINER function**: Bypasses RLS loops.
- **`public.get_system_stats_admin()`**: Global analytics for admins.
- **Audit Logs & RPCs**: Support for user management.

---

## Step 9: Edge Function Deployment

Deploy the following functions using Supabase CLI:
1. `generate-embedding`: Supports AI Semantic Search.
2. `create-checkout-session`: (In Progress) Supports Stripe integration.

✅ **Edge Functions are mapped!**

---

## Summary of All Steps

| Step | Task | Status |
|------|------|--------|
| 1 | Enable Google provider | ✓ Complete |
| 2 | Set Site URL & Redirects | ✓ Complete |
| 3 | Email confirmation setting | ✓ Complete |
| 4 | Get API keys & `.env.local` | ✓ Complete |
| 5 | Set up Database Schema (Profiles) | ✓ Complete |
| 6 | Set up Storage (Avatars & Photos) | ✓ Complete |
| 7 | Set up Inventory Schema | ✓ Complete |
| 8 | Advanced Admin & RBAC Fixes | ✓ Complete |
| 9 | Edge Function Deployment | 🚧 Partial |
| 10 | Backend Restoration (Step #2) | ⏳ Next |

## Step 10: Backend Restoration & Stripe (Step #2)

As of Feb 15, the root `/supabase` directory must be restored or rebuilt to enable:
- `create-checkout-session`: Processes Stripe payments.
- `check-expirations`: Automated item scanning for Phase 11.

✅ **Setup mapped for Step #2!**

## Next Steps

1. **Test Admin Dashboard:** Navigate to `/admin` to verify global stats access.
2. **AI Search:** Try searching for an item by description to test the vector engine.
3. **Monetization:** Configure Stripe keys in `.env.local` for the upcoming Phase 13.

---

## 🛠 Troubleshooting

### "Bucket not found" Error
If you see an error saying `Bucket not found` when trying to upload a photo:

**Cause:** The SQL script sets up *permissions*, but the actual storage bucket must be initialized through the Supabase Dashboard UI.

**Fix:**
1.  Go to **Storage** in your Supabase Dashboard.
2.  Click **New bucket**.
3.  Name it exactly `avatars`.
4.  Ensure **Public bucket** is toggled **ON**.
5.  Click **Create**.

---

## Common Questions

### Q: Is the Anon Key secret?
**A:** No, it's public. It's safe to include in frontend code. Use Row Level Security policies to protect sensitive data.

### Q: Do I need to set different credentials for development vs production?
**A:** No, same credentials work for both. Just add different Site URLs and Redirect URLs when you deploy.

### Q: Can I use the same Google account for testing?
**A:** Yes, you can sign in with any Google account. Create separate test accounts if needed.

### Q: What if users want to use both email and Google?
**A:** If they sign up with email, then use Google OAuth with the same email, Supabase automatically links the accounts.

### Q: Where do I find my project credentials later?
**A:** Supabase Dashboard → **Settings** → **API** (for URL and Anon Key) or **Authentication** → **Providers** → **Google** (for OAuth credentials)

---

## You're All Set! 🎉

Your React app now has:
- ✅ Email/password authentication
- ✅ Google OAuth authentication
- ✅ Protected routes
- ✅ Session management
- ✅ Automatic session persistence
- ✅ **User Profiles**

Start building! 🚀
