-- 1. Ensure user_id can be NULL (for global system categories)
ALTER TABLE categories ALTER COLUMN user_id DROP NOT NULL;

-- 2. Clear out any old "seeded" defaults to avoid confusion
-- (Optional: run this if you want a clean start, but be careful if you have items using them)
-- DELETE FROM categories WHERE name IN ('Documents', 'Jewelry', 'Electronics', 'Furniture', 'Clothing', 'Books', 'Sports', 'Kitchen', 'Other');

-- 3. Insert Global System Categories (user_id is NULL)
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

-- 4. Update RLS policies for Categories
-- Drop old policy if it exists
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can view own or system categories" ON categories;

-- Create new policy: View your own OR system categories (user_id IS NULL)
CREATE POLICY "Users can view own or system categories" 
ON categories FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can only insert their own categories
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
CREATE POLICY "Users can insert their own categories" 
ON categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update/delete their own categories
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
CREATE POLICY "Users can update their own categories" 
ON categories FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;
CREATE POLICY "Users can delete their own categories" 
ON categories FOR DELETE 
USING (auth.uid() = user_id);
