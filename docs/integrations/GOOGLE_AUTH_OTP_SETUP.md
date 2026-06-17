# Google Auth + OTP Integration Guide

## Overview

This system combines:
1. **Google OAuth Sign-In** - User authenticates with their Google account
2. **OTP Verification** - Send verification code via Gmail API to their Google email
3. **Account Creation** - After verification, account is created in Supabase

## Benefits

✅ **No separate credentials needed** - User's Google account provides the email
✅ **Automatic email delivery** - Uses Google's Gmail API
✅ **Better security** - Leverages Google's 2FA
✅ **User-friendly** - One-click Google sign in
✅ **No password storage** - Optional (use Google Auth + OTP instead)

## Setup Steps

### Step 1: Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Search for "Gmail API" → Click "Enable"
4. Go to APIs & Services → Credentials
5. Click "Create Credentials" → "OAuth 2.0 Client ID"
6. Choose "Web application"
7. Add Authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
8. Click "Create"
9. Download the JSON file
10. Copy `client_id`, `client_secret`, and `redirect_uris`

### Step 2: Configure Environment Variables

Add to `.env` and `.env.local`:

```env
# Supabase (already configured)
VITE_SUPABASE_PROJECT_ID="bszuklqqocfntoeszjdq"
VITE_SUPABASE_URL="https://bszuklqqocfntoeszjdq.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="..."

# Google OAuth
VITE_GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
# Never put Google client secret in VITE_* env vars.
# Configure Google client secret only in Supabase Auth provider settings.

# OTP Settings
VITE_OTP_EXPIRY_MINUTES="10"
VITE_OTP_LENGTH="6"
```

### Step 3: Configure Supabase OAuth

1. Go to Supabase Dashboard → Authentication → Providers
2. Find "Google"
3. Enable it
4. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
5. Set redirect URL: `https://yourdomain.supabase.co/auth/v1/callback`

### Step 4: Install Dependencies

```bash
npm install @react-oauth/google axios
npm install -D @types/google.accounts
```

### Step 5: Implement Backend Endpoint

Create `/api/auth/send-otp-gmail` endpoint (see `googleAuthOTP.ts`):

```typescript
POST /api/auth/send-otp-gmail
Body: {
  email: string,
  otpCode: string,
  purpose: string
}
Response: {
  success: boolean,
  message: string
}
```

## Flow Diagram

```
User → Google Sign-In
  ↓
User's Google Account Email Retrieved
  ↓
OTP Generated & Stored in DB
  ↓
OTP Sent via Gmail API
  ↓
User Enters OTP
  ↓
OTP Verified
  ↓
Account Created in Supabase
  ↓
Dashboard Access
```

## Updated Auth Component

Replace your `Auth.tsx` with the Google Auth version:

```typescript
// Key changes:
1. Import GoogleAuthOTPService instead of OTPService
2. Add "Sign in with Google" button
3. After Google auth, call sendOTPViaGmail
4. Rest of flow remains the same
```

## Files

1. **src/services/GoogleAuthOTPService.ts** - Core Google + OTP logic
2. **src/backend/routes/googleAuthOTP.ts** - Backend Gmail API integration
3. **Updated Auth.tsx** - Modified signup flow with Google Auth

## Two Signup Methods

### Method 1: Traditional Email/Password (Current)
1. User enters email & password
2. OTP sent (via Gmail or backend)
3. User verifies OTP
4. Account created

### Method 2: Google Auth Only (Recommended)
1. User clicks "Sign in with Google"
2. Google redirects back with authenticated email
3. OTP sent to their Google email
4. User verifies OTP
5. Account created
6. No password needed - use Google Auth for login

## Security Considerations

✅ **OAuth scopes** - Request `https://www.googleapis.com/auth/gmail.send` only
✅ **Token storage** - Store refresh token securely (encrypted in DB)
✅ **HTTPS required** - Enforce in production
✅ **Rate limiting** - Implement to prevent abuse
✅ **Token rotation** - Refresh tokens before expiry

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Gmail API not enabled" | Enable in Google Cloud Console |
| "Invalid OAuth credentials" | Check Client ID/Secret in .env |
| "OTP not sending" | Verify Gmail API scopes include `gmail.send` |
| "Redirect URI mismatch" | Ensure redirect URI matches in Google Cloud & Supabase |
| "Access token expired" | Implement token refresh logic |

## Next Steps

1. ✅ Enable Gmail API in Google Cloud
2. ✅ Get OAuth credentials
3. ✅ Configure .env
4. ✅ Set up Supabase OAuth provider
5. ✅ Implement backend endpoint
6. ✅ Update Auth.tsx to use Google Auth
7. ✅ Test in development
8. ✅ Deploy to production

## Alternative: Passwordless Sign-In

You can skip OTP entirely and use Google Auth for both signup and login:

```typescript
// Signup
1. User clicks "Sign in with Google"
2. User authenticated
3. Account created automatically
4. Logged in

// Login
1. User clicks "Sign in with Google"
2. User authenticated
3. Logged in
```

This is the simplest and most secure approach!

## Quick Test

```bash
# 1. Start development server
npm run dev

# 2. Go to http://localhost:5173/auth
# 3. Click "Sign in with Google"
# 4. Authenticate with your Google account
# 5. Receive OTP at your Google email
# 6. Enter OTP to verify
# 7. Account created!
```
