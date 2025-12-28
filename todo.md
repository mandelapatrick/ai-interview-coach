# AI Interview Coach - Task List

## Milestone 1: Foundation ✅ COMPLETE
- [x] Initialize Next.js 14 project with TypeScript
- [x] Install dependencies (tailwindcss, next-auth, @supabase/supabase-js)
- [x] Configure Tailwind CSS
- [x] Create folder structure (app, components, lib, data, types)
- [x] Set up environment variables (.env.local)
- [x] Build landing page with Hero, Features, How It Works
- [x] Set up Google OAuth with NextAuth
- [x] Create dashboard with company grid
- [x] Build question list page with filters

## Milestone 2: Voice Integration ✅ COMPLETE
- [x] Create API route for ephemeral token generation
- [x] Create system prompts data file
- [x] Build useVoiceSession WebSocket hook
- [x] Build VoiceSession component with mic controls
- [x] Update practice page with voice session
- [x] Create assessment page

## Milestone 3: Assessment & Persistence ✅ COMPLETE
- [x] Create AI assessment API using Grok text API
- [x] Set up Supabase client and types
- [x] Create API routes for saving sessions
- [x] Update assessment page with real AI scoring
- [x] Build user history page
- [x] Add navigation links to history

## All Milestones Complete! 🎉

### To enable database persistence:
1. Create a Supabase project at https://supabase.com
2. Run this SQL to create tables:

```sql
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  user_email text not null,
  company_slug text not null,
  question_id text not null,
  question_title text not null,
  question_type text not null,
  transcript text,
  duration_seconds integer,
  created_at timestamp with time zone default now()
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  overall_score numeric,
  structure_score integer,
  problem_solving_score integer,
  business_judgment_score integer,
  communication_score integer,
  quantitative_score integer,
  creativity_score integer,
  feedback text,
  strengths text[],
  improvements text[],
  created_at timestamp with time zone default now()
);
```

3. Add your Supabase credentials to `.env.local`
