-- ============================================================================
-- StashSnap Vector Embeddings Migration
-- Description: Adds dual-aspect vector embedding support (Item & Location)
-- Model: Nomic Embed v1.5 (512 dimensions)
-- ============================================================================

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Add embedding columns to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS embedding vector(512),
ADD COLUMN IF NOT EXISTS location_embedding vector(512);

-- 2. Create indices for fast similarity search
CREATE INDEX IF NOT EXISTS items_embedding_idx 
ON items USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS items_location_embedding_idx 
ON items USING ivfflat (location_embedding vector_cosine_ops) WITH (lists = 100);

-- 3. Create function for multi-aspect semantic similarity search
-- search_type: 'item' (default), 'location', or 'category'

-- Drop existing functions to avoid "function name is not unique" ambiguity
DROP FUNCTION IF EXISTS match_items(vector(512), float, int, uuid);
DROP FUNCTION IF EXISTS match_items(vector(512), float, int, uuid, text);

CREATE OR REPLACE FUNCTION match_items(
  query_embedding vector(512),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  user_id_filter uuid DEFAULT NULL,
  search_type text DEFAULT 'item'
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category_name text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    items.id,
    items.title,
    items.description,
    categories.name AS category_name,
    CASE 
      WHEN search_type = 'location' THEN 1 - (items.location_embedding <=> query_embedding)
      ELSE 1 - (items.embedding <=> query_embedding)
    END AS similarity
  FROM items
  LEFT JOIN categories ON items.category_id = categories.id
  WHERE 
    (
      (search_type = 'location' AND items.location_embedding IS NOT NULL) OR
      (search_type != 'location' AND items.embedding IS NOT NULL)
    )
    AND (user_id_filter IS NULL OR items.user_id = user_id_filter)
    AND (
      CASE 
        WHEN search_type = 'location' THEN 1 - (items.location_embedding <=> query_embedding)
        ELSE 1 - (items.embedding <=> query_embedding)
      END > match_threshold
    )
  ORDER BY 
    CASE 
      WHEN search_type = 'location' THEN items.location_embedding <=> query_embedding
      ELSE items.embedding <=> query_embedding
    END
  LIMIT match_count;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION match_items TO authenticated;
GRANT EXECUTE ON FUNCTION match_items TO anon;
