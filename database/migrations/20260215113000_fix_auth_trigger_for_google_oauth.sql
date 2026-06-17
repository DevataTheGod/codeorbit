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
