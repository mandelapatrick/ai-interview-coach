-- Add columns to store flexible assessment data for different interview types
-- (product-sense, analytical-thinking, pm-generic, consulting)

ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS assessment_schema text,
ADD COLUMN IF NOT EXISTS scores jsonb,
ADD COLUMN IF NOT EXISTS dimension_feedback jsonb;

-- Add comment for documentation
COMMENT ON COLUMN assessments.assessment_schema IS 'Assessment type: product-sense, analytical-thinking, pm-generic, consulting';
COMMENT ON COLUMN assessments.scores IS 'JSONB storing dimension scores (varies by assessment_schema)';
COMMENT ON COLUMN assessments.dimension_feedback IS 'JSONB storing per-dimension feedback text';
