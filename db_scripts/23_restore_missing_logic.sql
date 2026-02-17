-- ========================================================
-- 23_restore_missing_logic.sql
-- Description: Consolidated RPCs for AI Search and Security
-- Applied manually to Supabase SQL Editor on Feb 15, 2026
-- ========================================================

-- 1. AI SEARCH LOGIC (match_items)
-----------------------------------------------------------
-- Requirement: pgvector extension must be enabled
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

GRANT EXECUTE ON FUNCTION match_items TO authenticated;
GRANT EXECUTE ON FUNCTION match_items TO anon;


-- 2. SECURITY LOCKOUT LOGIC
-----------------------------------------------------------
-- Function to GET status
CREATE OR REPLACE FUNCTION public.get_auth_lockout_status(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempts INT;
    v_lockout_until TIMESTAMPTZ;
    v_clean_email TEXT := LOWER(TRIM(p_email));
BEGIN
    SELECT attempts, lockout_until 
    INTO v_attempts, v_lockout_until 
    FROM public.auth_lockouts 
    WHERE email = v_clean_email;

    IF v_lockout_until IS NOT NULL AND v_lockout_until < NOW() THEN
        UPDATE public.auth_lockouts 
        SET attempts = 0, lockout_until = NULL, updated_at = NOW()
        WHERE email = v_clean_email;
        v_attempts := 0;
        v_lockout_until := NULL;
    END IF;

    RETURN jsonb_build_object(
        'attempts', COALESCE(v_attempts, 0),
        'lockout_until', v_lockout_until
    );
END;
$$;

-- Function to RECORD failure
CREATE OR REPLACE FUNCTION public.record_auth_failure(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempts INT;
    v_lockout_until TIMESTAMPTZ;
    v_clean_email TEXT := LOWER(TRIM(p_email));
BEGIN
    INSERT INTO public.auth_lockouts (email, attempts, last_attempt_at, updated_at)
    VALUES (v_clean_email, 1, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
    SET attempts = auth_lockouts.attempts + 1,
        last_attempt_at = NOW(),
        updated_at = NOW();

    SELECT attempts INTO v_attempts FROM public.auth_lockouts WHERE email = v_clean_email;

    IF v_attempts >= 3 THEN
        v_lockout_until := NOW() + INTERVAL '15 minutes';
        UPDATE public.auth_lockouts 
        SET lockout_until = v_lockout_until,
            updated_at = NOW()
        WHERE email = v_clean_email;
    END IF;

    RETURN jsonb_build_object(
        'attempts', v_attempts,
        'lockout_until', v_lockout_until
    );
END;
$$;

-- Function to RECORD success
CREATE OR REPLACE FUNCTION public.record_auth_success(p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean_email TEXT := LOWER(TRIM(p_email));
BEGIN
    UPDATE public.auth_lockouts 
    SET attempts = 0, 
        lockout_until = NULL,
        updated_at = NOW()
    WHERE email = v_clean_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_lockout_status(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_auth_failure(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_auth_success(TEXT) TO anon, authenticated;
