-- ==========================================
-- 1. FIX SIGNUP FAILURE (500 ERROR)
-- ==========================================

-- Drop ALL possible triggers on auth.users to clear the air
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trigger_on_auth_user_created ON auth.users;

-- Ensure the user_profiles table is in a good state
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  profile_completed boolean DEFAULT false
);

-- Re-create the clean signup handler
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, avatar_url, created_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'first_name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 2. FINALIZE CATEGORY SYSTEM (GLOBAL + PRIVATE)
-- ==========================================

-- Ensure user_id can be NULL for global categories
ALTER TABLE categories ALTER COLUMN user_id DROP NOT NULL;

-- Remove any old "seeded" items that might have been copied to users (optional cleanup)
-- This ensures users only see Global + their own custom ones.
-- DELETE FROM categories WHERE user_id IS NOT NULL AND name IN ('Documents', 'Jewelry', 'Electronics', 'Furniture', 'Clothing', 'Books', 'Sports', 'Kitchen', 'Other');

-- Ensure Global Categories exist (user_id IS NULL)
INSERT INTO categories (user_id, name, color, icon)
SELECT NULL, name, color, icon
FROM (VALUES
    ('Documents', '#3B82F6', '📄'),
    ('Jewelry', '#EC4899', '💎'),
    ('Electronics', '#FF6B6B', '📱'),
    ('Furniture', '#4ECDC4', '🪑'),
    ('Clothing', '#95E1D3', '👕'),
    ('Books', '#A8D8EA', '📚'),
    ('Sports', '#AA96DA', '⚽'),
    ('Kitchen', '#FCBAD3', '🍳'),
    ('Art', '#F59E0B', '🎨'),
    ('Other', '#A0AEC0', '📦')
) AS d(name, color, icon)
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = d.name AND user_id IS NULL
);

-- Finalize RLS Policies for isolation
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own or system categories" ON categories;
CREATE POLICY "Users can view own or system categories" 
ON categories FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
CREATE POLICY "Users can insert their own categories" 
ON categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
CREATE POLICY "Users can update their own categories" 
ON categories FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;
CREATE POLICY "Users can delete their own categories" 
ON categories FOR DELETE 
USING (auth.uid() = user_id);
