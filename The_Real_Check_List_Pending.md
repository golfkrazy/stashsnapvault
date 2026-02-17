# The_Real_Check_List_Pending.md

This document identifies the actual "Pending" items for the StashSnap Vault project by reconciling the official **Dr. Lee Comprehensive Checklist** (`00_StashSnapVault_CheckList.md`) with the current state of the codebase.

---

## 🔴 CRITICAL - COMPLETELY MISSING
These features are marked as "✅" or "🔥 NEXT" in the reference checklist but have **no implementation** in the current codebase.

### Phase 06: Local-First Sync Engine
- [ ] **Dexie.js Integration**: The library is missing from `package.json`.
- [ ] **Offline-First Architecture**: No logic exists to handle data persistence when offline.
- [ ] **Conflict Resolution**: No mechanism to merge local changes with Supabase.

### Phase 08: AI Concierge (Chatbot)
- [ ] **Vault Oracle Widget**: The "Glassy AI Orb" or Chatbot component is missing from `src/components`.
- [ ] **RAG Flow**: No current implementation for chatting with the Natural Language Vault.

### Phase 11: Automated Guardian (Alerts)
- [ ] **`check-expirations` Edge Function**: The server-side code for periodic alert checks is missing from the workspace.
- [ ] **Resend Automation**: Integration with Resend for outgoing email notifications is not implemented.
- [ ] **UI Warnings**: The `VaultItemCard.tsx` does not display expiration warnings or red highlights.

---

## 🟡 PARTIAL - INCOMPLETE IMPLEMENTATION
These features are partially functional or localized to a single file and need standardization.

### Phase 04/11: Document-Specific Support
- [x] **Standardized Add/Edit**: `AddItemPage.tsx` now includes date and jurisdiction fields.
- [x] **Item Card Visibility**: `VaultItemCard.tsx` displays Effective and Expiration dates.
- [x] **Jurisdiction Consistency**: Functional cascading dropdowns implemented in `AddItemPage.tsx`.

### Phase 13: Stripe Monetization
- [x] **Pricing UI**: The `PricingPage.tsx` exists and looks premium.
- [x] **Tier Enforcement**: `AddItemPage.tsx` now blocks item creation at 50 items for Free users.
- [ ] **Payment Backend**: The "create-checkout-session" logic depends on a missing Edge Function.

---

## 🟢 COMPLETED & VERIFIED
These features are confirmed 100% operational in the current codebase.

### Phase 07: Admin Dashboard & RBAC
- [x] **Vault Command Center**: Fully functional dashboard with global stats.
- [x] **Privileged User Management**: Admin-only RPC for viewing all profiles.
- [x] **Branded Modals**: Custom glassmorphic replacements for all native alerts/confirms.

### Phase 08: Semantic Search
- [x] **Dual-Embedding Search**: Functional service for searching by meaning/location.
- [x] **Keyword Integration**: Unified search bar in `InventoryPage.tsx`.

---

## 🛠️ Immediate Roadmap for Completion

1.  **Sync AddItem with EditItem**: Bring the advanced Document and Jurisdiction fields to the creation screen.
2.  **Item Card Upgrade**: Add the Expiration Date and "Last Updated" visibility to the main vault view.
3.  **Monetization Enforcement**: Add a simple check in the save flow to block item creation if `items_count >= 50` for Free users.
4.  **Install Dexie**: Begin Phase 06 by adding the dependency and creating initial schemas.

---
*Generated: 2026-02-13 | Context: 321*
