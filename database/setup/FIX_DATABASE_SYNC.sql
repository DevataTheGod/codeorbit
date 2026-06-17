-- ============================================================================
-- FIX for Infinite Recursion and Missing Users
-- ============================================================================

-- 1. Fix infinite recursion on user_roles RLS policy
-- The previous policy checked user_roles from within user_roles, causing a loop.
-- We now check the users table instead, which also stores the role.
DROP POLICY IF EXISTS "Admins view all roles" ON public.user_roles;

CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'mentor')
    )
  );

-- 2. Sync any missing users from auth.users to public.users
-- This fixes the issue where a project submission fails due to foreign key missing user_id
INSERT INTO public.users (id, email, full_name, avatar_url, role)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'full_name', 
  raw_user_meta_data->>'avatar_url', 
  COALESCE(raw_user_meta_data->>'role', 'student')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);

-- 3. Sync any missing user roles to public.user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'role', 'student')
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles);
