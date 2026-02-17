-- ========================================================
-- SUPABASE OBJECT INVENTORY: StashSnap Vault v2026a
-- ========================================================
-- Documenting tables, triggers, functions, storage & edge functions.

-- 1. DATABASE TABLES (public schema)
-- --------------------------------------------------------
-- [user_profiles]  : Core user metadata, roles (admin/user), and settings.
-- [items]          : User vault items including title, location, and embeddings.
-- [categories]     : Global (NULL user_id) and Private (specific user_id) categories.
-- [trash]          : Temporary storage for deleted items before permanent removal.
-- [search_history] : (Optional) Logs of user keyword and semantic searches.
-- [audit_logs]     : (Optional) System-level action tracking.

-- 2. DATABASE FUNCTIONS (SQL)
-- --------------------------------------------------------
-- [public.handle_new_user()]           : Auto-creates a profile on Auth Signup.
-- [public.handle_updated_at()]         : Updates the updated_at timestamp on record change.
-- [public.check_is_admin()]            : SECURITY DEFINER helper to bypass RLS recursion.
-- [public.get_system_stats_admin()]    : RPC for global dashboard metrics.
-- [public.sync_user_profiles_admin()]  : RPC to repair missing profiles for Auth users.
-- [public.get_all_users_admin()]       : RPC for secure user management retrieval.
-- [public.get_all_items_admin()]       : RPC for global AI re-indexing.

-- 3. DATABASE TRIGGERS
-- --------------------------------------------------------
-- [on_auth_user_created] (auth.users)  : Fires handle_new_user() after Auth insert.
-- [set_updated_at] (items)             : Fires handle_updated_at() before updates.

-- 4. STORAGE BUCKETS
-- --------------------------------------------------------
-- [avatars]      : Stores user profile pictures with per-user RLS folders.
-- [item-photos]  : Stores vault item images with authenticated private access.

-- 5. SUPABASE EDGE FUNCTIONS (Deno)
-- --------------------------------------------------------
-- [generate-embedding] : High-performance vectorization for AI semantic search.

-- 6. SQL SOURCE SCRIPTS (Project FileSystem)
-- --------------------------------------------------------
-- [01_create_user_profiles.sql]        : Initial schema for user profiles.
-- [02_setup_storage.sql]               : Bucket creation and base RLS for avatars.
-- [03_create_vault_items.sql]          : Schema for vault items and early RLS.
-- [04_setup_item_photos_RLS.sql]       : Advanced RLS for item-photos bucket.
-- [05_fix_foreign_keys.sql]            : Correcting auth.users reference integrity.
-- [06_seed_default_categories.sql]     : Initial global category population.
-- [07_fix_signup_and_categories.sql]   : Security definer fixes and cleanup.
-- [08_admin_privileged_functions.sql]  : Admin RPC development and privileged access.
-- [09_comprehensive_admin_fix.sql]     : Recursive RLS resolution and role case-insensitivity.

-- ========================================================
-- End of Inventory - Last Updated: 2026-02-13
-- ========================================================
