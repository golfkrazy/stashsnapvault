
# 📋 NEXT SESSION BRIEF: StashSnap Migration

**Date:** January 28, 2026
**Status:** Phase 1 & 1.5 COMPLETE. Ready for Phase 2.

## ✅ Accomplishments
1.  **Project Base:** `stashsnap` web app initialized (React + Vite + Supabase) from `E2E` template.
2.  **Backup:** Original Expo code safely stored in `_backup_expo`.
3.  **Authentication:**
    *   Email/Password works.
    *   **Google OAuth works** (Resolved Client ID conflict).
4.  **Security:**
    *   Rate Limiting active (3 attempts -> 15 min lockout).
    *   "Soft" lockout via `localStorage` (UX guardrail).
    *   User warnings implemented (Warn at 2nd fail).

## 📍 Current State
- **Repo:** `c:\aom_NewXPS\ClaudeProjects\stashsnap`
- **Dev Server:** Runs on `http://localhost:5173` and `http://192.168.1.221:5173`.
- **Supabase:** Connected (`.env.local` configured). Redirects configured for Local + Network.
- **Plan File:** `integration_snapshots\REVISED_PLAN_WEB_APP.md` (Contains the master plan + OAuth guide).

## ⏭️ NEXT STEPS: Phase 2 (Visual Foundation)
The user is pausing to research **Magic MCP / 21st.dev** templates. When resuming:

1.  **Logo:** User will decide on generating vs. providing a logo.
2.  **Theme:** Implement CSS variables for the chosen aesthetic (likely Glassmorphism/Dark).
3.  **Templates:** Use Magic MCP to pull in premium UI components.
4.  **Layout:** Create the shared application shell (Header/Nav/Sidebar).

**Technicals to Remember:**
- **Single Client ID:** Do NOT create a new Google Client ID. Use the existing one (`...7gi`) that has the Redirect URIs configured.
- **Network Access:** Run `npm run dev` (it already has `--host` flag) to test on mobile.