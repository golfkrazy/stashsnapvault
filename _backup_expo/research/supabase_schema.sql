-- SnapStash Supabase Schema
-- Generated: 2026-01-21
-- This schema supports authentication, item management, search/filtering, trash system, and settings

-- ============================================================================
-- PHASE 0: AUTHENTICATION TABLES
-- ============================================================================

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session management table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device_info JSONB,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table (authentication + app preferences)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  session_timeout_minutes INTEGER DEFAULT 30 CHECK (session_timeout_minutes > 0),
  auto_logout_enabled BOOLEAN DEFAULT true,
  save_to_library BOOLEAN DEFAULT false,
  cloud_sync_enabled BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset tokens (for password recovery)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PHASE 1 & 2: ITEM MANAGEMENT TABLES
-- ============================================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Items table (main inventory storage)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  value NUMERIC(12, 2),
  notes TEXT,
  photo_url TEXT,
  photo_path TEXT,
  is_draft BOOLEAN DEFAULT false,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item tags table (for tagging items)
CREATE TABLE IF NOT EXISTS item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, tag)
);

-- Tag index for quick lookups
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tag)
);

-- ============================================================================
-- PHASE 6: TRASH & RECOVERY SYSTEM
-- ============================================================================

-- Trash table for soft deletes
CREATE TABLE IF NOT EXISTS trash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  item_data JSONB NOT NULL,
  photo_path TEXT,
  deleted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  reason TEXT,
  is_permanent BOOLEAN DEFAULT false
);

-- ============================================================================
-- PHASE 7: SEARCH & ANALYTICS
-- ============================================================================

-- Search history for analytics
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  filters JSONB,
  results_count INTEGER,
  query_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs for security
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT CHECK (status IN ('success', 'failed', 'pending')),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Session indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);

-- Category indexes
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_name ON categories(name);

-- Item indexes
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_items_title_search ON items(title);
CREATE INDEX idx_items_location ON items(location);
CREATE INDEX idx_items_search_vector ON items USING GIN(search_vector);

-- Tag indexes
CREATE INDEX idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX idx_item_tags_tag ON item_tags(tag);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_tags_usage_count ON tags(usage_count DESC);

-- Trash indexes
CREATE INDEX idx_trash_user_id ON trash(user_id);
CREATE INDEX idx_trash_deleted_at ON trash(deleted_at DESC);
CREATE INDEX idx_trash_expires_at ON trash(expires_at);

-- Search and audit indexes
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trash ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ---- USERS TABLE RLS ----
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- SESSIONS TABLE RLS ----
CREATE POLICY "Users can view their own sessions"
  ON sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ---- USER SETTINGS TABLE RLS ----
CREATE POLICY "Users can view their own settings"
  ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ---- CATEGORIES TABLE RLS ----
CREATE POLICY "Users can view their own categories"
  ON categories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create categories"
  ON categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- ---- ITEMS TABLE RLS ----
CREATE POLICY "Users can view their own items"
  ON items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create items"
  ON items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON items
  FOR DELETE
  USING (auth.uid() = user_id);

-- ---- ITEM TAGS TABLE RLS ----
CREATE POLICY "Users can view tags for their items"
  ON item_tags
  FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM items WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tags for their items"
  ON item_tags
  FOR INSERT
  WITH CHECK (
    item_id IN (
      SELECT id FROM items WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags from their items"
  ON item_tags
  FOR DELETE
  USING (
    item_id IN (
      SELECT id FROM items WHERE user_id = auth.uid()
    )
  );

-- ---- TAGS TABLE RLS ----
CREATE POLICY "Users can view their own tags"
  ON tags
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tags"
  ON tags
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---- TRASH TABLE RLS ----
CREATE POLICY "Users can view their own trash"
  ON trash
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete items to trash"
  ON trash
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can restore from trash"
  ON trash
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from trash permanently"
  ON trash
  FOR DELETE
  USING (auth.uid() = user_id);

-- ---- SEARCH HISTORY TABLE RLS ----
CREATE POLICY "Users can view their own search history"
  ON search_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create search history"
  ON search_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their search history"
  ON search_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- ---- AUDIT LOGS TABLE RLS ----
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update user's last_login
CREATE OR REPLACE FUNCTION update_user_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET last_login = NOW() WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_login when user creates session
CREATE TRIGGER trigger_update_last_login
  AFTER INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_login();

-- Function to update item's updated_at timestamp
CREATE OR REPLACE FUNCTION update_item_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update items.updated_at
CREATE TRIGGER trigger_update_item_timestamp
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_item_timestamp();

-- Function to update search vector for full-text search
CREATE OR REPLACE FUNCTION update_item_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.location, '') || ' ' || COALESCE(NEW.notes, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search vector on items
CREATE TRIGGER trigger_update_item_search_vector
  BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_item_search_vector();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth signup
CREATE TRIGGER trigger_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to auto-delete expired trash items
CREATE OR REPLACE FUNCTION cleanup_expired_trash()
RETURNS void AS $$
BEGIN
  DELETE FROM trash WHERE expires_at < NOW() AND is_permanent = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA (Optional Default Categories)
-- ============================================================================

-- Insert default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, color, icon) VALUES
    (NEW.id, 'Electronics', '#FF6B6B', 'smartphone'),
    (NEW.id, 'Furniture', '#4ECDC4', 'chair'),
    (NEW.id, 'Clothing', '#95E1D3', 'shirt'),
    (NEW.id, 'Documents', '#FFE66D', 'file-text'),
    (NEW.id, 'Books', '#A8D8EA', 'book'),
    (NEW.id, 'Sports', '#AA96DA', 'activity'),
    (NEW.id, 'Kitchen', '#FCBAD3', 'utensils'),
    (NEW.id, 'Other', '#A0AEC0', 'box');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default categories
CREATE TRIGGER trigger_create_default_categories
  AFTER INSERT ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for item count by category
CREATE OR REPLACE VIEW item_count_by_category AS
SELECT
  c.id,
  c.user_id,
  c.name,
  COUNT(i.id) as item_count
FROM categories c
LEFT JOIN items i ON c.id = i.category_id AND i.user_id = c.user_id
GROUP BY c.id, c.user_id, c.name;

-- View for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT
  u.id as user_id,
  u.email,
  COUNT(DISTINCT i.id) as total_items,
  COUNT(DISTINCT c.id) as total_categories,
  SUM(COALESCE(i.value, 0)) as total_value,
  MAX(i.created_at) as last_item_added
FROM users u
LEFT JOIN items i ON u.id = i.user_id
LEFT JOIN categories c ON u.id = c.user_id
GROUP BY u.id, u.email;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
