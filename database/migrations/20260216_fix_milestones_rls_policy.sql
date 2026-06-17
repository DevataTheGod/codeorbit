-- Fix RLS policy to allow students to insert AI-generated milestones
-- The generate-milestones function creates milestones with source = 'ai'
-- but the current policy only allows source = 'student'

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Students can propose milestones" ON public.milestones;

-- Create a new policy that allows students to insert milestones with any source
-- as long as the submission belongs to them
CREATE POLICY "Students can insert milestones for own submissions"
ON public.milestones FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_submissions ps
    WHERE ps.id = submission_id AND ps.user_id = auth.uid()
  )
);
