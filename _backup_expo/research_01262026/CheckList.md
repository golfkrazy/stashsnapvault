## Customer Journey & Value Proposition

**Customer Problem:** "I forget where I store important items (documents, jewelry, valuables, etc.). I need a way to quickly remember and find them."

**Customer Journey:**
1. **Store** → User wants to quickly save info about an item's location
2. **Find** → User wants to quickly retrieve info when they need it
3. **Organize** → User wants to group similar items together
4. **Recall** → User wants visual memory aids (photos)

**Success Metric:** User can store an item with location + photo in <30 seconds and retrieve it in <10 seconds

---

## High-Value Feature Priority

### Must Build for MVP (Solves Core Problem)
1. **Quick Add** - Store item + location + photo in one flow
2. **Quick Find** - Retrieve items with visual reference (photo visible)
3. **Location Recall** - See where item is stored at a glance
4. **Visual Memory** - Photos trigger memory of items and locations

### Should Build for MVP (Enhances Value)
5. **Category Grouping** - Organize by type (Documents, Jewelry, etc.)
6. **Persistence** - Data survives app restart

### Defer to Post-MVP
- Data export/import
- Statistics/analytics
- Advanced search
- Backup functionality
- Cloud sync

---

## Phase 1: "Store an Item" - The Core Flow

**Customer Goal:** Quickly capture where I stored something important

### High-Value Tasks
- [ ] **Quick capture form:** Title + Location fields (minimal fields)
- [ ] **Photo capture:** Camera button that opens camera immediately
- [ ] **One-tap save:** "Save Item" button stores everything
- [ ] **Instant feedback:** Item appears in list immediately after save
- [ ] **Smooth UX:** No friction, minimal clicks to complete

### Technical Tasks
- [ ] Item data model (title, location, photo URI, timestamp)
- [ ] Add item form with camera integration
- [ ] Save to AsyncStorage
- [ ] Display item immediately in list
- [ ] Photo saved to file system
- [ ] Form validation (title + location required, photo optional)

### Definition of Done - User Can:
- ✅ Launch app and see empty list
- ✅ Tap "Add Item" button
- ✅ Enter a title (e.g., "Passport")
- ✅ Enter a location (e.g., "Top drawer in bedroom")
- ✅ Take a photo with camera
- ✅ Tap "Save" and see item appear in list
- ✅ Close and reopen app - item still there

### Testing: Customer Journey Focus

#### User Testing (Most Important)
- [ ] **Task Test #1:** "You just found your passport. Store it with a photo. Go."
  - Success criteria: Completed in under 30 seconds
  - Measure: Time to completion, friction points

- [ ] **Task Test #2:** "Close the app completely. Reopen it. Find where you stored the passport."
  - Success criteria: Item visible immediately on open
  - Measure: Did they find it easily?

- [ ] **User Interview:** Ask after task:
  - "How easy was that on a scale of 1-10?"
  - "What was confusing?"
  - "What would make this faster?"

#### Functional Testing (Supporting)
- [ ] Camera opens and captures correctly
- [ ] Photo displays in preview before saving
- [ ] Item appears in list immediately after save
- [ ] Item persists after app restart
- [ ] Location text displays on item card
- [ ] Title displays clearly on item card

#### Technical Testing (Supporting)
- [ ] No crashes when adding items
- [ ] AsyncStorage saves successfully
- [ ] Photo file saved to correct location
- [ ] No console errors
- [ ] Memory usage acceptable

---

## Phase 2: "Find an Item" - Quick Retrieval with Visual Reference

**Customer Goal:** I need to find where I stored something. I want to see photos so my memory clicks.

### High-Value Tasks
- [ ] **List view shows photos:** Item cards display thumbnail photos prominently
- [ ] **Location visible:** Item card shows location text clearly below title
- [ ] **Visual scanning:** User can quickly scan list and identify items visually
- [ ] **Photo detail view:** Tap item to see larger photo + full location
- [ ] **Smooth scrolling:** List scrolls smoothly even with many items

### Technical Tasks
- [ ] Display photo thumbnail on item card (Home screen)
- [ ] Optimize photo loading (lazy load, cache)
- [ ] Detail modal with large photo + location text
- [ ] Handle missing photos gracefully (placeholder)
- [ ] Photo resize for performance
- [ ] Efficient list rendering (FlatList optimization)

### Definition of Done - User Can:
- ✅ See list of items with small photos visible
- ✅ See title and location at a glance
- ✅ Tap any item to see larger photo + full details
- ✅ Scroll through 20+ items smoothly
- ✅ Quickly find a specific item visually

### Testing: Customer Journey Focus

#### User Testing (Most Important)
- [ ] **Visual Recall Test:** "I need to find my passport. Go."
  - Success criteria: Found item in under 10 seconds
  - Measure: Did the photo help them remember?

- [ ] **Scan Test:** Show 10 items in list, ask "Where are your documents?"
  - Success criteria: Correctly identified relevant item
  - Measure: Photo visibility and location text clarity

- [ ] **User Interview:**
  - "Could you find things easily?"
  - "Did the photos help you remember?"
  - "What would make finding things faster?"

#### Functional Testing (Supporting)
- [ ] Photos display as thumbnails on item cards
- [ ] Location text visible on item cards
- [ ] Tap item shows large photo view
- [ ] Full location details visible in detail view
- [ ] List scrolls smoothly with 20+ items
- [ ] Missing photo shows placeholder gracefully

#### Performance Testing (Supporting)
- [ ] Photos load without lag
- [ ] List scrolling smooth at 60fps
- [ ] Memory usage reasonable with photo caching

---

## Phase 3: "Organize Items" - Category Grouping for Quick Navigation

**Customer Goal:** My items are scattered across different types (documents, jewelry, etc.). I want to find groups quickly.

### High-Value Tasks
- [ ] **Default categories:** Documents, Jewelry, Other (exist on first open)
- [ ] **Category badges:** Each item shows its category with icon
- [ ] **Filter by category:** Tap category filter to see only that type
- [ ] **Category icon recognition:** Visual icons help identify categories quickly
- [ ] **Quick filtering:** Switch between category filters instantly

### Technical Tasks
- [ ] Category data model with icon/emoji
- [ ] Default categories on first app launch
- [ ] Category dropdown in add item form
- [ ] Category filter UI on Home screen
- [ ] Filter logic and persistence
- [ ] Category badge display on item cards

### Definition of Done - User Can:
- ✅ See items assigned to categories
- ✅ Add item and select a category
- ✅ Filter list by category
- ✅ See all items or items from one category
- ✅ Categories persist after restart

### Testing: Customer Journey Focus

#### User Testing (Most Important)
- [ ] **Organization Test:** "You have 15 items. Show me just your documents."
  - Success criteria: Filtered to correct items in under 5 seconds
  - Measure: Is filtering obvious and fast?

- [ ] **Usefulness Test:** "Does grouping items by type help you find things faster?"
  - Success criteria: User confirms it helps (yes/no + why)
  - Measure: Subjective value perception

#### Functional Testing (Supporting)
- [ ] Filter shows only items in selected category
- [ ] Filter shows all items when "All" selected
- [ ] Category badge displays correctly
- [ ] Default categories exist on first install
- [ ] Categories persist after restart

---

## Phase 4: "Remember at a Glance" - Polish for Quick Reference

**Customer Goal:** When I need something, I want the app to be beautiful and fast so I use it confidently.

### High-Value Tasks
- [ ] **Dark/Light theme:** Adapt to device setting, easy on eyes at night
- [ ] **Fast performance:** App launches quickly, lists scroll smoothly
- [ ] **Clear visual hierarchy:** Most important info (photo + location) prominent
- [ ] **Intuitive buttons:** "Add", "Edit", "Delete" clear and easy to tap
- [ ] **Professional appearance:** Color scheme, spacing, fonts consistent

### Technical Tasks
- [ ] Theme detection and switching
- [ ] Optimize app startup time
- [ ] Polish list card layout (better spacing, typography)
- [ ] Color scheme definition
- [ ] Button styling and accessibility
- [ ] Modal/detail view styling

### Definition of Done - User Can:
- ✅ Use app in bright sunlight (light mode readable)
- ✅ Use app at night (dark mode easy on eyes)
- ✅ App opens quickly
- ✅ All buttons obvious and easy to tap
- ✅ Visual design looks professional

### Testing: Customer Journey Focus

#### User Testing (Most Important)
- [ ] **First Impression Test:** Show app. "What's the first thing you'd do?"
  - Success criteria: User correctly identifies main action (add item)
  - Measure: Is UI intuitive without explanation?

- [ ] **Usability Test:** "Use this in the dark/bright conditions."
  - Success criteria: User comfortable in both light/dark modes
  - Measure: Readability and eye strain

#### Visual/Design Testing (Supporting)
- [ ] Text readable in both light and dark modes
- [ ] Color contrast meets accessibility standards
- [ ] Buttons are clearly clickable
- [ ] Spacing is consistent
- [ ] Layout works on small phones (4.7") and large phones (6.7")

---

## Phase 5: "Adjust & Maintain" - Edit, Delete, and Data Safety

**Customer Goal:** I made a mistake or situation changed. I need to fix or remove an item easily.

### High-Value Tasks
- [ ] **Quick edit:** Tap item to edit title, location, or photo
- [ ] **Delete confidence:** Delete button works, item removed immediately
- [ ] **Confirmation:** Delete confirmation prevents accidental loss
- [ ] **Data recovery:** If needed, can restore from backup (post-MVP)

### Technical Tasks
- [ ] Edit item modal with form fields
- [ ] Update item in AsyncStorage
- [ ] Delete item with confirmation dialog
- [ ] Remove associated photo from file system
- [ ] UI feedback on successful edit/delete

### Definition of Done - User Can:
- ✅ Tap any item to edit it
- ✅ Change title, location, photo
- ✅ Save changes and see update immediately
- ✅ Delete an item (with confirmation)
- ✅ Item removed from list immediately after deletion

### Testing: Customer Journey Focus

#### User Testing (Most Important)
- [ ] **Edit Test:** "You moved something. Update where it is."
  - Success criteria: Completed in under 15 seconds
  - Measure: How easy was the edit process?

- [ ] **Delete Test:** "You can't find something anymore. Remove it."
  - Success criteria: Confirmation prevented accidental deletes
  - Measure: Did the confirmation feel reassuring or annoying?

#### Functional Testing (Supporting)
- [ ] Edit modal opens for selected item
- [ ] Changes save and display in list
- [ ] Delete confirmation appears before deletion
- [ ] Item removed after confirmation
- [ ] Photo file cleaned up on delete

---

## Phase 6: "Beta Test & Validate" - Real Users, Real Scenarios

**Customer Goal:** Does this actually help me remember where I put things?

### High-Value Tasks
- [ ] **Beta testing:** 5-10 real users test for 1-2 weeks
- [ ] **Core workflow:** Users store items, close app, retrieve items
- [ ] **Real scenarios:** Test with actual items they care about
- [ ] **Collect feedback:** What worked? What frustrated them?
- [ ] **Fix critical issues:** Address blockers, keep polish issues for v1.1

### Technical Tasks
- [ ] Build release version
- [ ] Test on real iOS devices
- [ ] Test on real Android devices
- [ ] Performance benchmarking
- [ ] Final bug fixes
- [ ] Documentation completion

### Definition of Done - Users Can:
- ✅ Install and use app without guidance
- ✅ Complete core workflow without friction
- ✅ Store real items they care about
- ✅ Retrieve items after app restart
- ✅ Recommend the app to a friend (NPS > 6/10)

### Testing: Customer Journey Focus

#### Real User Testing (Most Important)
- [ ] **Guided Task Test:** "Store 3 important items. Close app. Retrieve them."
  - Success criteria: All 3 items stored and retrieved correctly
  - Measure: Time to completion, friction points

- [ ] **Unguided Use Test:** "Use the app freely for a week. How was it?"
  - Success criteria: User finds app useful and would use again
  - Measure: NPS score, specific feedback

- [ ] **Critical Path Interview:**
  - "Did the app help you remember where things are?"
  - "What was the most frustrating part?"
  - "What would you change?"
  - "Would you recommend this to a friend?"

#### Functional Testing - Full Regression
- [ ] Phase 1: Add items with title + location ✓
- [ ] Phase 2: Photos display and help recall ✓
- [ ] Phase 3: Categories work and filter works ✓
- [ ] Phase 4: App looks professional ✓
- [ ] Phase 5: Edit and delete work safely ✓
- [ ] All core workflows functional
- [ ] No crashes or data loss

#### Device Testing
- [ ] Test on iPhone (real device)
- [ ] Test on Android (real device)
- [ ] Test various screen sizes
- [ ] Test after app close/restart

#### Performance & Quality
- [ ] App startup < 3 seconds
- [ ] List scrolls smoothly
- [ ] No memory leaks (test with 50+ items)
- [ ] Zero tolerance for data loss
- [ ] Professional appearance (no rough UI)

---

## MVP Success Criteria - Customer Focused

### Core Value Delivered
- ✅ Users can store items (title + location + photo) in < 30 seconds
- ✅ Users can retrieve items in < 10 seconds with visual reference
- ✅ Photos actually help users remember where things are
- ✅ Users feel confident their data is safe

### Must Have Features (Customer Needs)
1. **Quick Add Flow** - Store item with minimal friction
2. **Visual Recall** - Photos prominent in list view
3. **Location Reference** - Location text visible at glance
4. **Data Persistence** - Items survive app restart
5. **Organization** - Categories help find things
6. **Edit/Delete** - Fix mistakes safely

### Should Have (Enhanced Experience)
- Dark/Light theme support
- Professional appearance
- Smooth performance
- Intuitive UI (no explanation needed)
- Safe delete with confirmation

### Defer to Post-MVP (Nice to Have)
- [ ] Statistics/analytics
- [ ] Data export/import
- [ ] Search functionality
- [ ] Item notes/descriptions
- [ ] Cloud sync
- [ ] Advanced filtering
- [ ] Sharing

---

## Success Metrics by Phase

| Phase | Customer Metric | Target |
|-------|---|---|
| Phase 1 | Time to add first item | < 30 seconds |
| Phase 2 | Time to find item in list | < 10 seconds |
| Phase 3 | Time to filter by category | < 5 seconds |
| Phase 4 | "App looks professional" rating | 8/10 |
| Phase 5 | "Edit was easy" rating | 8/10 |
| Phase 6 | NPS (would recommend) | > 6/10 |
| **Overall** | **User satisfaction** | **8+/10** |

---

## Critical Success Factors

**Do These or Fail:**
1. **Photo visibility** - If photos aren't prominent, memory aid doesn't work
2. **Location visibility** - Location text must be visible in list view
3. **Persistence** - Data MUST survive app restart or app is broken
4. **Performance** - App must be fast (< 3s startup, smooth scrolling)
5. **Intuitiveness** - Users must understand how to use it without tutorial

**Testing Rule:** Don't move to next phase until current phase passes real user testing.

---

## Release Criteria (Before Public Release)

- [ ] Phase 6 user testing shows NPS > 6/10
- [ ] Zero critical bugs (data loss, crashes)
- [ ] All core workflows tested on real iOS device
- [ ] All core workflows tested on real Android device
- [ ] 90% test pass rate (acceptable: minor UI polish issues)
- [ ] Performance targets met (startup < 3s, smooth scrolling)
- [ ] Privacy/legal requirements met (if applicable)
- [ ] Documented known limitations (explicitly list what's missing)
- [ ] Release notes written for users

---

## Timeline & Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| Phase 1 Complete | Day 2 | |
| Phase 2 Complete | Day 4 | |
| Phase 3 Complete | Day 5 | |
| Phase 4 Complete | Day 7 | |
| Phase 5 Complete | Day 8 | |
| Phase 6 - Beta Start | Day 9 | |
| Phase 6 - User Feedback | Day 16 | |
| MVP Release | Day 18-21 | |

---

## Phase Execution Rules

1. **Customer-First Testing:** User feedback > Technical metrics
2. **Real Scenarios:** Test with items users actually care about
3. **No Skipping:** Can't skip a phase or compress timeline
4. **Feedback Loop:** After each phase, collect feedback before next phase
5. **Bug Severity:** Fix critical (crash, data loss) before moving to next phase
6. **Polish Later:** Cosmetic issues can wait until post-MVP

---

## Sign-Off

**MVP Release Target:** [To be determined]
**Current Phase:** [Update as you progress]
**Last Updated:** 2026-01-14

| Role | Name | Approval |
|------|------|----------|
| Lead Developer | | |
| Product Manager | | |
| Customer (Beta Tester) | | |
