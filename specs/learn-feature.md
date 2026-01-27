# Learn Feature Implementation Plan

## Summary
Add a "Learn" button to each question that opens an interactive video session with **two AI avatars** (interviewer + candidate) demonstrating how to answer the question.

## User Requirements
- **Interactive viewing**: User can pause, ask clarifying questions
- **Provider**: Anam for both avatars
- **Responses**: AI-generated dynamically (not scripted)
- **Two distinct avatars**: Visually separate interviewer and candidate

---

## Implementation Steps

### Step 1: Add "Learn" Button to Questions Table
**File**: `/app/company/[slug]/page.tsx`

Add a "Learn" button next to the existing "Practice" button (lines 320-326):
```tsx
<td className="px-6 py-4 text-right">
  <div className="flex gap-2 justify-end">
    <Link href={`/learn/${question.id}`} className="...">Learn</Link>
    <Link href={`/practice/${question.id}`} className="...">Practice</Link>
  </div>
</td>
```

### Step 2: Create Learn Page
**New file**: `/app/learn/[questionId]/page.tsx`

- Fetch question by ID
- Display question info header
- Render `<LearnFlow />` component

### Step 3: Create LearnFlow Component
**New file**: `/components/LearnFlow.tsx`

State machine:
```
intro -> watching -> paused -> watching
              ↓
         asking-question -> watching
              ↓
           ended -> summary
```

Features:
- Intro screen explaining Learn mode
- Transitions to `LearnSession` component
- Handles end of interview flow

### Step 4: Create LearnSession Component
**New file**: `/components/LearnSession.tsx`

Main dual-avatar video session component.

**Layout**:
```
+-------------------------------------------+
|  [Interviewer]        [Candidate]         |
|  Avatar Video         Avatar Video        |
+-------------------------------------------+
|        [Live Transcript Panel]            |
+-------------------------------------------+
|  [Pause] [Ask Question] [End Interview]   |
+-------------------------------------------+
```

**Key features**:
- Two video elements (side-by-side)
- Real-time transcript display
- Speaker indicator (highlight active avatar)
- Control bar: pause, ask question, end

### Step 5: Create useDualAnamAvatars Hook
**New file**: `/hooks/useDualAnamAvatars.ts`

Manages two simultaneous Anam avatar sessions with turn-taking orchestration.

**Interface**:
```typescript
interface UseDualAnamAvatarsReturn {
  isInitialized: boolean;
  currentSpeaker: 'interviewer' | 'candidate' | null;
  isPaused: boolean;
  initializeAvatars: (interviewerVideo, candidateVideo) => Promise<boolean>;
  pause: () => void;
  resume: () => void;
  askCandidateQuestion: (question: string) => Promise<void>;
  stopAvatars: () => Promise<void>;
}
```

**Turn-taking orchestration**:
1. Initialize both Anam clients with different system prompts
2. Start interviewer (mute candidate)
3. Listen for `MESSAGE_HISTORY_UPDATED` event (turn ended)
4. Capture interviewer's last message from transcript
5. Send message to candidate via text input (simulating voice)
6. Switch: mute interviewer, unmute candidate
7. Repeat cycle until interview complete

**Audio management**:
- Only one avatar audible at a time (mute video elements)
- Visual indicators show who is speaking

### Step 6: Create Dual Token API Endpoint
**New file**: `/app/api/anam/learn-tokens/route.ts`

Generates two separate session tokens with different personas:

```typescript
POST /api/anam/learn-tokens
Body: { interviewerPrompt, candidatePrompt }
Response: { interviewerToken, candidateToken }
```

Uses different avatar IDs for visual distinction:
- Interviewer: Professional avatar (existing `ae2ea8c1-db28-47e3-b6ea-493e4ed3c554`)
- Candidate: Different avatar (select from Anam gallery)

### Step 7: Create Learn Mode Prompts

**Interviewer prompt**:
- **Reuse existing practice prompts** from `/data/prompts/`
- Use `getSystemPrompt(question)` which routes to:
  - PM questions: `getPMPrompt()` from `/data/prompts/pm/index.ts`
  - Consulting: `getConsultingPrompt()` from `/data/prompts/consulting/index.ts`
- No new prompt file needed for interviewer

**Candidate prompt** (new file: `/data/prompts/learn/candidate.ts`):
- **Leverage rubrics** from `/data/rubrics/` to craft perfect answers
- Use `getRubricConfig(question.type)` to get:
  - `rubric.dimensions[]` - scoring criteria with score 5 indicators
  - `calibratedExamples[]` - example transcripts showing high-quality answers
- Prompt structure:
  ```typescript
  export function getCandidatePrompt(question: Question): string {
    const rubricConfig = getRubricConfig(question.type);
    const rubric = rubricConfig?.rubric;

    // Extract score 5 indicators from each dimension
    const excellenceIndicators = rubric.dimensions.map(d => ({
      dimension: d.name,
      indicators: d.scoringCriteria.find(c => c.score === 5)?.indicators
    }));

    // Build prompt with rubric guidance
    return `You are demonstrating an excellent ${question.type} interview response.

    QUESTION: ${question.title}
    ${question.description}

    EXCELLENCE CRITERIA (score at these levels):
    ${excellenceIndicators.map(d => `
    ${d.dimension}:
    ${d.indicators.map(i => `- ${i}`).join('\n')}
    `).join('\n')}

    EXAMPLE HIGH-QUALITY RESPONSE:
    ${calibratedExamples[0]?.transcriptSummary}

    Demonstrate these qualities naturally in your response...`;
  }
  ```

### Step 8: Create Clarifying Question Modal
**New file**: `/components/ClarifyingQuestionModal.tsx`

When user clicks "Ask Question":
1. Pause the interview
2. Show modal with text input
3. User types question (e.g., "Why did you use that framework?")
4. Send to candidate avatar
5. Candidate responds directly to user
6. Resume normal interview flow

### Step 9: Add Recording Support
Extend recording in `LearnSession.tsx`:

- Canvas compositing: side-by-side avatar layout
- Audio mixing: combine both avatar audio streams
- Timer overlay
- Use existing `useVideoRecorder` hook

---

## Files to Create

| File | Purpose |
|------|---------|
| `/app/learn/[questionId]/page.tsx` | Learn page entry point |
| `/components/LearnFlow.tsx` | Flow state machine |
| `/components/LearnSession.tsx` | Dual avatar session UI |
| `/hooks/useDualAnamAvatars.ts` | Dual avatar orchestration |
| `/app/api/anam/learn-tokens/route.ts` | Dual token generation |
| `/data/prompts/learn/candidate.ts` | Candidate system prompt (uses rubrics for perfect answers) |
| `/components/ClarifyingQuestionModal.tsx` | User question modal |

**Note**: Interviewer uses existing prompts via `getSystemPrompt(question)` - no new file needed.

## Files to Modify

| File | Changes |
|------|---------|
| `/app/company/[slug]/page.tsx` | Add "Learn" button (lines 320-326) |

---

## Technical Considerations

### Challenge: Two Simultaneous Anam Sessions
- Each Anam client requires separate WebRTC connection
- Need to verify Anam API allows multiple concurrent sessions per account
- Fallback: Sequential session switching if concurrent not supported

### Challenge: Turn-Taking Without Native Support
Since Anam handles conversation internally, orchestration approach:
1. Use `MESSAGE_HISTORY_UPDATED` event to detect turn completion
2. Capture transcript text from `MESSAGE_STREAM_EVENT_RECEIVED`
3. Manually inject previous speaker's text as input to next speaker
4. May need to use browser's SpeechSynthesis API to convert text→audio input

### Challenge: Preventing Audio Overlap
- Mute non-speaking avatar's video element
- Track `isTalking` state per avatar
- Visual indicator (border glow) for active speaker

---

## Implementation Order

1. **UI Foundation**: Learn button, Learn page, LearnFlow component
2. **Dual Token API**: `/api/anam/learn-tokens` endpoint
3. **Prompts**: Interviewer and candidate system prompts
4. **Single Avatar Test**: Verify one Anam session works in new UI
5. **Dual Avatar Hook**: `useDualAnamAvatars` with basic initialization
6. **Turn Orchestration**: Implement turn-taking logic
7. **User Controls**: Pause, resume, ask question functionality
8. **Recording**: Dual-stream canvas compositing
9. **Polish**: Loading states, error handling, transitions
