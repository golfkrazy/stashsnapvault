-- Fix foreign key references in legacy tables to point directly to auth.users
-- This resolves the "Key is not present in table 'users'" error

-- 1. Fix Categories table
ALTER TABLE categories 
  DROP CONSTRAINT IF EXISTS categories_user_id_fkey,
  ADD CONSTRAINT categories_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Fix Items table
ALTER TABLE items 
  DROP CONSTRAINT IF EXISTS items_user_id_fkey,
  ADD CONSTRAINT items_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Fix Trash table
ALTER TABLE trash 
  DROP CONSTRAINT IF EXISTS trash_user_id_fkey,
  ADD CONSTRAINT trash_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Fix Search History table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'search_history') THEN
    ALTER TABLE search_history 
      DROP CONSTRAINT IF EXISTS search_history_user_id_fkey,
      ADD CONSTRAINT search_history_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Fix Audit Logs table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    ALTER TABLE audit_logs 
      DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey,
      ADD CONSTRAINT audit_logs_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
