# Product Management Interview Support - Implementation Checklist

## Phase 0: Documentation
- [x] Create `specs/` folder
- [x] Create `todos/` folder
- [x] Create `specs/pm-interview-support.md` with detailed specification
- [x] Create `todos/pm-interview-support.md` with implementation checklist

## Phase 1: Foundation

### types/index.ts
- [ ] Add `InterviewTrack` type
- [ ] Add `PMQuestionType` type (6 types)
- [ ] Add `PM_QUESTION_TYPE_LABELS` constant
- [ ] Add `PM_TYPE_COLORS` constant
- [ ] Add `PM_TYPE_COLORS_DARK` constant (for dark backgrounds)
- [ ] Extend `Company` interface with `track` field
- [ ] Extend `Question` interface with `track` field
- [ ] Create `AllQuestionTypes` union type

### data/companies.ts
- [ ] Add `pmCompanies` array with 30+ companies
- [ ] Add `getCompaniesByTrack()` function
- [ ] Update `getCompanyBySlug()` to search both arrays
- [ ] Update `getCategoriesForCompany()` to be track-aware

### data/pm-questions.ts (NEW FILE)
- [ ] Create file structure
- [ ] Add Meta questions (~90)
- [ ] Add Google questions (~80)
- [ ] Add Amazon questions (~15)
- [ ] Add Microsoft questions (~12)
- [ ] Add Apple, Uber, Lyft, Airbnb questions
- [ ] Add TikTok, Netflix, Dropbox, LinkedIn questions
- [ ] Add remaining company questions
- [ ] Export `pmQuestions` array
- [ ] Export helper functions

### data/questions.ts
- [ ] Add `track: "consulting"` to all existing questions
- [ ] Import `pmQuestions` from pm-questions.ts
- [ ] Create `allQuestions` merged array
- [ ] Update `getQuestionsByCompany()` to use merged array
- [ ] Update `getQuestionById()` to use merged array
- [ ] Add `getQuestionsByTrack()` function

## Phase 2: Navigation & Dashboards

### components/NavDropdown.tsx (NEW FILE)
- [ ] Create client component with "use client"
- [ ] Add dropdown state management
- [ ] Add click-outside handler
- [ ] Style dropdown menu
- [ ] Add Consulting option
- [ ] Add Product Management option

### components/Navbar.tsx
- [ ] Import NavDropdown component
- [ ] Replace "Companies" link with NavDropdown
- [ ] Update styling for dropdown integration

### app/dashboard/page.tsx
- [ ] Convert to track selector page
- [ ] Add Consulting card linking to /dashboard/consulting
- [ ] Add Product Management card linking to /dashboard/pm
- [ ] Style cards with icons and descriptions

### app/dashboard/consulting/page.tsx (NEW FILE)
- [ ] Create page component
- [ ] Import consulting companies
- [ ] Display company grid
- [ ] Update heading to "Consulting Interview Prep"

### app/dashboard/pm/page.tsx (NEW FILE)
- [ ] Create page component
- [ ] Import PM companies
- [ ] Display company grid
- [ ] Update heading to "Product Management Interview Prep"

## Phase 3: Prompts

### data/prompts_json/pmQuestionTypePrompts.json (NEW FILE)
- [ ] Create JSON structure
- [ ] Add product-sense prompt
- [ ] Add behavioral prompt
- [ ] Add technical prompt
- [ ] Add execution prompt
- [ ] Add strategy prompt
- [ ] Add estimation prompt

### data/prompts.ts
- [ ] Add `PM_SYSTEM_PROMPT` constant
- [ ] Add PM format instructions per question type
- [ ] Create `getPMSystemPrompt()` function
- [ ] Update `getSystemPrompt()` to route by track

## Phase 4: Company/Practice Pages

### app/company/[slug]/page.tsx
- [ ] Import PM type labels and colors
- [ ] Detect track from company
- [ ] Use track-aware type filters
- [ ] Use track-aware type colors
- [ ] Update back link to correct dashboard

### app/practice/[questionId]/page.tsx
- [ ] Import PM type labels
- [ ] Detect track from question
- [ ] Use track-aware type labels
- [ ] Update back link

## Phase 5: Assessment

### app/api/assessment/route.ts
- [ ] Add `PM_ASSESSMENT_PROMPT` constant
- [ ] Update POST handler to accept `track` parameter
- [ ] Route to correct assessment prompt based on track
- [ ] Return PM-specific score fields

### app/assessment/[questionId]/page.tsx
- [ ] Import PM score fields
- [ ] Detect track from question
- [ ] Render PM score categories for PM track
- [ ] Render consulting score categories for consulting track
- [ ] Update score weights display

## Phase 6: Testing

### Consulting Flow
- [ ] Verify dashboard/consulting loads correctly
- [ ] Verify company page shows consulting questions
- [ ] Verify practice session works
- [ ] Verify assessment shows consulting scores

### PM Flow
- [ ] Verify dashboard/pm loads correctly
- [ ] Verify company page shows PM questions
- [ ] Verify practice session works
- [ ] Verify assessment shows PM scores

### Cross-Track
- [ ] Verify track selector works
- [ ] Verify navbar dropdown works
- [ ] Verify back navigation respects track
- [ ] Verify no data leakage between tracks

---

## Notes

### Question Type Mapping Reference
| Spreadsheet | PM Type |
|-------------|---------|
| Product Sense, Product Design, Design, Product | `product-sense` |
| Leadership & Drive, Behavioral, Behavior | `behavioral` |
| Technical, System Design | `technical` |
| Metrics, Analytics, Execution, A/B Testing | `execution` |
| Strategy, Product Strategy | `strategy` |
| Estimation | `estimation` |

### PM Grading Weights
- Product Thinking: 25%
- Communication: 20%
- User Empathy: 15%
- Technical Depth: 15%
- Analytical Skills: 15%
- Creativity: 10%
