-- Generic event tracking table
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  anonymous_id TEXT,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_events_name_created ON analytics_events (event_name, created_at);
CREATE INDEX idx_events_email ON analytics_events (user_email);
CREATE INDEX idx_events_created ON analytics_events (created_at);

-- Add interview_mode to usage_tracking
ALTER TABLE usage_tracking ADD COLUMN IF NOT EXISTS interview_mode TEXT;

-- Add country to user_onboarding (via Vercel x-vercel-ip-country header)
ALTER TABLE user_onboarding ADD COLUMN IF NOT EXISTS country TEXT;
