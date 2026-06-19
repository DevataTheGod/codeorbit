-- ============================================================================
-- UNIFIED DATABASE SETUP SCRIPT FOR CODEORBIT
-- Compiled from migrations: 2026-06-19T10:40:44.786Z
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION: 20260105083735_bef1daca-1bf4-411f-b156-e2fd0bf2c3bf.sql
-- ────────────────────────────────────────────────────────────────────────────

-- Create project submissions table
CREATE TABLE public.project_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  college TEXT NOT NULL,
  year_of_study TEXT NOT NULL,
  project_title TEXT NOT NULL,
  project_description TEXT NOT NULL,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  deadline DATE NOT NULL,
  skill_assessment JSONB NOT NULL DEFAULT '{}',
  skill_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public submission form)
CREATE POLICY "Anyone can submit projects"
ON public.project_submissions
FOR INSERT
WITH CHECK (true);

-- Allow reading own submissions by email (for status checking)
CREATE POLICY "Anyone can read submissions"
ON public.project_submissions
FOR SELECT
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_submissions_updated_at
BEFORE UPDATE ON public.project_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION: 20260105083803_9e129521-f8ee-4e4a-963d-bd5ac6922f7d.sql
-- ────────────────────────────────────────────────────────────────────────────

-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION: 20260106013935_a2b37a49-5269-4924-a2ae-077cefacb3fc.sql
-- ────────────────────────────────────────────────────────────────────────────

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'mentor', 'student');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create milestones table
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected')),
  due_date DATE,
  source TEXT NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'mentor', 'student')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentor_reviews table
CREATE TABLE public.mentor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  review_type TEXT NOT NULL CHECK (review_type IN ('submission', 'checkpoint', 'code', 'help_request')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_changes')),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create help_requests table for student-initiated reviews
CREATE TABLE public.help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add user_id to project_submissions to link with authenticated users
ALTER TABLE public.project_submissions ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mentors can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Milestones policies
CREATE POLICY "Students can view own milestones"
ON public.milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_submissions ps
    WHERE ps.id = submission_id AND ps.user_id = auth.uid()
  )
);

CREATE POLICY "Mentors can view all milestones"
ON public.milestones FOR SELECT
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Mentors can manage milestones"
ON public.milestones FOR ALL
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can propose milestones"
ON public.milestones FOR INSERT
WITH CHECK (
  source = 'student' AND EXISTS (
    SELECT 1 FROM public.project_submissions ps
    WHERE ps.id = submission_id AND ps.user_id = auth.uid()
  )
);

-- Tasks policies
CREATE POLICY "Students can view own tasks"
ON public.tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.project_submissions ps ON ps.id = m.submission_id
    WHERE m.id = milestone_id AND ps.user_id = auth.uid()
  )
);

CREATE POLICY "Mentors can view all tasks"
ON public.tasks FOR SELECT
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Mentors can manage tasks"
ON public.tasks FOR ALL
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can update own task progress"
ON public.tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.project_submissions ps ON ps.id = m.submission_id
    WHERE m.id = milestone_id AND ps.user_id = auth.uid()
  )
);

-- Mentor reviews policies
CREATE POLICY "Students can view own reviews"
ON public.mentor_reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_submissions ps
    WHERE ps.id = submission_id AND ps.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.project_submissions ps ON ps.id = m.submission_id
    WHERE m.id = milestone_id AND ps.user_id = auth.uid()
  )
);

CREATE POLICY "Mentors can manage reviews"
ON public.mentor_reviews FOR ALL
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

-- Help requests policies
CREATE POLICY "Students can view own help requests"
ON public.help_requests FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Students can create help requests"
ON public.help_requests FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Mentors can view all help requests"
ON public.help_requests FOR SELECT
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Mentors can update help requests"
ON public.help_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

-- Update project_submissions policies to use user_id
DROP POLICY IF EXISTS "Anyone can read submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Anyone can submit projects" ON public.project_submissions;

CREATE POLICY "Users can view own submissions"
ON public.project_submissions FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can submit projects"
ON public.project_submissions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own submissions"
ON public.project_submissions FOR UPDATE
USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
BEFORE UPDATE ON public.milestones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_reviews_updated_at
BEFORE UPDATE ON public.mentor_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_requests_updated_at
BEFORE UPDATE ON public.help_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
  
  -- Default role is student
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION: 20260106014313_753fb996-219f-4fd9-b9c5-395a2acd1fbf.sql
-- ────────────────────────────────────────────────────────────────────────────

-- Allow both authenticated and unauthenticated users to submit projects
DROP POLICY IF EXISTS "Authenticated users can submit projects" ON public.project_submissions;

CREATE POLICY "Anyone can submit projects"
ON public.project_submissions FOR INSERT
WITH CHECK (true);

-- Also allow unauthenticated users to view their submission via email (for backwards compat)
DROP POLICY IF EXISTS "Users can view own submissions" ON public.project_submissions;

CREATE POLICY "Users can view own submissions"
ON public.project_submissions FOR SELECT
USING (
  user_id = auth.uid() 
  OR public.has_role(auth.uid(), 'mentor') 
  OR public.has_role(auth.uid(), 'admin')
  OR user_id IS NULL
);

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION: 20260106021158_3b5f2036-67e3-413e-9f1e-98084afe315c.sql
-- ────────────────────────────────────────────────────────────────────────────

-- Add time_spent column to tasks table (in minutes)
ALTER TABLE public.tasks ADD COLUMN time_spent integer NOT NULL DEFAULT 0;

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION: 20260202_create_mentor_reports_table.sql
-- ────────────────────────────────────────────────────────────────────────────

-- Create mentor_reports table to store chatbot-generated feedback
-- This table links milestone/project reviews to specific submissions and stores the JSON report

CREATE TABLE IF NOT EXISTS public.mentor_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  report jsonb NOT NULL,
  raw_text text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index on submission_id for faster queries
CREATE INDEX IF NOT EXISTS idx_mentor_reports_submission_id ON public.mentor_reports(submission_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_mentor_reports_created_at ON public.mentor_reports(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.mentor_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to insert (for chatbot function)
CREATE POLICY "Allow insert for chatbot" ON public.mentor_reports
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Mentors and admins can view all reports
CREATE POLICY "Mentors and admins can view all" ON public.mentor_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('mentor', 'admin')
    )
  );

-- Policy: Students can view reports for their own submissions
CREATE POLICY "Students view own reports" ON public.mentor_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_submissions
      WHERE id = mentor_reports.submission_id
        AND user_id = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION: 20260204120000_create_conversations_and_messages.sql
-- ────────────────────────────────────────────────────────────────────────────

-- Create conversations table to store chat sessions
-- Each conversation represents a unique chat session between user and BODHIT chatbot
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id uuid REFERENCES public.project_submissions(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'Untitled Conversation',
  project_idea text,
  tech_stack text,
  skill_level text,
  timeline text,
  intake_confirmed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_message_at timestamp with time zone
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);

-- Create index on submission_id
CREATE INDEX IF NOT EXISTS idx_conversations_submission_id ON public.conversations(submission_id);

-- Create index on updated_at for sorting (most recent first)
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- Create messages table to store individual messages in a conversation
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  message_type text DEFAULT 'explanation' CHECK (message_type IN ('explanation', 'hint', 'question', 'warning')),
  file_ops jsonb, -- Store parsed FILE_OPS if present
  mentor_report jsonb, -- Store parsed MENTOR_REPORT if present
  created_at timestamp with time zone DEFAULT now()
);

-- Create index on conversation_id for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policies
-- Policy: Users can view their own conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own conversations
CREATE POLICY "Users can insert own conversations" ON public.conversations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own conversations
CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Mentors and admins can view all conversations
CREATE POLICY "Mentors and admins view all conversations" ON public.conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('mentor', 'admin')
    )
  );

-- Messages Policies
-- Policy: Users can view messages in their own conversations
CREATE POLICY "Users can view own conversation messages" ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

-- Policy: Users can insert messages in their own conversations
CREATE POLICY "Users can insert messages in own conversations" ON public.messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

-- Policy: Mentors and admins can view all messages
CREATE POLICY "Mentors and admins view all messages" ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('mentor', 'admin')
    )
  );


-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION: 20260204_add_otp_system.sql
-- ────────────────────────────────────────────────────────────────────────────

-- Migration: Add OTP (One-Time Password) system for email verification
-- Created: 2026-02-04

-- 1. Create OTP codes table
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  purpose VARCHAR(50) NOT NULL DEFAULT 'signup' CHECK (purpose IN ('signup', 'password_reset', 'email_verification')),
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '10 minutes',
  used_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON public.otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_otp_code ON public.otp_codes(otp_code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_purpose ON public.otp_codes(email, purpose);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON public.otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_codes_is_used ON public.otp_codes(is_used);

-- Enable RLS on OTP codes table
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow service role to insert OTP codes (needed for server-side OTP generation)
DROP POLICY IF EXISTS "Allow insert for OTP creation" ON public.otp_codes;
CREATE POLICY "Allow insert for OTP creation" ON public.otp_codes FOR INSERT WITH CHECK (true);

-- Allow users to verify their own OTP (read only by user_id or email match via auth)
DROP POLICY IF EXISTS "Users can view OTP for their email during signup" ON public.otp_codes;
CREATE POLICY "Users can view OTP for their email during signup" ON public.otp_codes FOR SELECT USING (
  email = auth.jwt() ->> 'email' OR user_id = auth.uid()
);

-- Function to clean up expired OTP codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps() RETURNS void AS $$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < CURRENT_TIMESTAMP AND is_used = false;
END;
$$ LANGUAGE plpgsql;

-- Trigger to mark OTP as used with timestamp
CREATE OR REPLACE FUNCTION public.update_otp_used_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_used = true AND OLD.is_used = false THEN
    NEW.used_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS otp_codes_update_used_at ON public.otp_codes;
CREATE TRIGGER otp_codes_update_used_at BEFORE UPDATE ON public.otp_codes FOR EACH ROW EXECUTE FUNCTION public.update_otp_used_at();

-- ============================================================================
-- To clean up expired OTPs, run periodically:
-- SELECT public.cleanup_expired_otps();
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION: 20260205_fix_auth_profiles_trigger.sql
-- ────────────────────────────────────────────────────────────────────────────

-- Migration: Fix authentication by adding trigger to create profiles on user signup
-- Created: 2026-02-05

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, user_id, full_name, email, role)
  VALUES (NEW.id, NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'student')::app_role);

  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'student')::app_role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the trigger function has proper permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon;


-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION: 20260215091500_add_secure_otp_rpc.sql
-- ────────────────────────────────────────────────────────────────────────────

-- Add secure OTP RPCs so signup verification works for anonymous users
-- without exposing otp_codes table via permissive RLS.

CREATE OR REPLACE FUNCTION public.create_or_resend_otp(
  p_email text,
  p_purpose text DEFAULT 'signup',
  p_ttl_minutes integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_expires_at timestamptz;
BEGIN
  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'invalid_email',
      'message', 'Email is required'
    );
  END IF;

  IF p_purpose NOT IN ('signup', 'password_reset', 'email_verification') THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'invalid_purpose',
      'message', 'Invalid OTP purpose'
    );
  END IF;

  UPDATE public.otp_codes
  SET expires_at = now()
  WHERE email = p_email
    AND purpose = p_purpose
    AND is_used = false;

  v_code := lpad((floor(random() * 1000000))::int::text, 6, '0');
  v_expires_at := now() + make_interval(mins => greatest(p_ttl_minutes, 1));

  INSERT INTO public.otp_codes (email, otp_code, purpose, expires_at, is_used)
  VALUES (p_email, v_code, p_purpose, v_expires_at, false);

  RETURN jsonb_build_object(
    'success', true,
    'otp_code', v_code,
    'expires_at', v_expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_otp_code(
  p_email text,
  p_otp_code text,
  p_purpose text DEFAULT 'signup'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.otp_codes%ROWTYPE;
BEGIN
  IF p_email IS NULL OR p_otp_code IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'isValid', false,
      'code', 'invalid_input',
      'message', 'Email and OTP code are required'
    );
  END IF;

  SELECT *
  INTO v_row
  FROM public.otp_codes
  WHERE email = p_email
    AND otp_code = p_otp_code
    AND purpose = p_purpose
    AND is_used = false
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'isValid', false,
      'code', 'otp_not_found',
      'message', 'Invalid or expired OTP'
    );
  END IF;

  IF v_row.expires_at < now() THEN
    RETURN jsonb_build_object(
      'success', false,
      'isValid', false,
      'code', 'otp_expired',
      'message', 'OTP has expired'
    );
  END IF;

  UPDATE public.otp_codes
  SET is_used = true,
      used_at = now()
  WHERE id = v_row.id;

  RETURN jsonb_build_object(
    'success', true,
    'isValid', true,
    'code', 'verified',
    'message', 'OTP verified successfully'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_or_resend_otp(text, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_otp_code(text, text, text) TO anon, authenticated;


-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION: 20260215113000_fix_auth_trigger_for_google_oauth.sql
-- ────────────────────────────────────────────────────────────────────────────

-- Harden signup trigger to avoid "Database error saving new user"
-- during OAuth sign-in when profile/role rows already exist or metadata is unexpected.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_text text;
  v_role public.app_role;
BEGIN
  v_role_text := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'student');
  IF v_role_text IN ('admin', 'mentor', 'student') THEN
    v_role := v_role_text::public.app_role;
  ELSE
    v_role := 'student'::public.app_role;
  END IF;

  INSERT INTO public.profiles (id, user_id, full_name, email, role)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email),
    NEW.email,
    v_role
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION: 20260216_fix_milestones_rls_policy.sql
-- ────────────────────────────────────────────────────────────────────────────

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


-- ────────────────────────────────────────────────────────────────────────────
-- ADD MISSING PLAN & MENTOR_ACCESS COLUMNS TO TABLES
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'free';

ALTER TABLE IF EXISTS public.project_submissions 
ADD COLUMN IF NOT EXISTS mentor_access BOOLEAN NOT NULL DEFAULT false;
