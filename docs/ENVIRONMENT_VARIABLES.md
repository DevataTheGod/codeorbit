# ⚙️ CodeOrbit — Environment Variables

All variables are defined in `.env` at the project root. Copy the template with:
```bash
cp config/.env.example .env
```

---

## Frontend (Vite) — `VITE_*` prefix

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Supabase project endpoint | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public API key | `eyJhbGciOiJIUzI1Ni...` |
| `VITE_OTP_SERVER_URL` | ✅ | URL of the Express OTP server | `http://localhost:8787` |
| `VITE_OTP_SERVER_API_KEY` | ⬜ | Shared secret for OTP server auth header | `super-secret-123` |

> Find `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **Supabase Dashboard → Settings → API**.

---

## Backend Express Server — server-side only

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | ⬜ | Server port (default: `8787`) | `8787` |
| `FRONTEND_ORIGIN` | ✅ | CORS-allowed frontend origin | `http://localhost:8080` |
| `RESEND_API_KEY` | ✅ | Resend transactional email API key | `re_123456789...` |
| `OTP_FROM_EMAIL` | ✅ | Verified sender email address | `onboarding@resend.dev` |
| `OTP_SERVER_API_KEY` | ⬜ | Shared key to authenticate client OTP requests | `super-secret-123` |

---

## Supabase Edge Function Secrets

Set via CLI — never in `.env`:
```bash
supabase secrets set GEMINI_API_KEY="AIzaSy..." --project-ref <YOUR_PROJECT_REF>
```

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for Orbit AI chat and milestone generation |
