-- ============================================================================
-- Understanding Score & Reflection Challenge Tables (Fixed for Supabase Auth)
-- ============================================================================

-- 1. UNDERSTANDING SCORES TABLE
CREATE TABLE IF NOT EXISTS public.understanding_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.project_submissions(id) ON DELETE SET NULL,
  overall DECIMAL(5,2) NOT NULL DEFAULT 0,
  engagement DECIMAL(5,2) NOT NULL DEFAULT 0,
  explanation DECIMAL(5,2) NOT NULL DEFAULT 0,
  progress DECIMAL(5,2) NOT NULL DEFAULT 0,
  risk_level VARCHAR(50) NOT NULL DEFAULT 'on-track' 
    CHECK (risk_level IN ('mastery', 'on-track', 'at-risk', 'struggling', 'critical')),
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0,
  concept_scores JSONB DEFAULT '{}',
  factors JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, submission_id)
);

ALTER TABLE public.understanding_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own scores" ON public.understanding_scores
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Mentors view all scores" ON public.understanding_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );

CREATE POLICY "System can insert scores" ON public.understanding_scores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update scores" ON public.understanding_scores
  FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_understanding_scores_user_id ON public.understanding_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_understanding_scores_submission_id ON public.understanding_scores(submission_id);
CREATE INDEX IF NOT EXISTS idx_understanding_scores_risk_level ON public.understanding_scores(risk_level);
CREATE INDEX IF NOT EXISTS idx_understanding_scores_overall ON public.understanding_scores(overall DESC);

-- 2. REFLECTION CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS public.reflection_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL 
    CHECK (type IN ('post-paste', 'post-milestone', 'concept-verification', 'random-verification')),
  prompt TEXT NOT NULL,
  context TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'skipped')),
  response TEXT,
  score DECIMAL(5,2),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.reflection_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own challenges" ON public.reflection_challenges
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users insert own challenges" ON public.reflection_challenges
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own challenges" ON public.reflection_challenges
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Mentors view all challenges" ON public.reflection_challenges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_reflection_challenges_user_id ON public.reflection_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_reflection_challenges_status ON public.reflection_challenges(status);
CREATE INDEX IF NOT EXISTS idx_reflection_challenges_type ON public.reflection_challenges(type);
CREATE INDEX IF NOT EXISTS idx_reflection_challenges_created_at ON public.reflection_challenges(created_at DESC);

-- 3. TELEMETRY EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL 
    CHECK (event_type IN ('paste', 'typing', 'orbit-interaction', 'milestone-complete', 'reflection-response', 'help-request')),
  event_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own events" ON public.telemetry_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert events" ON public.telemetry_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Mentors view all events" ON public.telemetry_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_telemetry_events_user_id ON public.telemetry_events(user_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_type ON public.telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_created_at ON public.telemetry_events(created_at DESC);

-- 4. AUTO-UPDATE TRIGGER
CREATE TRIGGER understanding_scores_updated_at BEFORE UPDATE ON public.understanding_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Done
