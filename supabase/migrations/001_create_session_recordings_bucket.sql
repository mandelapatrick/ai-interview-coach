-- Session Recordings Storage Setup
--
-- IMPORTANT: Storage bucket and policies must be created via Supabase Dashboard UI
-- This file only handles the database column addition.
--
-- Follow these steps in order:

-- ============================================
-- STEP 1: Run this SQL to add the column
-- ============================================

-- Add video_recording_url column to sessions table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'video_recording_url'
  ) THEN
    ALTER TABLE sessions ADD COLUMN video_recording_url TEXT;
  END IF;
END $$;

-- ============================================
-- STEP 2: Create storage bucket via Dashboard
-- ============================================
--
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: session-recordings
-- 4. Check "Public bucket" (required for video playback)
-- 5. Click "Create bucket"
--
-- ============================================
-- STEP 3: Create storage policies via Dashboard
-- ============================================
--
-- Go to Storage > session-recordings > Policies tab
-- Click "New Policy" and create these policies:
--
-- POLICY 1: Allow uploads (INSERT)
-- ---------------------------------
-- Policy name: Allow authenticated uploads
-- Allowed operation: INSERT
-- Target roles: authenticated
-- WITH CHECK expression:
--   bucket_id = 'session-recordings'
--
-- POLICY 2: Allow public reads (SELECT)
-- -------------------------------------
-- Policy name: Allow public read access
-- Allowed operation: SELECT
-- Target roles: public (or anon)
-- USING expression:
--   bucket_id = 'session-recordings'
--
-- POLICY 3: Allow delete own files (DELETE)
-- -----------------------------------------
-- Policy name: Allow authenticated deletes
-- Allowed operation: DELETE
-- Target roles: authenticated
-- USING expression:
--   bucket_id = 'session-recordings'
