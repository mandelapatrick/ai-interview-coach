-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
  billing_interval TEXT CHECK (billing_interval IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('practice', 'learn')),
  question_id TEXT,
  period_start DATE NOT NULL DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast monthly usage lookups
CREATE INDEX IF NOT EXISTS idx_usage_tracking_email_period
  ON usage_tracking (user_email, period_start);

-- Index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_email
  ON user_subscriptions (user_email);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer
  ON user_subscriptions (stripe_customer_id);
