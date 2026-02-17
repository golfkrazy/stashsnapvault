-- ==========================================
-- AUTH LOCKOUT SYSTEM (Strict Identity-Based)
-- ==========================================

-- Table to track failed attempts globally
CREATE TABLE IF NOT EXISTS public.auth_lockouts (
    email TEXT PRIMARY KEY, -- Will store lower-case email
    attempts INT DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    lockout_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Only admins can see the full lockout table
ALTER TABLE public.auth_lockouts ENABLE ROW LEVEL SECURITY;

-- Explicitly allow the anon and authenticated roles to use these functions
-- (Required for pre-auth security checks)
GRANT EXECUTE ON FUNCTION public.get_auth_lockout_status(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_auth_failure(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_auth_success(TEXT) TO anon, authenticated;

-- 1. Function to GET status (Case-Insensitive)
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

    -- If lockout expired, reset it internally
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

-- 2. Function to RECORD failure (Case-Insensitive)
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
    -- Upsert the lockout record
    INSERT INTO public.auth_lockouts (email, attempts, last_attempt_at, updated_at)
    VALUES (v_clean_email, 1, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
    SET attempts = auth_lockouts.attempts + 1,
        last_attempt_at = NOW(),
        updated_at = NOW();

    -- Get updated stats
    SELECT attempts INTO v_attempts FROM public.auth_lockouts WHERE email = v_clean_email;

    -- Apply lockout if threshold reached (3 attempts)
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

-- 3. Function to RECORD success (Case-Insensitive)
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
