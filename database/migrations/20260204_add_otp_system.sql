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
