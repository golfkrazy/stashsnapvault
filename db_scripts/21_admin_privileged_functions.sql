-- Admin Privileged Function for Global Indexing
CREATE OR REPLACE FUNCTION get_all_items_admin()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  location text,
  category_name text,
  user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS
AS $$
DECLARE
    caller_role text;
BEGIN
    -- Check if the calling user is an admin
    SELECT role INTO caller_role FROM user_profiles WHERE id = auth.uid();
    
    IF caller_role != 'admin' OR caller_role IS NULL THEN
        RAISE EXCEPTION 'Access Denied: Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        items.id, 
        items.title, 
        items.description, 
        items.location, 
        categories.name AS category_name,
        items.user_id
    FROM items
    LEFT JOIN categories ON items.category_id = categories.id;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION get_all_items_admin TO authenticated;

-- Function to fetch system-wide stats (Bypassing RLS)
CREATE OR REPLACE FUNCTION get_system_stats_admin()
RETURNS TABLE (
  total_users bigint,
  total_items bigint,
  total_categories bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    caller_role text;
BEGIN
    SELECT role INTO caller_role FROM user_profiles WHERE id = auth.uid();
    IF caller_role != 'admin' OR caller_role IS NULL THEN
        RAISE EXCEPTION 'Access Denied: Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        (SELECT count(*) FROM auth.users), -- Count from Master Auth table
        (SELECT count(*) FROM items),
        (SELECT count(*) FROM categories);
END;
$$;

GRANT EXECUTE ON FUNCTION get_system_stats_admin TO authenticated;

-- Function to synchronize user profiles (Create missing entries)
CREATE OR REPLACE FUNCTION sync_user_profiles_admin()
RETURNS TABLE (
  created_count int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    caller_role text;
    inserted_count int := 0;
BEGIN
    SELECT role INTO caller_role FROM user_profiles WHERE id = auth.uid();
    IF caller_role != 'admin' OR caller_role IS NULL THEN
        RAISE EXCEPTION 'Access Denied: Admin privileges required.';
    END IF;

    -- Insert missing profiles
    INSERT INTO user_profiles (id, email, created_at)
    SELECT id, email, created_at
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM user_profiles)
    ON CONFLICT (id) DO NOTHING;
    
    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    
    RETURN QUERY SELECT inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION sync_user_profiles_admin TO authenticated;

-- Policy to allow admins to UPDATE any item (for global re-indexing)
-- This is critical for the "Global Re-index" to actually save embeddings for other users
DROP POLICY IF EXISTS "Admins can update all items" ON public.items;
CREATE POLICY "Admins can update all items" 
ON public.items 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  )
);
