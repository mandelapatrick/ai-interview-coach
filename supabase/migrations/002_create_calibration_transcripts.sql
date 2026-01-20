-- Create calibration_transcripts table for storing assessed transcripts
-- These are used for future rubric calibration and improvement

CREATE TABLE IF NOT EXISTS calibration_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_title TEXT NOT NULL,
  question_type TEXT NOT NULL,
  question_id TEXT,
  transcript JSONB NOT NULL,
  assessment JSONB NOT NULL,
  assessment_schema TEXT NOT NULL DEFAULT 'pm-generic',
  track TEXT NOT NULL DEFAULT 'product-management',
  overall_score DECIMAL(2,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- For future manual review/correction
  reviewed BOOLEAN DEFAULT FALSE,
  reviewer_notes TEXT,
  corrected_assessment JSONB
);

-- Index for efficient querying by question type
CREATE INDEX IF NOT EXISTS idx_calibration_question_type
  ON calibration_transcripts(question_type);

-- Index for efficient querying by track
CREATE INDEX IF NOT EXISTS idx_calibration_track
  ON calibration_transcripts(track);

-- Index for efficient querying by assessment schema
CREATE INDEX IF NOT EXISTS idx_calibration_schema
  ON calibration_transcripts(assessment_schema);

-- Index for finding unreviewed transcripts
CREATE INDEX IF NOT EXISTS idx_calibration_reviewed
  ON calibration_transcripts(reviewed);

-- Index for score-based queries
CREATE INDEX IF NOT EXISTS idx_calibration_score
  ON calibration_transcripts(overall_score);

-- Comment on table
COMMENT ON TABLE calibration_transcripts IS
  'Stores assessed interview transcripts for rubric calibration and future improvements';
