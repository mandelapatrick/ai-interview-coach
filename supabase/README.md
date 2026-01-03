# Supabase Setup

## Session Recordings Storage

To enable video recording storage, run the SQL migration in your Supabase project:

### Option 1: Using Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the contents of `migrations/001_create_session_recordings_bucket.sql`
5. Paste and run the SQL

### Option 2: Using Supabase CLI

```bash
supabase db push
```

## What the Migration Does

1. **Creates `session-recordings` bucket** with:
   - 500MB file size limit
   - Allowed MIME types: `video/webm`, `video/mp4`, `video/x-matroska`
   - Public access enabled for video playback

2. **Configures RLS Policies**:
   - Users can upload recordings to their own folder (`{user_email}/`)
   - Users can read and delete their own recordings
   - Public read access for video playback in the browser

3. **Updates `sessions` table**:
   - Adds `video_recording_url` column if it doesn't exist

## Storage Structure

Recordings are stored with the following path pattern:
```
session-recordings/
  └── user_example_com/           # User's email (@ replaced with _)
      └── 1234567890-temp-123.webm  # Timestamp-sessionId.webm
```

## Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
