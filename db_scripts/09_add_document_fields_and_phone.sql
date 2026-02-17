-- ==========================================
-- 09_add_document_fields_and_phone.sql
-- ==========================================

-- 1. Add document-specific fields to 'items' table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS effective_date DATE,
ADD COLUMN IF NOT EXISTS expiration_date DATE,
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT false;

-- 2. Add phone_number to 'user_profiles' table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT;
