-- ==========================================
-- UNIVERSAL ADMIN & PROFILE FIX
-- ==========================================

-- 1. Ensure columns exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='role') THEN
        ALTER TABLE public.user_profiles ADD COLUMN role text DEFAULT 'user';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='subscription_tier') THEN
        ALTER TABLE public.user_profiles ADD COLUMN subscription_tier text DEFAULT 'free';
    END IF;
END $$;

-- 2. Security Definer helper to check admin status WITHOUT recursion
-- This is the "Nuclear Option" to fix RLS loops.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND (role ILIKE 'admin')
  );
END;
$$;

-- 3. CLEAN & ROBUST RLS POLICIES
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Wipe old policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins see all" ON public.user_profiles;

-- Policy: Everyone can see their OWN profile (No recursion)
CREATE POLICY "user_profiles_self_select" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy: Admins can see EVERYTHING (uses helper to bypass recursion)
CREATE POLICY "user_profiles_admin_select" 
ON public.user_profiles FOR SELECT 
USING (public.check_is_admin());

-- Policy: Update & Insert
CREATE POLICY "user_profiles_self_update" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "user_profiles_self_insert" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Privileged RPC Update
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS SETOF public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF public.check_is_admin() THEN
    RETURN QUERY SELECT * FROM public.user_profiles ORDER BY created_at DESC;
  ELSE
    RAISE EXCEPTION 'Access Denied: Admin privileges required.';
  END IF;
END;
$$;
