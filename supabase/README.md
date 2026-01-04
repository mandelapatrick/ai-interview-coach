# Supabase Setup for Session Recordings

## Quick Setup Guide

### Step 1: Add Database Column

Run this SQL in the **SQL Editor**:

```sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS video_recording_url TEXT;
```

### Step 2: Create Storage Bucket

1. Go to **Storage** in your Supabase Dashboard
2. Click **"New bucket"**
3. Enter name: `session-recordings`
4. ✅ Check **"Public bucket"** (required for video playback)
5. Click **"Create bucket"**

### Step 3: Create Storage Policies

Go to **Storage** → **session-recordings** → **Policies** tab

#### Policy 1: Allow Uploads

1. Click **"New Policy"** → **"For full customization"**
2. Policy name: `Allow authenticated uploads`
3. Allowed operation: **INSERT**
4. Target roles: **authenticated**
5. WITH CHECK expression:
   ```sql
   true
   ```
6. Click **"Review"** → **"Save policy"**

#### Policy 2: Allow Public Reads

1. Click **"New Policy"** → **"For full customization"**
2. Policy name: `Allow public read access`
3. Allowed operation: **SELECT**
4. Target roles: **anon** (public)
5. USING expression:
   ```sql
   true
   ```
6. Click **"Review"** → **"Save policy"**

#### Policy 3: Allow Deletes (Optional)

1. Click **"New Policy"** → **"For full customization"**
2. Policy name: `Allow authenticated deletes`
3. Allowed operation: **DELETE**
4. Target roles: **authenticated**
5. USING expression:
   ```sql
   true
   ```
6. Click **"Review"** → **"Save policy"**

---

## Verification

After setup, you should see:
- ✅ `session-recordings` bucket in Storage
- ✅ 2-3 policies listed under the bucket
- ✅ `video_recording_url` column in the `sessions` table

## Troubleshooting

**Error: "must be owner of table objects"**
- Storage policies cannot be created via SQL Editor
- Use the Dashboard UI as described above

**Videos not playing**
- Ensure the bucket is set to **Public**
- Check that the SELECT policy allows `anon` role
