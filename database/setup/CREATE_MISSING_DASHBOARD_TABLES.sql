-- ============================================================================
-- FIX for Missing Dashboard Tables (Blank Screen Error)
-- ============================================================================

-- 1. Create PROFILES table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE,
  bio TEXT,
  website TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for PROFILES
DROP POLICY IF EXISTS "Users view all profiles" ON public.profiles;
CREATE POLICY "Users view all profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Sync existing users to profiles table so the dashboard doesn't error out
INSERT INTO public.profiles (id)
SELECT id FROM public.users
WHERE id NOT IN (SELECT id FROM public.profiles);


-- 2. Create MILESTONES table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'blocked')),
  due_date TIMESTAMP WITH TIME ZONE,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for MILESTONES
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for MILESTONES
DROP POLICY IF EXISTS "Users view own milestones" ON public.milestones;
CREATE POLICY "Users view own milestones" ON public.milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_submissions
      WHERE id = milestones.submission_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Mentors view all milestones" ON public.milestones;
CREATE POLICY "Mentors view all milestones" ON public.milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_milestones_submission_id ON public.milestones(submission_id);

-- Update trigger for milestones
DROP TRIGGER IF EXISTS milestones_updated_at ON public.milestones;
CREATE TRIGGER milestones_updated_at BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
