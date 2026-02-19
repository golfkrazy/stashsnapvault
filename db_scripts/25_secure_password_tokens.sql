-- ==========================================
-- 25_secure_password_tokens.sql
-- Fixes Supabase Lint: RLS Disabled in Public Entity
-- ==========================================

-- 1. ENABLE RLS
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 2. CLEAN UP OLD POLICIES
DROP POLICY IF EXISTS "owner_select" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "owner_delete" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "owner_insert" ON public.password_reset_tokens;

-- 3. APPLY OWNER-BASED POLICIES
-- Only the token owner can SELECT their tokens
CREATE POLICY "owner_select" ON public.password_reset_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only the token owner can DELETE their tokens
CREATE POLICY "owner_delete" ON public.password_reset_tokens
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only INSERT tokens for themselves
CREATE POLICY "owner_insert" ON public.password_reset_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. ADD PERFORMANCE INDEX
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens (user_id);

-- 5. MINIMIZE PUBLIC GRANTS
-- Ensure authenticated users have necessary permissions but restricted by RLS
GRANT SELECT, INSERT, DELETE ON public.password_reset_tokens TO authenticated;
-- Revoke all from anon to be safe
REVOKE ALL ON public.password_reset_tokens FROM anon;
