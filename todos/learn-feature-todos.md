# Learn Feature Implementation Todos

## Phase 1: UI Foundation

- [x] Add "Learn" button next to "Practice" in `/app/company/[slug]/page.tsx` (lines 320-326)
- [x] Create `/app/learn/[questionId]/page.tsx` - Learn page entry point
- [x] Create `/components/LearnFlow.tsx` - State machine (intro → watching → paused → asking-question → ended → summary)

## Phase 2: API & Prompts

- [x] Create `/app/api/anam/learn-tokens/route.ts` - Dual token generation endpoint
  - Returns `{ interviewerToken, candidateToken }`
  - Uses different avatar IDs for interviewer vs candidate
- [x] Create `/data/prompts/learn/candidate.ts` - Candidate prompt using rubrics
  - Import `getRubricConfig(question.type)` from `/data/rubrics/`
  - Extract score 5 indicators from `rubric.dimensions`
  - Include calibrated example transcripts

## Phase 3: Single Avatar Test

- [x] Create basic `/components/LearnSession.tsx` with dual avatar layout
- [x] Verify Anam session works in new Learn UI layout
- [x] Side-by-side layout structure implemented

## Phase 4: Dual Avatar Implementation

- [x] Create `/hooks/useDualAnamAvatars.ts`
  - Initialize two Anam clients
  - Track `currentSpeaker: 'interviewer' | 'candidate'`
  - Implement `initializeAvatars(interviewerVideo, candidateVideo)`
  - Implement `stopAvatars()`
- [x] Implement turn-taking orchestration in hook
  - Listen for `MESSAGE_HISTORY_UPDATED` event (turn ended)
  - Capture transcript from `MESSAGE_STREAM_EVENT_RECEIVED`
  - Send previous speaker's text to next speaker
  - Mute non-speaking avatar's video element
- [x] Add visual speaker indicators (border glow on active avatar)

## Phase 5: User Controls

- [x] Implement pause/resume functionality
  - Pause both avatars
  - Store conversation state
  - Resume from where left off
- [x] Create `/components/ClarifyingQuestionModal.tsx`
  - Text input for user question
  - Submit sends to candidate avatar
  - Candidate responds, then resumes normal flow

## Phase 6: Recording & Polish

- [ ] Add dual-stream canvas compositing for recording
- [x] Add loading states and error handling
- [x] Add smooth transitions between states
- [ ] Test end-to-end flow with real Anam avatars

---

## Files Created

| File | Status |
|------|--------|
| `/app/learn/[questionId]/page.tsx` | [x] |
| `/components/LearnFlow.tsx` | [x] |
| `/components/LearnSession.tsx` | [x] |
| `/hooks/useDualAnamAvatars.ts` | [x] |
| `/app/api/anam/learn-tokens/route.ts` | [x] |
| `/data/prompts/learn/candidate.ts` | [x] |
| `/components/ClarifyingQuestionModal.tsx` | [x] |

## Files Modified

| File | Status |
|------|--------|
| `/app/company/[slug]/page.tsx` | [x] |

---

## Technical Risks to Address

- [ ] Verify Anam supports two concurrent sessions per account
- [ ] Test turn-taking logic with real avatars
- [x] Handle audio overlap prevention (implemented via muting)
- [ ] Test clarifying question injection to candidate

---

## Build Status

- [x] Build compiles successfully (verified 2026-01-25)
