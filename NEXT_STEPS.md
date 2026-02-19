# StashSnap - Technical Roadmap & Next Steps
 
**Status:** Utility Phase & Authentication Professionalization Complete. Entering **Phase 6: Local-First Resilience**.
 
---
 
## ✅ Completed Milestones
- **Infrastructure:** Vite + React 19 + TypeScript base + Netlify SPA Routing fix.
- **Authentication Professionalized:** 
    - 8 customized HTML templates (Signup, Reset, Magic Link, etc.).
    - Robust error handling for `otp_expired` reset links.
    - Explicit `emailRedirectTo` origin management.
- **Profiles:** User Profiles, Avatar Storage, Ctrl+S Save, and "All Set!" flow complete.
- **Inventory UI & Utilities:** `InventoryPage.tsx` functional with Multi-select, Trash & Recovery, and Bulk Operations.
- **Admin Command Center:** Dashboard with stats and Subscription Management ledger live.
- **Testing:** Vitest framework established with 100% sanity pass rate.
- **Stripe & Subscriptions:** Edge Functions for checkout and webhooks live. Item limit (10) for Free tier enforced.
- **AI UX:** Premium "Purple Shine" semantic search toggle with auto-ON state.
- **Security & RLS Hardening:** 
    - Resolved "SECURITY DEFINER" lint for `item_count_by_category` and `user_statistics`.
    - Secured `password_reset_tokens` with RLS.
    - Verified `user_id` column ownership across all sensitive tables.
- **UI Grid Optimization:** Implemented high-density 3-item grid in `InventoryPage.tsx` with compact card styling.

---

---

## 🚀 Priority Roadmap (Next Phase)

### 1. Growth & Retention "API-First" Layer
*Goal: Build reusable services for growth that can be ported to any application.*
- [ ] **Billing Service (`BillingService.ts`)**: Implement the 24-hour "No-Stress" Cancellation logic with automated Stripe refunds.
- [ ] **Growth Service (`GrowthService.ts`)**: Implement social multi-channel invites (Email, WhatsApp, Socials) via Web Share API.
- [ ] **Social Proof Engine**: Implement omni-platform review posting (X, Facebook, Instagram) via Intent URLs.

### 2. Phase 6: Local-First Resilience (Dexie.js)
*Goal: Ensure the vault stays open even when the network is closed.*
- [ ] **Dexie.js Integration**: Install and configure IndexedDB for offline persistence.
- [ ] **Sync Service (`SyncService.ts`)**: Create reconciliation logic between IndexedDB and Supabase.

### 3. Monetization & Incentives
- [ ] **Renewal Incentive**: Loyalty 15% discount logic for 6-month subscribers to boost LTV.
- [ ] **Downgrade Flow**: Implement the $9.99 grace fee for canceled premium users to maintain vault integrity.

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
