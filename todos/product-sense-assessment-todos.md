# Product Sense Assessment - Implementation Todos

## Phase 1: Data Layer
- [x] Create `/data/rubrics/types.ts` with TypeScript interfaces (RubricDimension, AssessmentRubric, CalibratedExample, RubricConfig)
- [x] Create `/data/rubrics/product-sense.ts` with 5-dimension rubric definition
- [x] Add condensed calibrated examples (Google Maps Parking, Meta Theme Park) for few-shot prompting
- [x] Create `/data/rubrics/index.ts` with rubric loader and `getRubricConfig()` function

## Phase 2: API Update
- [x] Add `isProductSense` detection in `/app/api/assessment/route.ts`
- [x] Create `buildProductSensePrompt()` function with rubric and few-shot examples
- [x] Update response to include `assessmentSchema` field
- [x] Add Product Sense fallback scores for error handling
- [x] Integrate calibration transcript saving after successful assessment

## Phase 3: Types
- [x] Add `ProductSenseScores` interface to `/types/index.ts`
- [x] Add `AssessmentSchema` type to `/types/index.ts`

## Phase 4: UI Update
- [x] Add `ProductSenseScores` interface to `/app/assessment/[questionId]/page.tsx`
- [x] Update Assessment interface to include `assessmentSchema` and `dimensionFeedback`
- [x] Add conditional rendering for 5-dimension Product Sense scores
- [x] Add dimension feedback section for Product Sense assessments
- [x] Create `formatDimensionName()` helper function

## Phase 5: Calibration Storage
- [x] Create `/lib/calibration-dataset.ts` with `saveCalibrationTranscript()` function
- [x] Create `/supabase/migrations/002_create_calibration_transcripts.sql` for calibration_transcripts table
- [x] Add index on question_type for efficient querying

## Testing
- [ ] Test Product Sense question assessment end-to-end
- [ ] Verify non-Product-Sense PM questions still use 6-dimension rubric
- [ ] Verify consulting questions unchanged
- [ ] Test calibration dataset saving to Supabase
- [ ] Validate UI displays correct dimensions for each schema type

---

## Files Created/Modified

### New Files
- `/data/rubrics/types.ts` - TypeScript interfaces for rubrics
- `/data/rubrics/product-sense.ts` - 5-dimension rubric + calibrated examples
- `/data/rubrics/index.ts` - Rubric loader
- `/lib/calibration-dataset.ts` - Calibration transcript saving
- `/supabase/migrations/002_create_calibration_transcripts.sql` - Database migration

### Modified Files
- `/app/api/assessment/route.ts` - Added Product Sense prompt builder and calibration saving
- `/app/assessment/[questionId]/page.tsx` - Added 5-dimension display and dimension feedback
- `/types/index.ts` - Added ProductSenseScores and AssessmentSchema types
