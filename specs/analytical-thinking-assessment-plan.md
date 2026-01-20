# Analytical Thinking Assessment Implementation Plan

## Summary
Add calibrated Analytical Thinking (AT) interview assessments following the existing Product Sense rubric pattern. This implements a 4-dimension rubric with few-shot prompting for accurate scoring.

## Proposed Rubric Dimensions

Based on the AT interview resources (Ben Erez, Rachel's Guide), the assessment will use 4 dimensions:

| Dimension | Weight | Key Evaluation Criteria |
|-----------|--------|------------------------|
| **Product Rationale** | 15% | Product description, maturity, business model, company/product mission alignment |
| **Measuring Impact** | 35% | Ecosystem players, health metrics with timeframes, NSM selection, guardrails |
| **Setting Goals** | 25% | Altitude shift to team level, ecosystem player focus, goal prioritization |
| **Evaluating Tradeoffs** | 25% | Tradeoff identification, common goal, pros/cons, decisive recommendation |

## Key Changes

### 1. Create Rubric Data Module
**New file: `/data/rubrics/analytical-thinking.ts`**

- 4-dimension rubric with detailed scoring criteria (1-5 scale)
- 2 condensed calibrated examples for few-shot prompting:
  - Instagram Reels (~4.2 score - strong performance)
  - Facebook Events (~3.4 score - passing performance)
- Common issues list for each dimension

### 2. Update Rubric Registry
**File: `/data/rubrics/index.ts`**

- Import and register `analyticalThinkingRubric` and `analyticalThinkingExamples`
- Add `isAnalyticalThinkingQuestion()` helper function
- Export new rubric

### 3. Update Types
**File: `/types/index.ts`**

```typescript
// Add to PMQuestionType union
"analytical-thinking"

// New interface
export interface AnalyticalThinkingScores {
  productRationale: number;
  measuringImpact: number;
  settingGoals: number;
  evaluatingTradeoffs: number;
}

// Update AssessmentSchema
export type AssessmentSchema = "product-sense" | "analytical-thinking" | "pm-generic" | "consulting";
```

### 4. Update Assessment API
**File: `/app/api/assessment/route.ts`**

- Add `buildAnalyticalThinkingPrompt()` function that:
  - Includes 4-dimension rubric with scoring criteria
  - Embeds 2 calibrated examples as scoring anchors
  - Returns scores in 4-dimension format + per-dimension feedback
- Add detection logic: `questionType === "Analytical Thinking" || questionType === "Execution"`
- Add `assessmentSchema: "analytical-thinking"` to response
- Add fallback scores for AT schema

### 5. Update Assessment UI
**File: `/app/assessment/[questionId]/page.tsx`**

- Add conditional rendering for `assessmentSchema === "analytical-thinking"`
- Display 4-dimension grid with weights (15%, 35%, 25%, 25%)
- Add dimension name formatting for AT dimensions
- Support dimension-level feedback display

## Implementation Order

1. **Data layer** - Create `/data/rubrics/analytical-thinking.ts` with rubric + examples
2. **Types** - Add `AnalyticalThinkingScores` interface to `/types/index.ts`
3. **Registry** - Update `/data/rubrics/index.ts` to register AT rubric
4. **API** - Modify `/app/api/assessment/route.ts` with AT prompt builder
5. **UI** - Update `/app/assessment/[questionId]/page.tsx` for 4-dimension display

## Files to Modify

| File | Action |
|------|--------|
| `/data/rubrics/analytical-thinking.ts` | CREATE - 4-dimension rubric + calibrated examples |
| `/data/rubrics/index.ts` | MODIFY - Register AT rubric |
| `/types/index.ts` | MODIFY - Add AnalyticalThinkingScores interface |
| `/app/api/assessment/route.ts` | MODIFY - Add AT prompt builder and detection |
| `/app/assessment/[questionId]/page.tsx` | MODIFY - Add 4-dimension score display |

## Scoring Criteria Summary (5/5 indicators)

**Product Rationale (5/5):**
- Clear product description with use cases and maturity stage
- Business model and revenue explanation
- Strong company mission connection
- Specific product mission statement (<15 words)
- First-principles reasoning about competitive positioning

**Measuring Impact (5/5):**
- 3+ ecosystem players with clear value propositions
- Specific metrics with DWM timeframes and mathematical precision
- NSM that captures multi-player value, can grow infinitely
- NSM critique with 2 strengths and 2 drawbacks
- Guardrail metrics (percentages) addressing each NSM weakness

**Setting Goals (5/5):**
- Clear altitude shift from product to team level
- Justified ecosystem player focus
- 3 specific goals for 3-6 month timeframe
- Impact/feasibility scoring (Low/Medium/High)
- One prioritized goal with clear NSM connection

**Evaluating Tradeoffs (5/5):**
- Tradeoff type identification (breadth vs depth, real estate, etc.)
- Common goal articulation
- 2 pros/2 cons for each option
- Decisive recommendation tied to product mission
- "What would change my mind" statement

## Calibrated Example Structure

Each example includes:
- Question title and company
- Condensed transcript summary (~200-300 words)
- Individual dimension scores (1-5)
- Justifications with quoted evidence
- Strengths and improvements lists

## Backward Compatibility

- Existing "execution" type questions will map to AT assessment at runtime
- PM-generic and consulting assessments unchanged
- `assessmentSchema` field indicates which rubric was used
