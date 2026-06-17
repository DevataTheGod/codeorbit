# OTP & Gmail Configuration Guide

## Setup Steps

### 1. Create Gmail App Password (Recommended for security)

1. Go to your Google Account: https://myaccount.google.com
2. Enable 2-Step Verification (if not already enabled)
3. Go to **Security** → **App passwords**
4. Select "Mail" and "Windows Computer"
5. Google will generate a 16-character password
6. Copy this password

### 2. Update `.env` with Gmail Credentials

Add these lines to your `.env` file:

```
# Gmail Configuration for OTP Email Service
VITE_GMAIL_USER="your-email@gmail.com"
VITE_GMAIL_APP_PASSWORD="your-16-char-app-password"

# OTP Configuration
VITE_OTP_EXPIRY_MINUTES="10"
VITE_OTP_LENGTH="6"
```

**Important:** 
- Use App Password (not your main Gmail password) for security
- Keep these credentials private; never commit to git
- Add `.env.local` to `.gitignore` if it exists

### 3. Alternative: Google OAuth for Sending Emails (Advanced)

If you want to use Google OAuth instead of App Password:

1. Go to https://console.developers.google.com
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials (Service Account)
5. Download JSON key
6. Use `googleapis` npm package (see backend section)

For now, **App Password method is simpler** and recommended.

### 4. Install Dependencies

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

## Files Created

1. **supabase/migrations/20260204_add_otp_system.sql** - Database schema
2. **src/services/OTPService.ts** - Core OTP logic (send, verify, cleanup)
3. **src/components/OTPVerification.tsx** - UI component for OTP input
4. **src/pages/Auth.tsx** - Updated signup flow with OTP step

## How It Works

1. **User signs up** → enters email
2. **OTP sent** → 6-digit code to email, valid for 10 minutes
3. **User verifies** → enters 6-digit code in UI
4. **Account created** → after successful verification

## Testing

Use test email addresses during development:
- Gmail Sandbox: Check your actual inbox for test emails
- Supabase: OTP codes stored in `otp_codes` table

## Security Notes

- OTP codes expire after 10 minutes (configurable)
- Each OTP can only be used once
- Rate limiting: Implement in production
- HTTPS only in production
- Never log OTP codes to console in production
