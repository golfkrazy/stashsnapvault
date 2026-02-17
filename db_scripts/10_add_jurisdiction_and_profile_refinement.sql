-- ==========================================
-- 10_add_jurisdiction_and_profile_refinement.sql
-- ==========================================

-- 1. Add jurisdiction fields to 'items' table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS jurisdiction_city TEXT,
ADD COLUMN IF NOT EXISTS jurisdiction_state TEXT,
ADD COLUMN IF NOT EXISTS jurisdiction_country TEXT;

-- 2. Add separate city/state/country to 'user_profiles' table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Optional: Migrate existing location data (simple guess)
-- UPDATE public.user_profiles SET city = split_part(location, ',', 1), country = split_part(location, ',', 2) WHERE location IS NOT NULL AND city IS NULL;
