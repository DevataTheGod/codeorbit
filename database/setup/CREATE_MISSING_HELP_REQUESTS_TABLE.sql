-- ============================================================================
-- FIX for Missing Help Requests Table (Blank Screen Error Round 3)
-- ============================================================================

-- Create HELP_REQUESTS table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for HELP_REQUESTS
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for HELP_REQUESTS
DROP POLICY IF EXISTS "Users view own help requests" ON public.help_requests;
CREATE POLICY "Users view own help requests" ON public.help_requests
  FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own help requests" ON public.help_requests;
CREATE POLICY "Users insert own help requests" ON public.help_requests
  FOR INSERT WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Mentors view all help requests" ON public.help_requests;
CREATE POLICY "Mentors view all help requests" ON public.help_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );

DROP POLICY IF EXISTS "Mentors update all help requests" ON public.help_requests;
CREATE POLICY "Mentors update all help requests" ON public.help_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_help_requests_student_id ON public.help_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_submission_id ON public.help_requests(submission_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON public.help_requests(status);

-- Update trigger for help_requests
DROP TRIGGER IF EXISTS help_requests_updated_at ON public.help_requests;
CREATE TRIGGER help_requests_updated_at BEFORE UPDATE ON public.help_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
