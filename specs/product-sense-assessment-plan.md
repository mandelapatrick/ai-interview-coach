# Product Sense Assessment Improvement Plan

## Summary
Implement calibrated Product Sense interview assessments using the new 5-dimension rubric from `data/pm_interviews/`, with few-shot prompting for better scoring accuracy and transcript collection for future calibration.

## Key Changes

### 1. Create Rubric Data Module
**New files in `/data/rubrics/`:**

| File | Purpose |
|------|---------|
| `types.ts` | TypeScript interfaces for rubrics (RubricDimension, AssessmentRubric, CalibratedExample) |
| `product-sense.ts` | 5-dimension rubric + 2 condensed calibrated examples for few-shot prompting |
| `index.ts` | Rubric loader with `getRubricConfig('product-sense')` function |

**Product Sense Dimensions (from your calibration data):**
- Product Motivation & Mission (20%)
- Target Audience (25%)
- Problem Identification (25%)
- Solution Development (20%)
- Communication Structure (10%)

### 2. Update Assessment API
**File: `/app/api/assessment/route.ts`**

Changes:
1. Add `isProductSense` check: `isPM && questionType === "product-sense"`
2. Create `buildProductSensePrompt()` function that:
   - Includes the 5-dimension rubric with scoring criteria
   - Embeds 2 condensed calibrated examples (Google Maps Parking, Meta Theme Park)
   - Returns scores in new 5-dimension format + per-dimension feedback
3. Add `assessmentSchema` field to response: `'product-sense' | 'pm-generic' | 'consulting'`
4. Add fallback scores for product-sense schema

### 3. Add Calibration Dataset Storage
**New file: `/lib/calibration-dataset.ts`**
- `saveCalibrationTranscript()` function to save assessed transcripts
- Saves: questionTitle, questionType, transcript, assessment, timestamp

**New migration: `/supabase/migrations/002_calibration_dataset.sql`**
```sql
CREATE TABLE calibration_transcripts (
  id UUID PRIMARY KEY,
  question_title TEXT,
  question_type TEXT,
  transcript JSONB,
  assessment JSONB,
  assessment_schema TEXT,
  track TEXT,
  overall_score DECIMAL(2,1),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Update Assessment UI
**File: `/app/assessment/[questionId]/page.tsx`**

Changes:
1. Add `ProductSenseScores` interface with 5 dimensions
2. Update score display conditional: check `assessment.assessmentSchema === "product-sense"`
3. Render 5-dimension grid for Product Sense (vs 6-dimension for other PM types)
4. Add optional dimension feedback section showing per-dimension explanations

### 5. Update Types
**File: `/types/index.ts`**

Add:
```typescript
export interface ProductSenseScores {
  productMotivation: number;
  targetAudience: number;
  problemIdentification: number;
  solutionDevelopment: number;
  communicationStructure: number;
}

export type AssessmentSchema = 'product-sense' | 'pm-generic' | 'consulting';
```

## Implementation Order

1. **Data layer** - Create `/data/rubrics/` with types and product-sense rubric
2. **API update** - Modify `/app/api/assessment/route.ts` with question-type detection and new prompt
3. **Types** - Add ProductSenseScores to `/types/index.ts`
4. **UI update** - Update `/app/assessment/[questionId]/page.tsx` for 5-dimension display
5. **Calibration storage** - Add `/lib/calibration-dataset.ts` and Supabase migration

## Files to Modify

| File | Action |
|------|--------|
| `/data/rubrics/types.ts` | CREATE - Rubric interfaces |
| `/data/rubrics/product-sense.ts` | CREATE - 5-dimension rubric + examples |
| `/data/rubrics/index.ts` | CREATE - Rubric loader |
| `/app/api/assessment/route.ts` | MODIFY - Add Product Sense prompt builder |
| `/app/assessment/[questionId]/page.tsx` | MODIFY - Add 5-dimension score display |
| `/types/index.ts` | MODIFY - Add ProductSenseScores interface |
| `/lib/calibration-dataset.ts` | CREATE - Transcript saving helper |
| `/supabase/migrations/002_calibration_dataset.sql` | CREATE - Calibration table |

## Backward Compatibility

- Non-product-sense PM questions continue using current 6-dimension rubric
- Consulting questions unchanged
- `assessmentSchema` field indicates which rubric was used
- UI conditionally renders correct number of dimensions
