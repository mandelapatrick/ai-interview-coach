# Product Management Interview Support - Specification

## Overview
Add Product Management (PM) interview track alongside existing Consulting interviews with a track selector landing page, header dropdown navigation, new company/question data (450+ PM questions, 30+ companies), PM-specific system prompts, and tailored grading criteria.

---

## User Flow

### Landing Page (`/dashboard`)
- Shows track selector with two cards
- **Consulting** card → links to `/dashboard/consulting`
- **Product Management** card → links to `/dashboard/pm`
- Each card shows icon, title, description, and company count

### Header Navigation
- "Interview Prep" dropdown with two options:
  - Consulting (MBB & Big 4 firms)
  - Product Management (FAANG & tech companies)
- Dropdown state managed by client component `NavDropdown.tsx`

### Company/Question Flow
Same UX as consulting:
1. Select company from dashboard
2. Browse questions with type/difficulty filters
3. Select question and choose audio/video mode
4. Complete interview
5. Receive assessment with PM-specific scoring

---

## Type System

### Interview Track
```typescript
export type InterviewTrack = "consulting" | "product-management";
```

### PM Question Types (6 types)
```typescript
export type PMQuestionType =
  | "product-sense"   // Product design questions
  | "behavioral"      // Leadership & Drive
  | "technical"       // System design
  | "execution"       // Metrics, Analytics
  | "strategy"        // Strategy, Market analysis
  | "estimation";     // Estimation questions
```

### Type Mapping from Spreadsheet
| Spreadsheet Label | PM Question Type |
|-------------------|------------------|
| Product Sense, Product Design, Design, Product | `product-sense` |
| Leadership & Drive, Behavioral, Behavior | `behavioral` |
| Technical, System Design | `technical` |
| Metrics, Analytics, Execution, A/B Testing | `execution` |
| Strategy, Product Strategy | `strategy` |
| Estimation | `estimation` |

### PM Type Labels
```typescript
export const PM_QUESTION_TYPE_LABELS: Record<PMQuestionType, string> = {
  "product-sense": "Product Sense",
  "behavioral": "Behavioral",
  "technical": "Technical",
  "execution": "Execution",
  "strategy": "Strategy",
  "estimation": "Estimation",
};
```

### PM Type Colors
```typescript
export const PM_TYPE_COLORS: Record<PMQuestionType, string> = {
  "product-sense": "text-violet-600 bg-violet-50",
  "behavioral": "text-amber-600 bg-amber-50",
  "technical": "text-blue-600 bg-blue-50",
  "execution": "text-teal-600 bg-teal-50",
  "strategy": "text-rose-600 bg-rose-50",
  "estimation": "text-indigo-600 bg-indigo-50",
};
```

---

## Data Models

### Company Interface Extension
```typescript
export interface Company {
  slug: string;
  name: string;
  logo: string;
  logoUrl?: string;
  description: string;
  questionCount: number;
  categories: string[];
  track: InterviewTrack;  // NEW
}
```

### Question Interface Extension
```typescript
export interface Question {
  id: string;
  companySlug: string;
  title: string;
  type: QuestionType | PMQuestionType;  // UPDATED
  difficulty: Difficulty;
  description: string;
  track: InterviewTrack;  // NEW
  industry?: string;
  interviewFormat?: InterviewFormat;
  additionalInfo?: string;
  additionalInfoImages?: string[];
  solution?: string;
}
```

---

## PM Companies (30+)

### High Volume
| Company | Slug | Questions |
|---------|------|-----------|
| Meta (Facebook) | `meta` | ~90 |
| Google | `google` | ~80 |
| Amazon | `amazon` | ~15 |
| Microsoft | `microsoft` | ~12 |

### Medium Volume
| Company | Slug |
|---------|------|
| Apple | `apple` |
| Uber | `uber` |
| Lyft | `lyft` |
| Airbnb | `airbnb` |
| TikTok | `tiktok` |
| Netflix | `netflix` |
| Dropbox | `dropbox` |
| LinkedIn | `linkedin` |

### Others
DoorDash, Salesforce, Coinbase, Pinterest, Twitter, Yelp, Adobe, Zynga, Intuit, Capital One, Qualtrics, Zoom, Etsy, eBay, Affirm, Brex, Roblox, etc.

---

## PM System Prompts

### Master PM Interviewer Prompt
```
You are an expert Product Manager Interviewer (Senior PM/Director level) at a top tech company (Google, Meta, Amazon, etc.). Your objective is to simulate a realistic, rigorous, and interactive PM interview.

Assessment Criteria:
1. Product Thinking - Ability to identify user needs and design solutions
2. Communication - Clarity, structure, and ability to influence
3. User Empathy - Deep understanding of user problems and motivations
4. Technical Depth - Understanding of technical constraints and possibilities
5. Analytical Skills - Data-driven thinking and metrics definition
6. Creativity - Novel solutions and innovative thinking

Personality:
- Collaborative but challenging
- Concise responses (2-4 sentences)
- Natural conversational pace

Interview Flow:
1. Introduction & Problem Statement
2. Clarification (expected in PM interviews)
3. Framework & Approach
4. Deep Dive & Probing
5. Synthesis & Recommendation
```

### Question-Type Specific Prompts

#### Product Sense
- Focus: User needs, design solutions, success metrics, trade-offs
- Probes: User segmentation, problem prioritization, solution ideation, MVP definition
- Style: Collaborative but challenging, focus on user-centric thinking

#### Behavioral
- Focus: STAR method, leadership, ownership, measurable impact
- Probes: Specific role, influence without authority, measurable impact, lessons learned
- Style: Warm but thorough, encourage storytelling with specifics

#### Technical
- Focus: System design, architecture, technical constraints
- Probes: System components, data models, API design, scalability, trade-offs
- Style: Technical but accessible, focus on practical constraints

#### Execution
- Focus: Metrics definition, A/B testing, data analysis, prioritization
- Probes: Metric decomposition, experiment design, prioritization frameworks
- Style: Analytical and precise, challenge assumptions

#### Strategy
- Focus: Market analysis, competitive positioning, business decisions, go-to-market
- Probes: Market sizing, competitive landscape, entry barriers, strategic options
- Style: Strategic and big-picture, push for business impact

#### Estimation
- Focus: Market sizing, capacity planning, quantitative reasoning
- Probes: Assumptions, decomposition approach, sanity checks, sensitivity analysis
- Style: Quantitative and structured, verify math and logic

---

## PM Grading Criteria

### Scoring Dimensions
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Product Thinking | 25% | Ability to identify user needs and design thoughtful solutions |
| Communication | 20% | Clarity, structure, and ability to influence |
| User Empathy | 15% | Deep understanding of user problems and motivations |
| Technical Depth | 15% | Understanding of technical constraints and possibilities |
| Analytical Skills | 15% | Data-driven thinking and metrics definition |
| Creativity | 10% | Novel solutions and innovative thinking |

### Scoring Scale
- 1: Poor - Major gaps, needs significant improvement
- 2: Below Average - Some understanding but notable weaknesses
- 3: Average - Meets basic expectations
- 4: Good - Strong performance with minor areas to improve
- 5: Excellent - Outstanding, ready for top tech companies

### Assessment Output Format
```json
{
  "overallScore": 3.8,
  "scores": {
    "productThinking": 4,
    "communication": 4,
    "userEmpathy": 3,
    "technicalDepth": 4,
    "analyticalSkills": 4,
    "creativity": 3
  },
  "feedback": "Strong product sense with clear user-centric thinking...",
  "strengths": ["Clear framework usage", "Strong metrics definition", "..."],
  "improvements": ["Deeper user research", "More creative solutions", "..."]
}
```

---

## File Structure

### New Files
```
specs/pm-interview-support.md          # This file
todos/pm-interview-support.md          # Implementation checklist
components/NavDropdown.tsx             # Dropdown client component
data/pm-questions.ts                   # PM questions database (450+)
data/prompts_json/pmQuestionTypePrompts.json  # PM question prompts
app/dashboard/pm/page.tsx              # PM companies dashboard
app/dashboard/consulting/page.tsx      # Consulting companies dashboard
```

### Modified Files
```
types/index.ts                         # Add PM types, labels, colors
data/companies.ts                      # Add PM companies, track helpers
data/questions.ts                      # Add track field, merge questions
data/prompts.ts                        # Add PM system prompt
components/Navbar.tsx                  # Use NavDropdown component
app/dashboard/page.tsx                 # Convert to track selector
app/company/[slug]/page.tsx            # Track-aware filters
app/practice/[questionId]/page.tsx     # Track-aware labels
app/api/assessment/route.ts            # PM assessment prompt
app/assessment/[questionId]/page.tsx   # PM scores display
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/dashboard` | Track selector (Consulting vs PM) |
| `/dashboard/consulting` | Consulting companies grid |
| `/dashboard/pm` | PM companies grid |
| `/company/[slug]` | Company questions (works for both tracks) |
| `/practice/[questionId]` | Interview session (works for both tracks) |
| `/assessment/[questionId]` | Assessment results (track-aware scoring) |
