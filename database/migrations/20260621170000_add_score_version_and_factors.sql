-- Migration: Add score_version and score_factors columns to understanding_scores
-- These columns enable audit trails and algorithm versioning

-- Add score_version column (tracks which algorithm version calculated this score)
ALTER TABLE understanding_scores
ADD COLUMN IF NOT EXISTS score_version text DEFAULT 'v1';

-- Add score_factors column (stores the detailed breakdown as JSON for audit trail)
ALTER TABLE understanding_scores
ADD COLUMN IF NOT EXISTS score_factors jsonb DEFAULT '{}';

-- Add index for score_version queries
CREATE INDEX IF NOT EXISTS idx_understanding_scores_version
  ON understanding_scores (score_version);

-- Add index for score_factors queries (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_understanding_scores_factors
  ON understanding_scores USING gin (score_factors);
