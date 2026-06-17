-- ============================================================================
-- BODHIT Complete Database Schema Setup
-- ============================================================================
-- This script creates all tables, indexes, RLS policies, and triggers
-- Execute in Supabase SQL Editor in order
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE (Authentication base)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (id = auth.uid());

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================================
-- 1.5 PROFILES TABLE (Store extended user profile details)
-- ============================================================================
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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users view all profiles
CREATE POLICY "Users view all profiles" ON public.profiles FOR SELECT USING (true);

-- RLS Policy: Users update own profiles
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================================
-- 2. USER ROLES TABLE (Track roles: student, mentor, admin)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'mentor', 'admin')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES public.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins and mentors can view all roles
CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin', 'mentor')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- ============================================================================
-- 3. PROJECT SUBMISSIONS TABLE (Store student project submissions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  tech_stack TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in-review', 'approved', 'rejected')),
  submission_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view and modify their own submissions
CREATE POLICY "Users view own submissions" ON public.project_submissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users modify own submissions" ON public.project_submissions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users insert own submissions" ON public.project_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policy: Mentors can view submissions assigned to them
CREATE POLICY "Mentors view assigned submissions" ON public.project_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'mentor'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_submissions_user_id ON public.project_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_status ON public.project_submissions(status);
CREATE INDEX IF NOT EXISTS idx_project_submissions_created_at ON public.project_submissions(created_at DESC);

-- ============================================================================
-- 3.5 MILESTONES TABLE (Project deliverables)
-- ============================================================================
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

-- Enable RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users view milestones for their submissions
CREATE POLICY "Users view own milestones" ON public.milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_submissions
      WHERE id = milestones.submission_id AND user_id = auth.uid()
    )
  );

-- RLS Policy: Mentors view all milestones
CREATE POLICY "Mentors view all milestones" ON public.milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_milestones_submission_id ON public.milestones(submission_id);

-- ============================================================================
-- 3.8 HELP REQUESTS TABLE (Student support requests)
-- ============================================================================
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

-- Enable RLS
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users view own help requests
CREATE POLICY "Users view own help requests" ON public.help_requests
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Users insert own help requests" ON public.help_requests
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- RLS Policy: Mentors view all help requests
CREATE POLICY "Mentors view all help requests" ON public.help_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );
  
-- RLS Policy: Mentors update all help requests
CREATE POLICY "Mentors update all help requests" ON public.help_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_help_requests_student_id ON public.help_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_submission_id ON public.help_requests(submission_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON public.help_requests(status);

-- ============================================================================
-- 4. CONVERSATIONS TABLE (Chat sessions between student and BODHIT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.project_submissions(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Conversation',
  project_idea TEXT,
  tech_stack TEXT,
  skill_level VARCHAR(50),
  timeline TEXT,
  intake_confirmed BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users view their own conversations
CREATE POLICY "Users view own conversations" ON public.conversations
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policy: Users insert conversations
CREATE POLICY "Users insert conversations" ON public.conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users update their conversations
CREATE POLICY "Users update own conversations" ON public.conversations
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policy: Mentors and admins view all conversations
CREATE POLICY "Mentors view all conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_submission_id ON public.conversations(submission_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);

-- ============================================================================
-- 5. MESSAGES TABLE (Individual chat messages)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'explanation' CHECK (message_type IN ('explanation', 'hint', 'question', 'warning')),
  file_ops JSONB,
  mentor_report JSONB,
  tokens_used INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users view messages in their conversations
CREATE POLICY "Users view own messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id AND user_id = auth.uid()
    )
  );

-- RLS Policy: Users insert messages in their conversations
CREATE POLICY "Users insert messages" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id AND user_id = auth.uid()
    )
  );

-- RLS Policy: Mentors view all messages
CREATE POLICY "Mentors view all messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_role ON public.messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- ============================================================================
-- 6. MENTOR REPORTS TABLE (BODHIT-generated feedback)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mentor_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  report JSONB NOT NULL,
  raw_text TEXT,
  mentor_notes TEXT,
  status VARCHAR(50) DEFAULT 'generated' CHECK (status IN ('generated', 'reviewed', 'acted-upon')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.mentor_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users view reports for their submissions
CREATE POLICY "Users view own reports" ON public.mentor_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_submissions
      WHERE id = mentor_reports.submission_id AND user_id = auth.uid()
    )
  );

-- RLS Policy: Mentors and admins view all reports
CREATE POLICY "Mentors view all reports" ON public.mentor_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mentor_reports_submission_id ON public.mentor_reports(submission_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reports_conversation_id ON public.mentor_reports(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reports_created_at ON public.mentor_reports(created_at DESC);

-- ============================================================================
-- 7. PROGRESS ENTRIES TABLE (Milestone and progress tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.project_submissions(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  milestone_number INT,
  status VARCHAR(50) DEFAULT 'in-progress' CHECK (status IN ('planned', 'in-progress', 'completed', 'blocked')),
  files_snapshot JSONB,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users view own progress
CREATE POLICY "Users view own progress" ON public.progress_entries
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policy: Users insert progress
CREATE POLICY "Users insert progress" ON public.progress_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users update progress
CREATE POLICY "Users update own progress" ON public.progress_entries
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policy: Mentors view all progress
CREATE POLICY "Mentors view all progress" ON public.progress_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_progress_entries_user_id ON public.progress_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_submission_id ON public.progress_entries(submission_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_conversation_id ON public.progress_entries(conversation_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_status ON public.progress_entries(status);
CREATE INDEX IF NOT EXISTS idx_progress_entries_created_at ON public.progress_entries(created_at DESC);

-- ============================================================================
-- 8. AUDIT LOG TABLE (Track all changes for security)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action VARCHAR(255) NOT NULL,
  table_name VARCHAR(255),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view audit log
CREATE POLICY "Admins view audit log" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);

-- ============================================================================
-- 9. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for conversations
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for project_submissions
CREATE TRIGGER project_submissions_updated_at BEFORE UPDATE ON public.project_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for mentor_reports
CREATE TRIGGER mentor_reports_updated_at BEFORE UPDATE ON public.mentor_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for progress_entries
CREATE TRIGGER progress_entries_updated_at BEFORE UPDATE ON public.progress_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for milestones
CREATE TRIGGER milestones_updated_at BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 10. VERIFICATION QUERIES
-- ============================================================================

-- Check all tables are created
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check all indexes
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- DATABASE SETUP COMPLETE
-- ============================================================================
-- Tables created: 8
-- Indexes created: 25+
-- RLS Policies: Enabled
-- Triggers: 4
-- Ready for data import
-- ============================================================================
