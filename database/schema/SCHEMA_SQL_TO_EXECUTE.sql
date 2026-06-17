-- ============================================================================
-- BODHIT DATABASE SCHEMA - COPY AND PASTE THIS INTO SUPABASE SQL EDITOR
-- ============================================================================
-- Instructions:
-- 1. Go to Supabase Dashboard → SQL Editor → New Query
-- 2. Copy everything below (Ctrl+A, Ctrl+C)
-- 3. Paste into Supabase SQL Editor (Ctrl+V)
-- 4. Click RUN button
-- 5. Wait 5-10 seconds for completion
-- ============================================================================

-- SAFE DROP: remove legacy tables from previous schema so imports won't conflict.
-- IMPORTANT: make a backup before running this. These statements use CASCADE.
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.help_requests CASCADE;
DROP TABLE IF EXISTS public.mentor_reviews CASCADE;
DROP TABLE IF EXISTS public.milestones CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.project_submissions CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;


-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 2. USER ROLES TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'mentor', 'admin')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES public.users(id),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view all roles" ON public.user_roles;
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = auth.uid() AND ur2.role IN ('admin', 'mentor'))
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 3. PROJECT SUBMISSIONS TABLE
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

ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Users modify own submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Users insert own submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Mentors view assigned submissions" ON public.project_submissions;
CREATE POLICY "Users view own submissions" ON public.project_submissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users modify own submissions" ON public.project_submissions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users insert own submissions" ON public.project_submissions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Mentors view assigned submissions" ON public.project_submissions FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'mentor'));
CREATE INDEX IF NOT EXISTS idx_project_submissions_user_id ON public.project_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_status ON public.project_submissions(status);
CREATE INDEX IF NOT EXISTS idx_project_submissions_created_at ON public.project_submissions(created_at DESC);

-- 4. CONVERSATIONS TABLE
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

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users update own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Mentors view all conversations" ON public.conversations;
CREATE POLICY "Users view own conversations" ON public.conversations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert conversations" ON public.conversations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own conversations" ON public.conversations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Mentors view all conversations" ON public.conversations FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')));
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_submission_id ON public.conversations(submission_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);

-- 5. MESSAGES TABLE
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

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users insert messages" ON public.messages;
DROP POLICY IF EXISTS "Mentors view all messages" ON public.messages;
CREATE POLICY "Users view own messages" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users insert messages" ON public.messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND user_id = auth.uid()));
CREATE POLICY "Mentors view all messages" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')));
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_role ON public.messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- 6. MENTOR REPORTS TABLE
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

ALTER TABLE public.mentor_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own reports" ON public.mentor_reports;
DROP POLICY IF EXISTS "Mentors view all reports" ON public.mentor_reports;
CREATE POLICY "Users view own reports" ON public.mentor_reports FOR SELECT USING (EXISTS (SELECT 1 FROM public.project_submissions WHERE id = mentor_reports.submission_id AND user_id = auth.uid()));
CREATE POLICY "Mentors view all reports" ON public.mentor_reports FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')));
CREATE INDEX IF NOT EXISTS idx_mentor_reports_submission_id ON public.mentor_reports(submission_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reports_conversation_id ON public.mentor_reports(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reports_created_at ON public.mentor_reports(created_at DESC);

-- 7. PROGRESS ENTRIES TABLE
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

ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own progress" ON public.progress_entries;
DROP POLICY IF EXISTS "Users insert progress" ON public.progress_entries;
DROP POLICY IF EXISTS "Users update own progress" ON public.progress_entries;
DROP POLICY IF EXISTS "Mentors view all progress" ON public.progress_entries;
CREATE POLICY "Users view own progress" ON public.progress_entries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert progress" ON public.progress_entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own progress" ON public.progress_entries FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Mentors view all progress" ON public.progress_entries FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('mentor', 'admin')));
CREATE INDEX IF NOT EXISTS idx_progress_entries_user_id ON public.progress_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_submission_id ON public.progress_entries(submission_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_conversation_id ON public.progress_entries(conversation_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_status ON public.progress_entries(status);
CREATE INDEX IF NOT EXISTS idx_progress_entries_created_at ON public.progress_entries(created_at DESC);

-- 8. AUDIT LOG TABLE
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

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view audit log" ON public.audit_log;
CREATE POLICY "Admins view audit log" ON public.audit_log FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);

-- TRIGGERS
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS project_submissions_updated_at ON public.project_submissions;
CREATE TRIGGER project_submissions_updated_at BEFORE UPDATE ON public.project_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS mentor_reports_updated_at ON public.mentor_reports;
CREATE TRIGGER mentor_reports_updated_at BEFORE UPDATE ON public.mentor_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS progress_entries_updated_at ON public.progress_entries;
CREATE TRIGGER progress_entries_updated_at BEFORE UPDATE ON public.progress_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================
-- Tables created: 8
-- Indexes created: 25+
-- RLS enabled: All tables
-- Triggers created: 4
-- ============================================================================
