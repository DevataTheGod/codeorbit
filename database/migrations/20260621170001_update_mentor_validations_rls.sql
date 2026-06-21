-- Migration: Update RLS policies on mentor_validations to allow admin access
-- Admins can read all mentor validations for analytics

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Mentors can read own validations" ON public.mentor_validations;

-- New SELECT policy: mentors can read their own, admins can read all
CREATE POLICY "Mentors and admins can read validations"
  ON public.mentor_validations
  FOR SELECT
  USING (
    auth.uid() = mentor_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Mentors can update own validations" ON public.mentor_validations;

-- New UPDATE policy: mentors can update their own, admins can update all
CREATE POLICY "Mentors and admins can update validations"
  ON public.mentor_validations
  FOR UPDATE
  USING (
    auth.uid() = mentor_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Drop existing DELETE policy
DROP POLICY IF EXISTS "Mentors can delete own validations" ON public.mentor_validations;

-- New DELETE policy: mentors can delete their own, admins can delete all
CREATE POLICY "Mentors and admins can delete validations"
  ON public.mentor_validations
  FOR DELETE
  USING (
    auth.uid() = mentor_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
