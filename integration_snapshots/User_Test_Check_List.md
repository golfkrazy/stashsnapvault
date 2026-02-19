# StashSnap Vault - Beta User Test Checklist

Welcome to the StashSnap Vault beta! This document is your guide to testing the current functionality. Please use the checkboxes `[ ]` to mark your progress and report any anomalies.

---

## 1. Authentication & Onboarding
*Goal: Verify you can securely enter and set up your vault.*

- [ ] **Email Signup & Verification**
    - **Instructions:** Create a new account using your email.
    - **Expected:** You should receive a verification email (check spam). Once verified, you should be logged in automatically.
    - **Anomalies:** Verification link not working; account not auto-logon after verification.
- [ ] **Google OAuth Login**
    - **Instructions:** Sign in using the "Continue with Google" button.
    - **Expected:** A popup should appear; once selected, you should land on the "Explore" or "Home" screen.
    - **Anomalies:** "Select Account" prompt not appearing; landing on a blank screen after login.
- [ ] **Profile Setup & Avatar**
    - **Instructions:** Go to Profile, upload a photo, and use `Ctrl+S` to save.
    - **Expected:** Success toast "Profile Updated!"; avatar should persist after refresh.
    - **Anomalies:** Photo not uploading; `Ctrl+S` not triggering save; save takes longer than 10 seconds.
- [ ] **Professional Auth Emails**
    - **Instructions:** Check the signup/reset emails received.
    - **Expected:** Emails should have a cyan "StashSnap Vault" button, clear branding, and look professional.
    - **Anomalies:** Red "Dangerous" banner in Gmail.
- [ ] **Password Reset Error Logic**
    - **Instructions:** Request a reset link, wait 10+ minutes (or click it twice).
    - **Expected:** You should see a friendly "Link Expired" screen with a "Get Fresh Link" button.
    - **Anomalies:** Seeing a raw Supabase error or a 404 page.

---

## 2. Item Management (The "Vault")
*Goal: Verify the core "Snap" and "Store" experience.*

- [ ] **Add New Item**
    - **Instructions:** Use the "Add Item" button. Fill in Title, Category, Location, and Value.
    - **Expected:** Item appears immediately in your inventory list.
    - **Anomalies:** Loading spinner hangs; fields like "Value" not accepting decimals; photo preview not showing.
- [ ] **Smart Location Dropdowns**
    - **Instructions:** Try selecting a Country, then State, then City.
    - **Expected:** States should filter based on Country; Cities should filter based on State.
    - **Anomalies:** Dropdowns showing all states in the world simultaneously; selection not saving.
- [ ] **Edit Existing Item**
    - **Instructions:** Click an item, change the location or value, and save.
    - **Expected:** The "Last Updated" timestamp should reflect the current time and be highlighted in red if today.
    - **Anomalies:** Red highlight appearing on old dates; changes not persisting after refresh.
- [ ] **Expiration Warnings**
    - **Instructions:** Set an "Expiration Date" for tomorrow on a document.
    - **Expected:** The date should be highlighted in **BOLD RED** on the item card.
    - **Anomalies:** No red highlight for upcoming expirations; incorrect date formatting.

---

## 3. Search & AI Intelligence
*Goal: Verify finding items via standard and AI-powered search.*

- [ ] **Standard Search**
    - **Instructions:** Type part of an item title in the search bar.
    - **Expected:** The list should filter in real-time.
    - **Anomalies:** Search being case-sensitive (e.g., "Box" works but "box" doesn't); lag of more than 1 second.
- [ ] **AI Semantic Search (Premium)**
    - **Instructions:** Toggle the "✨ AI Semantic Search" (Purple Glow) and search for a meaning (e.g., search "something to read" to find a "Book").
    - **Expected:** Relevant items should appear based on *meaning*, not just text match.
    - **Anomalies:** Error message when toggle is on; results being completely irrelevant.
- [ ] **Search Modes**
    - **Instructions:** Switch between "Item", "Location", and "Category" search modes.
    - **Expected:** Results should change based on the selected focus.
    - **Anomalies:** Selection not sticking; results always searching "Item" regardless of mode.

---

## 4. Utility: Trash & Bulk Operations
*Goal: Verify efficient management and data safety.*

- [ ] **Move to Trash**
    - **Instructions:** Click the bin icon on an individual item card.
    - **Expected:** Item disappears from main inventory and moves to `/inventory/trash`.
    - **Anomalies:** Item deleted permanently instead of moving to trash; inventory not refreshing.
- [ ] **Bulk Selection**
    - **Instructions:** Hover over item cards and click the checkboxes in the top corner.
    - **Expected:** A floating "Bulk Action Toolbar" should appear at the bottom.
    - **Anomalies:** Toolbar not appearing; checkbox being difficult to click.
- [ ] **Bulk Trash & Restore**
    - **Instructions:** Select 3 items, click "Move to Trash" in the toolbar. Go to Trash, select them again, and "Restore".
    - **Expected:** All 3 items should move/restore simultaneously.
    - **Anomalies:** Only one item moving; multi-select clearing itself accidentally.
- [ ] **Permanent Purge**
    - **Instructions:** In the Trash Bin, click "Delete Permanently".
    - **Expected:** Item is finally removed from the system and storage.
    - **Anomalies:** Item re-appearing after page refresh.

---

## 5. Tiered Usage (The "Guard")
*Goal: Verify limits and upgrade paths.*

- [ ] **Free Tier Item Limit**
    - **Instructions:** Try to add an 11th item as a free user.
    - **Expected:** A "Branded Upgrade Prompt" should appear, preventing the add.
    - **Anomalies:** Being able to add unlimited items on a free account.
- [ ] **Premium Upgrade Flow**
    - **Instructions:** Click the upgrade button/link.
    - **Expected:** Redirection to Stripe Checkout; after payment, a "Premium Celebration" modal should appear.
    - **Anomalies:** Stripe failing to load; celebration modal not appearing after successful payment.

---
 
 ## 6. Security & UI Density
 *Goal: Verify backend hardening and visual optimization.*
 
 - [ ] **Security Audit: Views & RLS**
     - **Instructions:** Check the "Command Center" dashboard and category counts.
     - **Expected:** Data should load correctly. Behind the scenes, these now use `security_invoker` for standard-compliant RLS.
     - **Anomalies:** "0" items shown when items clearly exist; permission denied errors.
 - [ ] **Password Reset Resilience**
     - **Instructions:** Request a reset. (Admin/Dev verify `password_reset_tokens` has RLS enabled).
     - **Expected:** Standard users cannot see each other's tokens.
     - **Anomalies:** RLS not enabled warnings in Supabase.
 - [ ] **UI Grid Density**
     - **Instructions:** Open the Inventory Page on a standard desktop browser.
     - **Expected:** You should see **3 items across** in the grid. Cards should feel compact and professional.
     - **Anomalies:** Items still in 1 or 2 columns; text overflowing card boundaries.
 
---

## 🛑 What to Report (Anomalies)
- **Lag:** Anything taking longer than 3 seconds (except search/embeddings, which can take ~5s).
- **Broken Layout:** Text overlapping, buttons missing, or the app not working on your mobile phone.
- **Dead Ends:** Clicking a button and nothing happens.
- **Data Ghosts:** Items you deleted appearing again, or changes you saved reverting back.

**Thank you for helping us harden the StashSnap Vault!**
