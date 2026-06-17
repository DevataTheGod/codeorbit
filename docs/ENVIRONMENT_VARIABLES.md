# ⚙️ CodeOrbit — Environment Variables

This document defines all environment variables required to run the frontend client, backend Express server, and Supabase Edge Functions.

---

## 1. Frontend Client Configuration (`.env`)

Variables prefixed with `VITE_` are exposed to the client application code.

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Endpoint URL of the Supabase project | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Client anonymous access API key | `eyJhbGciOiJIUzI1Ni...` |
| `VITE_OTP_SERVER_URL` | Yes | Local or hosted URL of the Express server | `http://localhost:8787` |
| `VITE_OTP_SERVER_API_KEY` | Yes | Shared API key to authorize mail requests | `super-secret-key-123` |

---

## 2. Express OTP Backend Configuration (`.env`)

Variables read by the Node.js process. Do not commit these values to source control.

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | No | Port for the Express server (default: `8787`) | `8787` |
| `FRONTEND_ORIGIN` | Yes | URL of client app allowed by CORS policies | `http://localhost:8080` |
| `RESEND_API_KEY` | Yes | API token for Resend transactional mailer | `re_123456789...` |
| `OTP_SERVER_API_KEY` | Yes | Shared API key to authenticate incoming client calls | `super-secret-key-123` |

---

## 3. Supabase Edge Functions Secrets

Keys configured inside the Supabase cloud dashboard or link terminal.

| Variable | Required | Description | Example |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | API key to access Google Gemini LLM | `AIzaSyCsD4...` |
