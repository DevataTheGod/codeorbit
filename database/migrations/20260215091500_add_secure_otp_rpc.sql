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
