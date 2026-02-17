# Stripe Payment Setup Guide - StashSnap Vault

This document provides a clean, comprehensive process for setting up and testing Stripe payments within the StashSnap Vault ecosystem.

## 🔑 Required API Keys & Secrets

### Supabase Vault (Edge Functions)
The following keys MUST be set in your Supabase project settings (Project Settings > Edge Functions):
- `STRIPE_SECRET_KEY`: Your Stripe secret key from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).
- `STRIPE_WEBHOOK_SECRET`: The signing secret from your webhook endpoint. 
  - *Internal testing:* Obtain via `stripe listen`.
  - *Production:* Obtain from the Webhook settings page.

### Frontend (.env.local)
- `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key.
- `VITE_STRIPE_PRICE_ID_PREMIUM`: The API ID of your "Premium Subscription" price in Stripe.

---

## 📦 Libraries & Dependencies

### Deprecated / Avoided
- ❌ `stripe-react-native`: Avoided as we pivoted to a Web-first architecture.
- ❌ `supabase-stripe-connect`: Legacy library, we use direct Edge Function implementation for maximum control.

### Current Implementation
- ✅ `@stripe/stripe-js`: Official Stripe library for the React frontend (loading Stripe.js).
- ✅ `Stripe` (Deno SDK via `esm.sh`): Modern, light SDK used in Supabase Edge Functions.
  - *Endpoint:* `https://esm.sh/stripe@11.1.0?target=deno`

---

## 🚀 Supabase Edge Functions

### 1. `create-checkout-session`
**Purpose:** Generates a secure Stripe Checkout URL for the user.
**Key Logic:**
- Verifies calling user session via Supabase Auth.
- Maps `userId` to `metadata` so the webhook can identify the user.
- Handles CORS for locally hosted development.

### 2. `stripe-webhook`
**Purpose:** Listens for Stripe events (e.g., `checkout.session.completed`).
**Key Logic:**
- Verifies Stripe signature to prevent spoofing.
- Updates `user_profiles` table upon successful payment.
- Logs detailed status for debugging.

---

## 🗄️ Database Schema (SQL)

The following schema in `user_profiles` tracks the subscription status:

```sql
-- Core fields for Stripe integration
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON user_profiles(subscription_tier);
```

### Automatic Trigger (Optional)
We rely on the `stripe-webhook` Edge Function to handle the upgrade logic rather than direct database triggers to ensure we can handle complex logic (like granting promotional items or sending emails) in a controlled environment.

---

## 🧪 Testing Process

1.  **Start Stripe Listen:**
    ```bash
    stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
    ```
2.  **Run Supabase Locally:**
    ```bash
    supabase start
    ```
3.  **Perform Checkout:**
    - Navigator to the Pricing page.
    - Click "Upgrade".
    - Use a test card (e.g., `4242 4242 4242 4242`).
4.  **Verify Upgrade:**
    - Observe the "Success Celebration" modal.
    - Check the AI Semantic toggle becomes vibrant purple.
