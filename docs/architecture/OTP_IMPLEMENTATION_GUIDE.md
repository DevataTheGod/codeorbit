# OTP Email Verification System - Complete Implementation Guide

## What Was Created

This implementation provides a complete OTP (One-Time Password) verification system for email confirmation during signup. It includes:

1. **Database Schema** (`supabase/migrations/20260204_add_otp_system.sql`)
   - `otp_codes` table to store OTP codes with expiry
   - Indexes for fast lookups
   - RLS policies for security
   - Auto-cleanup functions

2. **Frontend Service** (`src/services/OTPService.ts`)
   - `generateOTP()` - Creates random 6-digit codes
   - `sendOTP()` - Stores OTP in database
   - `verifyOTP()` - Validates OTP against database
   - `resendOTP()` - Invalidates old codes and creates new ones
   - `cleanupExpiredOTPs()` - Removes expired codes

3. **UI Component** (`src/components/OTPVerification.tsx`)
   - Beautiful 6-digit OTP input fields
   - Auto-focus between fields
   - Paste support (paste all 6 digits at once)
   - Keyboard navigation (arrow keys, backspace)
   - Resend functionality with 60-second cooldown
   - Expiry countdown timer
   - Error/success messaging

4. **Updated Auth Flow** (`src/pages/Auth.tsx`)
   - Signup now includes OTP verification step
   - After form validation → OTP sent → OTP verification → Account created
   - Seamless flow with loading states

## Implementation Steps

### Step 1: Run Database Migration

Execute the OTP migration in Supabase SQL Editor:

```sql
-- Copy contents from: supabase/migrations/20260204_add_otp_system.sql
-- Paste into Supabase → SQL Editor → New Query → Run
```

This creates the `otp_codes` table with proper indexes and RLS policies.

### Step 2: Implement Email Sending (Backend)

The current implementation stores OTPs in the database but requires a backend service to send emails.

Choose one of these options:

#### Option A: Supabase Edge Functions (Recommended)

1. Create Supabase Edge Function for sending OTP emails:

```bash
cd supabase/functions
supabase functions new send-otp
```

2. Update `send-otp/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email, purpose } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store in database
    await supabase.from("otp_codes").insert({
      email,
      otp_code: otpCode,
      purpose: purpose || "signup",
      expires_at: expiresAt.toISOString(),
    });

    // Send email (using Resend, SendGrid, or your email service)
    // Example with Resend:
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "noreply@forge-learn.com",
        to: email,
        subject: "Your FORGE-LEARN Verification Code",
        html: `<h1>${otpCode}</h1><p>Code expires in 10 minutes</p>`,
      }),
    });

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
```

3. Deploy:

```bash
supabase functions deploy send-otp
```

4. Update frontend to call this endpoint instead of OTPService.sendOTP directly.

#### Option B: Express.js Backend

If using Node.js/Express, create these endpoints:

```typescript
// routes/auth.ts
import express from 'express';
import nodemailer from 'nodemailer';
import { OTPService } from '../services/OTPService';

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

router.post('/send-otp', async (req, res) => {
  try {
    const { email, purpose } = req.body;
    
    // Generate and store OTP
    const otpCode = OTPService.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await supabase.from('otp_codes').insert({
      email,
      otp_code: otpCode,
      purpose: purpose || 'signup',
      expires_at: expiresAt.toISOString(),
    });

    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your FORGE-LEARN Verification Code',
      html: `<h1>${otpCode}</h1><p>Valid for 10 minutes</p>`,
    });

    res.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otpCode, purpose } = req.body;
  const result = await OTPService.verifyOTP(email, otpCode, purpose);
  res.json(result);
});

export default router;
```

#### Option C: Firebase Cloud Functions

Similar to above but using Google Cloud Functions.

### Step 3: Update Frontend to Call Backend API

Update `src/components/OTPVerification.tsx` to call your API:

```typescript
// Instead of calling OTPService directly:
const response = await fetch('/api/auth/verify-otp', {
  method: 'POST',
  body: JSON.stringify({ email, otpCode, purpose }),
});
```

### Step 4: Test the Flow

1. Visit signup page
2. Fill in form and submit
3. Should redirect to OTP verification
4. Check your email (or console in dev) for the 6-digit code
5. Enter code and verify
6. Account created!

## Configuration

### Environment Variables

Add to `.env`:

```env
# For Gmail (Optional if using backend service)
VITE_GMAIL_USER="your-email@gmail.com"
VITE_GMAIL_APP_PASSWORD="your-app-password"

# OTP Settings
VITE_OTP_EXPIRY_MINUTES="10"
VITE_OTP_LENGTH="6"
```

To get Gmail App Password:
1. Go to https://myaccount.google.com
2. Enable 2-Step Verification
3. Go to Security → App passwords
4. Generate password for Mail
5. Copy 16-character password

## File Structure

```
forge-learn/
├── src/
│   ├── services/
│   │   └── OTPService.ts (Core OTP logic)
│   ├── components/
│   │   └── OTPVerification.tsx (UI Component)
│   └── pages/
│       └── Auth.tsx (Updated signup flow)
├── supabase/
│   └── migrations/
│       └── 20260204_add_otp_system.sql (Database schema)
└── API_ENDPOINTS_REFERENCE.ts (Backend examples)
```

## Security Considerations

1. ✅ OTP codes expire after 10 minutes
2. ✅ Each OTP can only be used once
3. ✅ OTP stored in secure database with RLS
4. ✅ Email validation before sending OTP
5. ⚠️ TODO: Rate limiting (prevent brute force)
6. ⚠️ TODO: CAPTCHA for signup page
7. ⚠️ TODO: Email verification audit logs

Add rate limiting in production:

```typescript
// Middleware to limit OTP requests per email
const otpRateLimit = new Map();

export const checkOTPRateLimit = (email: string): boolean => {
  const lastRequest = otpRateLimit.get(email);
  if (lastRequest && Date.now() - lastRequest < 30000) { // 30 second minimum
    return false;
  }
  otpRateLimit.set(email, Date.now());
  return true;
};
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| OTP not sending | Implement backend email service; check Gmail credentials |
| Verification always fails | Ensure OTP stored correctly; check database |
| "Code expired" error | OTP valid for 10 min; user took too long |
| Paste not working | Use modern browser (all modern ones support it) |

## Next Steps

1. ✅ Database schema created
2. ✅ Frontend service & UI built
3. ✅ Auth flow updated
4. ⏳ **Implement backend email service** (Gmail, Resend, SendGrid, etc.)
5. ⏳ Add rate limiting
6. ⏳ Deploy and test in production
7. ⏳ Monitor OTP usage with audit logs

## API Reference

### OTPService Methods

```typescript
// Generate 6-digit code
OTPService.generateOTP(): string

// Send OTP and store in DB
OTPService.sendOTP(email: string, purpose?: string): Promise<OTPResponse>

// Verify OTP code
OTPService.verifyOTP(email: string, otpCode: string, purpose?: string): Promise<VerifyOTPResponse>

// Resend OTP (invalidate old, create new)
OTPService.resendOTP(email: string, purpose?: string): Promise<OTPResponse>

// Clean expired codes (run periodically)
OTPService.cleanupExpiredOTPs(): Promise<void>
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Supabase `otp_codes` table exists
3. Check network tab for API calls
4. Review backend logs if using cloud functions
