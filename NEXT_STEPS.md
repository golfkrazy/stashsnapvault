# StashSnap - Technical Roadmap & Next Steps
 
**Status:** Phase 1-5 Complete. Phase 7-11 Complete. Entering **Phase 13: Stripe integration**.
 
---
 
## ✅ Completed Milestones
- **Infrastructure:** Vite + React 19 + TypeScript base established.
- **Authentication:** Supabase Auth (Email/Pass + Google OAuth) fully operational with `select_account` prompt.
- **Profiles:** User Profiles, Avatar Storage, Ctrl+S Save, and "All Set!" flow complete.
- **Inventory UI:** `InventoryPage.tsx` and `EditItemPage.tsx` functional with site-wide branding.
- **Admin Command Center:** Dashboard with stats and user management live.
- **Branding:** Site-wide `BrandHeader` and `BrandFooter` consolidated.
- **Testing:** Vitest framework established with 100% sanity pass rate.
- **Stripe & Subscriptions:** Edge Functions for checkout and webhooks live. Item limit (10) for Free tier enforced with branded error modals. Comprehensive `Stripe_Payment_Setup.md` created.
- **Shared Device Security:** Per-email login lockout logic for shared devices implemented.
- **AI UX:** Premium "Purple Shine" semantic search toggle with auto-ON state.

---

## 🚀 Immediate Action Plan (Commander & Pricing Polish)
 
### 1. Commander Dashboard Expansion
- [ ] **Screen:** Implement `SubscriptionManagement.tsx` for tracking renewals.
- [ ] **Logic:** Implement RED highlighting for renewal dates < 7 days.

### 2. Monetization Expansion
- [ ] **Storage Fee:** Implement \$9.99 one-time grace fee for canceled premium users.
- [ ] **Renewal Incentive:** Loyalty 15% discount logic for 6-month subscribers.

---

## 🛠️ Upcoming Technical Phases

### Phase 6: Local-First Sync Engine
- **Dexie.js Integration:** Install and configure IndexedDB for offline persistence.
- **Sync Service:** Create `src/services/SyncService.ts` for reconciling IndexedDB and Supabase.

### Phase 8: AI Chatbot & Alerts
- **AI Widget:** Implement the "Glassy AI Orb" (`ChatWidget.tsx`) for natural language vault queries.
- **Automated Guardian:** Deploy Supabase Edge Function to check for expiries and send Resend emails.

---

## 📂 Key Documentation
- **[Real Pending Checklist](file:///c:/aom_NewXPS/ClaudeProjects/stashsnap/The_Real_Check_List_Pending.md):** Definitive list of gaps.
- **[Active Checklist](file:///c:/aom_NewXPS/ClaudeProjects/stashsnap/integration_snapshots/StashSnapVault_CheckList.md):** Detailed feature tracking.
- **[Integration Summary](file:///c:/aom_NewXPS/ClaudeProjects/stashsnap/integration_snapshots/INTEGRATION_SUMMARY.md):** High-level summary and persistence log.

---

## 🚦 Troubleshooting & Reminders
- **Sync Logic:** Ensure `updated_at` timestamps are handled correctly in both Dexie and Supabase to avoid overwrites.
- **Admin Modals:** Use the `showAlert` and `showConfirm` patterns established in `AdminDashboard.tsx` for all new UI feedback.
