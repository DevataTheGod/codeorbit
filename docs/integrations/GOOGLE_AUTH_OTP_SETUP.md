# 🔗 CodeOrbit — OTP & Google Auth Integration

CodeOrbit uses **Resend** (not Gmail App Passwords or `nodemailer`) for OTP email delivery, and **Supabase Auth** for Google OAuth.

---

## 1. Google OAuth Setup

1. Go to **Supabase Dashboard → Authentication → Providers → Google**.
2. Enable Google and enter your **Client ID** and **Client Secret** from [Google Cloud Console](https://console.cloud.google.com).
3. Set the redirect URL to: `https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback`

> Do **not** put `GOOGLE_CLIENT_SECRET` in `VITE_*` env vars — configure it only inside Supabase Auth settings.

---

## 2. OTP Flow

```
User Login → Supabase Auth validates credentials
           → App generates 6-digit OTP
           → POST /send-otp → Express OTP Server
           → Resend API delivers email
           → User enters OTP → session finalized
```

---

## 3. Resend Setup

1. Create an account at [resend.com](https://resend.com).
2. Generate an API key and set it as `RESEND_API_KEY` in the Express server's `.env`.
3. Set `OTP_FROM_EMAIL` to your verified sending domain address.

---

## 4. Environment Variables

| Variable | Where | Description |
|---|---|---|
| `VITE_OTP_SERVER_URL` | Frontend `.env` | URL of the Express OTP server |
| `RESEND_API_KEY` | Backend `.env` | Resend API key |
| `OTP_FROM_EMAIL` | Backend `.env` | Verified sender address |
| `OTP_SERVER_API_KEY` | Both | Shared secret for `x-api-key` header auth |

---

## 5. Security Notes

- OTP codes expire after **10 minutes** and are single-use.
- Direct requests to `/send-otp` without the `x-api-key` header are rejected.
- Never commit real API keys to git — use `.env` (listed in `.gitignore`).
