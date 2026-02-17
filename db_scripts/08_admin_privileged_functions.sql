-- ==========================================
-- ADMIN PRIVILEGED FUNCTIONS (BYPASS RLS)
-- ==========================================

-- 1. Get All Users (for User Management)
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS SETOF public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND LOWER(role) = 'admin'
  ) THEN
    RETURN QUERY SELECT * FROM public.user_profiles ORDER BY created_at DESC;
  ELSE
    RAISE EXCEPTION 'Access Denied: Admin privileges required.';
  END IF;
END;
$$;

-- 2. Get System Stats (for Dashboard)
CREATE OR REPLACE FUNCTION public.get_system_stats_admin()
RETURNS TABLE(total_users bigint, total_items bigint, total_categories bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND LOWER(role) = 'admin'
  ) THEN
    RETURN QUERY SELECT 
      (SELECT count(*) FROM auth.users),
      (SELECT count(*) FROM public.items),
      (SELECT count(*) FROM public.categories);
  ELSE
    RAISE EXCEPTION 'Access Denied: Admin privileges required.';
  END IF;
END;
$$;

-- 3. Sync User Profiles (ensure every auth.user has a profile)
CREATE OR REPLACE FUNCTION public.sync_user_profiles_admin()
RETURNS TABLE(created_count int)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inserted_count int;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND LOWER(role) = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Admin privileges required.';
  END IF;

  WITH inserted AS (
    INSERT INTO public.user_profiles (id, email, first_name, created_at)
    SELECT u.id, u.email, u.raw_user_meta_data->>'full_name', u.created_at
    FROM auth.users u
    LEFT JOIN public.user_profiles p ON u.id = p.id
    WHERE p.id IS NULL
    RETURNING id
  )
  SELECT count(*) INTO inserted_count FROM inserted;
  
  RETURN QUERY SELECT inserted_count;
END;
$$;

-- 4. FIX RLS POLICIES (Ensure users can see themselves, Admins see all)
-- We must allow users to see their own row FIRST to avoid recursion errors.

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
FOR SELECT USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('admin', 'ADMIN')
);
