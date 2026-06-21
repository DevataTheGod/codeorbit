# Environment Variables

Single source of truth for secrets and config.

---

## Frontend (Vite)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Yes | Supabase project endpoint | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | `eyJhbGciOiJIUzI1Ni...` |
| `VITE_OTP_SERVER_URL` | Yes | OTP server URL | `http://localhost:8787` |
| `VITE_OTP_SERVER_API_KEY` | No | Shared secret for OTP auth | `super-secret-123` |

**Location**: `.env` (root)

**Template**: `config/.env.example`

---

## Backend (OTP Server)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port (default: 8787) | `8787` |
| `FRONTEND_ORIGIN` | Yes | CORS allowed origin | `http://localhost:8080` |
| `RESEND_API_KEY` | Yes | Resend email API key | `re_123456789...` |
| `OTP_FROM_EMAIL` | Yes | Sender email address | `onboarding@resend.dev` |
| `OTP_SERVER_API_KEY` | No | Client auth key | `super-secret-123` |

**Location**: Hosting environment (Render/Fly.io)

---

## Supabase Edge Functions

| Variable | Required | Description |
|----------|----------|-------------|
| `LOVABLE_API_KEY` | Yes | AI gateway authentication |

**Set via CLI**:
```bash
supabase secrets set LOVABLE_API_KEY="<YOUR_KEY>" --project-ref <YOUR_PROJECT_REF>
```

**NOT in .env** — set via Supabase CLI only.

---

## Where to Find Values

| Variable | Source |
|----------|--------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `RESEND_API_KEY` | Resend Dashboard → API Keys |
| `LOVABLE_API_KEY` | Lovable AI Gateway dashboard |

---

## Security Rules

1. **Never commit .env** — Use .gitignore
2. **Never log secrets** — Redact in logs
3. **Rotate regularly** — Change keys quarterly
4. **Use secrets manager** — In production

---

*This is the source of truth for CodeOrbit environment configuration.*
