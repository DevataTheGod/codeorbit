-- ============================================================================
-- Security Fixes - RLS Policies
-- ============================================================================

-- 1. Fix understanding_scores RLS (remove open insert/update)
DROP POLICY IF EXISTS "System can insert scores" ON public.understanding_scores;
DROP POLICY IF EXISTS "System can update scores" ON public.understanding_scores;

-- Users can only insert/update their own scores
CREATE POLICY "Users insert own scores" ON public.understanding_scores
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own scores" ON public.understanding_scores
  FOR UPDATE USING (user_id = auth.uid());

-- 2. Fix telemetry_events RLS (remove open insert)
DROP POLICY IF EXISTS "System can insert events" ON public.telemetry_events;

-- Users can only insert their own events
CREATE POLICY "Users insert own events" ON public.telemetry_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 3. Fix reflection_challenges RLS (already correct, but verify)
-- Existing policies are correct: users can only insert/update their own

-- Done
