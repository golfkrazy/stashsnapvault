# StashSnap Vault - Quick Reference Checklist

**Project:** StashSnap Vault (Web Migration)
**Tech Stack:** React + Vite + Supabase
**Status:** Phase 4: Core Vault Inventory (In Progress)

---

## ✅ PHASE 1: CORE AUTH & BASE SETUP
- [x] Initialize React/Vite project
- [x] Configure Supabase Client and Environment Variables
- [x] Implement Email/Password Auth
- [x] Implement Google OAuth (Single Client ID strategy)
- [x] Implement Auth Protected Routes
- [x] Setup Session Context Provider

---

## ✅ PHASE 2: VISUAL FOUNDATION & BRANDING
- [x] Create Premium Logo and Splash Screen
- [x] Implement Glassmorphism CSS Theme (Deep Navy/Electric Blue)
- [x] Configure Global Theme Variables in `src/index.css`
- [x] Polish Auth UI (Home links, Hover effects)
- [x] Implement Splash Screen with Fade-out Logic

---

## ✅ PHASE 2.2: USER PROFILE & STORAGE
- [x] Create `user_profiles` Database Table
- [x] Implement `ProfilePage.tsx` with Form Validation
- [x] Create `avatars` Storage Bucket in Supabase
- [x] Implement Folder-based RLS Policies (User Folders)
- [x] Implement Avatar Photo Upload and Preview
- [x] Implement History-aware Navigation (`navigate(-1)`)

---

## ✅ PHASE 3: FEATURE IDENTIFICATION
- [x] Analyze React Native (Expo) Backup Code
- [x] Map AsyncStorage Logic to Supabase Schema
- [x] Create [Wishlist.md](file:///C:/Users/anaof/.gemini/antigravity/brain/9757c585-e7e9-441f-827e-2c900f185be7/wishlist.md) for Legacy Features
- [x] Create [Refined Phase 4 Roadmap](file:///C:/Users/anaof/.gemini/antigravity/brain/9757c585-e7e9-441f-827e-2c900f185be7/implementation_plan.md)

---

## 🚀 PHASE 4: CORE VAULT INVENTORY (NEXT)
- [ ] **4.1 Database & Security**
    - [ ] Execute `vault_items` SQL schema (Step 7 in Setup Guide)
    - [ ] Create `item-photos` storage bucket
- [ ] **4.2 Inventory Dashboard**
    - [ ] Implement List View with Glassmorphism Cards
    - [ ] Add "Total Vault Value" Stats Bar
- [ ] **4.3 "Snap" Flow**
    - [ ] Implement Camera API for Web Snaps
    - [ ] Connect Add Item form to Supabase
- [ ] **4.4 Management**
    - [ ] Implement Delete and Multi-photo support

---

## 🚨 TECHNICAL NOTES
- **Google OAuth:** Use existing Client ID `...7gi`. Do not create new ones.
- **Storage Pathing:** `avatars/{user_id}/filename` (Required for RLS).
- **Environment:** `.env.local` contains Supabase URL and Anon Key.
- **Troubleshooting:** See `SUPABASE_SETUP_GUIDE.md` for "Bucket not found" and RLS fixes.

**Current Step:** Ready to execute `03_create_vault_items.sql` in Supabase.
