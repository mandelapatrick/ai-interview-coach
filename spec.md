# AI Interview Coach - Specification

## Overview
A web app to help candidates prepare for management consulting interviews through AI-powered voice practice sessions.

---

## Requirements

### Core Features
1. **Landing Page** - Marketing page with value proposition and sign-up CTA
2. **Google Sign-in** - Authentication via Google OAuth
3. **Company Selection** - Grid of consulting firms (McKinsey, Bain, BCG, Deloitte, Accenture, etc.)
4. **Question Browser** - LeetCode-style list with filters by question type
5. **Voice Practice** - Real-time voice interview using xAI Grok Voice API
6. **AI Assessment** - Automated scoring and feedback after each session

### Question Types
- Profitability
- Market Entry
- Market Sizing
- M&A
- Operations
- Growth Strategy
- Pricing
- Competitive Response

### Assessment Criteria (1-5 scale)
- Structure
- Problem Solving
- Business Judgment
- Communication
- Quantitative Rigor
- Creativity

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js + Google |
| Database | Supabase |
| Voice API | xAI Grok Voice Agent |
| Assessment | xAI Grok Text API |
| Hosting | Vercel |

---

## Design Guidelines

- **Style**: Clean, professional, minimal
- **Colors**: Neutral palette with accent color for CTAs
- **Typography**: System fonts, clear hierarchy
- **Layout**: Mobile-first responsive design
- **Components**: Cards for companies, table for questions, modal for voice session
- **Reference**: LeetCode problem list UI for question browser

---

## Milestones

### Milestone 1: Foundation
- Project setup (Next.js, Tailwind, TypeScript)
- Landing page with hero and CTA
- Google authentication
- Company selection dashboard
- Question list with filters

### Milestone 2: Voice Integration
- xAI Voice API integration with ephemeral tokens
- Microphone permissions and audio handling
- Real-time transcript display
- Session controls (start/end)
- System prompts from `prompt.md` for each question type

**Voice API Details:**
- WebSocket endpoint: `wss://api.x.ai/v1/realtime`
- Ephemeral token endpoint: `POST https://api.x.ai/v1/realtime/client_secrets`
- Audio format: Base64-encoded PCM
- See `prompt.md` for interviewer system prompts per question type

### Milestone 3: Assessment & Persistence
- AI-powered assessment via Grok text API
- Score display with criteria breakdown
- Save sessions and assessments to Supabase
- User history view
