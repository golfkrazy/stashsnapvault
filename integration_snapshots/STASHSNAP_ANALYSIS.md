# StashSnap Feature Analysis & Web Migration Strategy

**Date:** January 27, 2026  
**Discovery:** StashSnap is a COMPLETE inventory management app!

---

## 🎯 WHAT STASHSNAP ACTUALLY IS

### App Purpose
**StashSnap** is a personal inventory management app that helps users:
- Track valuable items with photos
- Organize items by categories
- Remember where items are stored
- Track item values
- Search and filter items

### Target Audience
- Caregivers managing belongings for others
- People who forget where they put important items
- Anyone wanting to catalog valuables

### Business Model
- One-time payment: $0.99
- No subscription
- Private & secure (local storage)

---

## 📱 CURRENT FEATURES (React Native)

### 1. **Landing Page** (Marketing)
- Hero section with value proposition
- Problem statements (anxiety, searching, frustration)
- Feature highlights
- Call-to-action
- Pricing display
- Trust indicators

### 2. **Home Screen** (Main Dashboard)
- **Stats Card**
  - Total items count
  - Total value calculation
- **Category Management**
  - Default categories: Documents, Jewelry
  - Custom categories with emoji icons
  - Color-coded categories
  - Delete custom categories (with validation)
- **Item List**
  - Display all items or filter by category
  - Item cards with photo, title, category, location, value
  - Edit item functionality
  - Delete item functionality
- **Item Detail Modal**
  - Full-screen item view
  - Photo display
  - All item details
  - Edit mode
  - Created date

### 3. **Add Item Screen** (Explore Tab)
- **Photo Capture**
  - Take photo with camera
  - Choose from gallery
  - Photo preview
  - Remove photo
- **Item Details Form**
  - Title (required)
  - Category selection (required)
  - Location (optional)
  - Estimated value (optional)
- **Data Persistence**
  - Save to AsyncStorage
  - Photo saved to file system

### 4. **Modal Screen** (Demo/Placeholder)
- Simple modal example
- Not currently used in main flow

---

## 💾 DATA STRUCTURE

### Item Model
```typescript
type Item = {
  id: string;
  title: string;
  category: string;
  location: string;
  photoUri?: string;
  value?: number;
  createdAt: number;
};
```

### Category Model
```typescript
type Category = {
  name: string;
  icon: string;  // emoji
  color: string; // hex color
};
```

### Storage Keys
- `stashsnap_items` - Array of items
- `stashsnap_categories` - Array of categories
- Photos stored in `FileSystem.documentDirectory/stashsnap_photos/`

---

## 🔄 WEB MIGRATION STRATEGY

### Option A: Full Rebuild (Recommended)
**Start with E2E template, rebuild StashSnap features for web**

#### Why This is Best:
1. ✅ Get authentication immediately
2. ✅ Clean web-first architecture
3. ✅ No React Native baggage
4. ✅ Faster development
5. ✅ Better web UX

#### What to Build:
1. **Keep from template:**
   - Authentication system (email/password + Google OAuth)
   - Protected routes
   - Session management
   - Router setup
   - Provider structure

2. **Add from StashSnap:**
   - Landing page (convert to HTML/CSS)
   - Dashboard (convert to HTML/CSS)
   - Add item form (convert to HTML/CSS)
   - Category management
   - Item management
   - Photo upload (web file input)
   - LocalStorage for data

3. **Enhance for web:**
   - User accounts (store items in Supabase)
   - Cloud photo storage (Supabase Storage)
   - Multi-device sync
   - Better search/filtering
   - Export/import data
   - Print inventory reports

---

## 📋 DETAILED MIGRATION PLAN

### Phase 1: Set Up Base (1 hour)
1. Copy E2E template
2. Rename to StashSnap
3. Update branding
4. Test auth works
5. Set up Supabase

### Phase 2: Database Schema (1 hour)
Create Supabase tables:

```sql
-- Users table (handled by Supabase Auth)

-- Items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  photo_url TEXT,
  value DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- Same for categories
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);
```

### Phase 3: Convert Landing Page (2 hours)
**File:** `src/pages/LandingPage.tsx`

Convert React Native components to HTML:
- `View` → `div`
- `Text` → `p`, `h1`, `h2`, etc.
- `TouchableOpacity` → `button`
- `ScrollView` → `div` with CSS overflow
- StyleSheet → CSS file

**File:** `src/pages/LandingPage.css`

Convert inline styles to CSS classes

### Phase 4: Convert Dashboard (3 hours)
**File:** `src/pages/DashboardPage.tsx`

Features to implement:
- Stats card (total items, total value)
- Category filter
- Item grid/list
- Item detail modal
- Edit item modal
- Delete confirmation

**API Integration:**
- Fetch items from Supabase
- Fetch categories from Supabase
- Real-time updates (optional)

### Phase 5: Convert Add Item Form (2 hours)
**File:** `src/pages/AddItemPage.tsx`

Features to implement:
- Photo upload (web file input)
- Upload to Supabase Storage
- Form validation
- Category selection
- Save to Supabase

### Phase 6: Category Management (1 hour)
**File:** `src/components/CategoryManager.tsx`

Features:
- Create custom categories
- Delete custom categories
- Emoji picker (web-friendly)
- Color picker

### Phase 7: Protected Routes (30 minutes)
Update router to protect dashboard and add item pages:

```tsx
{
  path: "/",
  element: <Providers />,
  children: [
    // Public routes
    { path: "/", element: <LandingPage /> },
    { path: "/auth/sign-in", element: <SignInPage /> },
    { path: "/auth/sign-up", element: <SignUpPage /> },
    
    // Protected routes
    {
      path: "/",
      element: <AuthProtectedRoute />,
      children: [
        { path: "/dashboard", element: <DashboardPage /> },
        { path: "/add-item", element: <AddItemPage /> },
        { path: "/settings", element: <SettingsPage /> },
      ],
    },
  ],
}
```

### Phase 8: Styling & Polish (2 hours)
- Match StashSnap color scheme (#7C3AED purple)
- Responsive design
- Animations
- Loading states
- Error handling

### Phase 9: Testing (2 hours)
- Test all CRUD operations
- Test photo upload
- Test authentication flows
- Test on different browsers
- Test responsive design

### Phase 10: Deployment (1 hour)
- Deploy to Vercel/Netlify
- Configure Supabase for production
- Set up custom domain (optional)
- Test production build

---

## 🎨 DESIGN SYSTEM

### Colors (from StashSnap)
```css
:root {
  --primary: #7C3AED;        /* Purple */
  --primary-light: #A78BFA;
  --primary-dark: #5B21B6;
  
  --secondary: #EC4899;      /* Pink */
  --success: #10B981;        /* Green */
  --warning: #F59E0B;        /* Orange */
  --danger: #EF4444;         /* Red */
  
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-600: #6B7280;
  --gray-700: #1F2937;
  --gray-900: #111827;
  
  --blue: #3B82F6;
}
```

### Typography
- Headers: Bold, large sizes
- Body: Regular, readable sizes
- Emojis: Used for visual interest

---

## 📊 FEATURE COMPARISON

| Feature | Current (RN) | Web Version | Enhancement |
|---------|-------------|-------------|-------------|
| **Auth** | ❌ None | ✅ Supabase | User accounts |
| **Storage** | Local only | Cloud + Local | Multi-device sync |
| **Photos** | File system | Supabase Storage | Cloud backup |
| **Categories** | Local | Database | Sync across devices |
| **Items** | Local | Database | Sync across devices |
| **Search** | Basic filter | Advanced search | Full-text search |
| **Export** | ❌ None | ✅ CSV/PDF | Data portability |
| **Sharing** | ❌ None | ✅ Share lists | Collaboration |
| **Pricing** | $0.99 one-time | Subscription? | Recurring revenue |

---

## 💰 MONETIZATION STRATEGY

### Current Model (Mobile)
- $0.99 one-time payment
- No subscription
- Local storage only

### Final Approved Model (Local-First + Cloud)

**Architecture:** IndexedDB (Local) + Supabase (Cloud Sync)

1. **Free Tier ($0/mo)**
   - 50 items
   - 1 user
   - **Local storage only (IndexedDB)**
   - 10 photos max (local)
   - Works offline (no cloud backup)

2. **Premium Tier ($4.99/mo or $49/yr)**
   - Unlimited items
   - 1 user
   - **Local storage + Cloud Sync**
   - Unlimited photos (cloud)
   - Multi-device sync
   - Cloud backup
   - Export/import

3. **Family Tier ($9.99/mo or $99/yr)**
   - Everything in Premium
   - Up to 5 users
   - **Local + Cloud Sync**
   - Shared inventories
   - Admin controls

---

## 🚀 IMPLEMENTATION TIMELINE

### Week 1: Foundation
- Day 1-2: Set up base (E2E template + Supabase)
- Day 3-4: Database schema + API integration
- Day 5: Landing page conversion

### Week 2: Core Features
- Day 1-2: Dashboard conversion
- Day 3-4: Add item form conversion
- Day 5: Category management

### Week 3: Polish & Deploy
- Day 1-2: Styling & responsive design
- Day 3-4: Testing & bug fixes
- Day 5: Deployment & documentation

**Total: 15 days (3 weeks)**

---

## ✅ IMMEDIATE NEXT STEPS

### Decision Required:
**Which approach do you prefer?**

**Option 1: Quick Start (Recommended)**
- Use E2E template as base
- Rebuild StashSnap features for web
- Add cloud storage with Supabase
- **Time:** 15 days
- **Result:** Professional web app with auth + cloud features

**Option 2: Hybrid**
- Convert existing StashSnap components to React web
- Integrate E2E auth
- Keep local storage initially
- **Time:** 10 days
- **Result:** Web version similar to mobile, with auth

**Option 3: Full Conversion**
- Convert entire React Native app to web
- Add E2E auth on top
- Minimal changes to features
- **Time:** 7 days
- **Result:** Direct port with auth

---

## 🎯 MY RECOMMENDATION

**Go with Option 1 (Quick Start)** because:

1. ✅ **Better UX**: Web-first design, not mobile port
2. ✅ **Cloud Features**: Multi-device sync, backup
3. ✅ **Scalable**: Database-backed, not localStorage
4. ✅ **Monetizable**: Can add premium tiers
5. ✅ **Professional**: Clean architecture from start
6. ✅ **Future-proof**: Easy to add features

**Plus, you get:**
- Authentication (email/password + Google OAuth)
- User accounts
- Cloud photo storage
- Multi-device sync
- Better search/filtering
- Export/import
- Collaboration features (future)

---

## 📝 WHAT I NEED FROM YOU

1. **Confirm approach:** Option 1, 2, or 3?
2. **Supabase setup:** Do you have credentials or should I guide you?
3. **Monetization:** Keep $0.99 one-time or switch to subscription?
4. **Timeline:** How quickly do you need this?
5. **Features:** Any features to add/remove?

**Ready to start building?** 🚀
