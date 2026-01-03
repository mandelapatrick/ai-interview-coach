-- Create the session-recordings storage bucket
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create the storage bucket for session recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'session-recordings',
  'session-recordings',
  true,  -- Public bucket so videos can be played directly
  524288000,  -- 500MB file size limit
  ARRAY['video/webm', 'video/mp4', 'video/x-matroska']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow authenticated users to upload their own recordings
-- Files are stored in user-specific folders: {user_email}/{timestamp}-{session_id}.webm
CREATE POLICY "Users can upload their own recordings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'session-recordings'
  AND (storage.foldername(name))[1] = replace(auth.email(), '@', '_')
);

-- 4. Policy: Allow authenticated users to read their own recordings
CREATE POLICY "Users can read their own recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'session-recordings'
  AND (storage.foldername(name))[1] = replace(auth.email(), '@', '_')
);

-- 5. Policy: Allow public read access to all recordings (for video playback)
-- This is needed because the video player loads the URL directly
CREATE POLICY "Public read access for recordings"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'session-recordings');

-- 6. Policy: Allow authenticated users to delete their own recordings
CREATE POLICY "Users can delete their own recordings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'session-recordings'
  AND (storage.foldername(name))[1] = replace(auth.email(), '@', '_')
);

-- 7. Add video_recording_url column to sessions table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'video_recording_url'
  ) THEN
    ALTER TABLE sessions ADD COLUMN video_recording_url TEXT;
  END IF;
END $$;
