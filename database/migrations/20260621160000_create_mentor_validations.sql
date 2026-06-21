-- Migration: Create mentor_validations table
-- Stores mentor rankings and scores for validation comparison (TASK-0008)

CREATE TABLE IF NOT EXISTS public.mentor_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_score INTEGER NOT NULL CHECK (mentor_score >= 0 AND mentor_score <= 100),
  mentor_rank INTEGER NOT NULL CHECK (mentor_rank >= 1),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: one active ranking per mentor-student pair
-- Remove this if you want to allow historical rankings
CREATE UNIQUE INDEX IF NOT EXISTS idx_mentor_validations_mentor_student
  ON public.mentor_validations (mentor_id, student_id);

-- RLS: mentors can only read/update their own validations
ALTER TABLE public.mentor_validations ENABLE ROW LEVEL SECURITY;

-- Mentors can read their own validations
CREATE POLICY "Mentors can read own validations"
  ON public.mentor_validations
  FOR SELECT
  USING (auth.uid() = mentor_id);

-- Mentors can insert their own validations
CREATE POLICY "Mentors can insert own validations"
  ON public.mentor_validations
  FOR INSERT
  WITH CHECK (auth.uid() = mentor_id);

-- Mentors can update their own validations
CREATE POLICY "Mentors can update own validations"
  ON public.mentor_validations
  FOR UPDATE
  USING (auth.uid() = mentor_id);

-- Mentors can delete their own validations
CREATE POLICY "Mentors can delete own validations"
  ON public.mentor_validations
  FOR DELETE
  USING (auth.uid() = mentor_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_mentor_validations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mentor_validations_updated_at
  BEFORE UPDATE ON public.mentor_validations
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_validations_updated_at();
