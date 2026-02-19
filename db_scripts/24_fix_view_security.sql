-- ==========================================
-- 24_fix_view_security.sql (FULL RESET)
-- ==========================================

-- 0. SCHEMA REPAIR (Ensures columns used by app exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='items' AND column_name='deleted_at') THEN
        ALTER TABLE public.items ADD COLUMN deleted_at timestamptz DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='items' AND column_name='trash_expires_at') THEN
        ALTER TABLE public.items ADD COLUMN trash_expires_at timestamptz DEFAULT NULL;
    END IF;
END $$;

-- 1. CLEAN UP POLICIES ON ITEMS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own items" ON public.items;
DROP POLICY IF EXISTS "Admins can view all items" ON public.items;
DROP POLICY IF EXISTS "Users can view their own vault items." ON public.items;
DROP POLICY IF EXISTS "Regular users see own items" ON public.items;

CREATE POLICY "select_own_items" ON public.items
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "select_admin_all_items" ON public.items
FOR SELECT USING (public.check_is_admin());

-- 2. CLEAN UP POLICIES ON CATEGORIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own or system categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;

CREATE POLICY "select_own_or_system_categories" ON public.categories
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "select_admin_all_categories" ON public.categories
FOR SELECT USING (public.check_is_admin());

-- 3. RECREATE VIEWS WITH SECURITY_INVOKER
-- Logic matches InventoryPage filtering (active items only)

DROP VIEW IF EXISTS public.item_count_by_category;
CREATE OR REPLACE VIEW public.item_count_by_category 
WITH (security_invoker = true)
AS
SELECT
  c.id,
  c.user_id,
  c.name,
  COUNT(i.id) as item_count
FROM public.categories c
LEFT JOIN public.items i ON c.id = i.category_id AND i.deleted_at IS NULL
GROUP BY c.id, c.user_id, c.name;

DROP VIEW IF EXISTS public.user_statistics;
CREATE OR REPLACE VIEW public.user_statistics
WITH (security_invoker = true)
AS
SELECT
  p.id as user_id,
  p.email,
  COUNT(DISTINCT i.id) FILTER (WHERE i.deleted_at IS NULL) as total_items,
  COUNT(DISTINCT c.id) as total_categories,
  SUM(COALESCE(i.value, 0)) FILTER (WHERE i.deleted_at IS NULL) as total_value,
  MAX(i.created_at) FILTER (WHERE i.deleted_at IS NULL) as last_item_added
FROM public.user_profiles p
LEFT JOIN public.items i ON p.id = i.user_id
LEFT JOIN public.categories c ON p.id = c.user_id
GROUP BY p.id, p.email;

-- 4. VERIFY PERMISSIONS
GRANT SELECT ON public.item_count_by_category TO authenticated, anon;
GRANT SELECT ON public.user_statistics TO authenticated, anon;
