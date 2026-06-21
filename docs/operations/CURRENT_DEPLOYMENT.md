# Current Deployment

What is deployed today.

**Last Updated**: 2026-06-20

---

## Overview

| Component | Hosting | Status |
|-----------|---------|--------|
| Frontend | Vercel/Netlify | Deployed |
| OTP Server | Render/Fly.io | Deployed |
| Database | Supabase | Deployed |
| Edge Functions | Supabase | Deployed |

---

## Frontend

| Setting | Value |
|---------|-------|
| Hosting | Vercel or Netlify |
| Framework | React 18 + Vite 5 |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Domain | TBD |
| SSL | Auto (hosting provider) |

**Environment Variables**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OTP_SERVER_URL`

---

## Backend (OTP Server)

| Setting | Value |
|---------|-------|
| Hosting | Render or Fly.io |
| Runtime | Node.js |
| Port | 8787 |
| Start Command | `npx tsx backend/server.ts` |

**Environment Variables**:
- `PORT` = 8787
- `FRONTEND_ORIGIN` = deployed frontend URL
- `RESEND_API_KEY`
- `OTP_FROM_EMAIL`

---

## Supabase

| Setting | Value |
|---------|-------|
| Project | TBD |
| Region | TBD |
| Database | PostgreSQL |
| Auth | Supabase Auth |
| Edge Functions | Deno runtime |

**Tables**: 11 tables with RLS enabled

**Edge Functions**:
- `orbit-chat` — Socratic AI chat
- `generate-milestones` — Roadmap generation

**Secrets**:
- `LOVABLE_API_KEY` — AI gateway authentication

---

## Database

| Setting | Value |
|---------|-------|
| Engine | PostgreSQL |
| Hosting | Supabase (managed) |
| Tables | 11 |
| RLS | Enabled |
| Backups | Supabase managed |
| Migrations | `database/migrations/` |

**Schema Source**: `database/schema/COMPLETE_DATABASE_SCHEMA.sql`

---

## AI

| Setting | Value |
|---------|-------|
| Provider | Gemini 2.5 Flash |
| Gateway | Lovable AI Gateway |
| Endpoint | `https://ai.gateway.lovable.dev/v1/chat/completions` |
| Secret | `LOVABLE_API_KEY` |

---

## Domain & SSL

| Setting | Value |
|---------|-------|
| Domain | TBD |
| SSL | Auto (hosting provider) |
| DNS | Managed at registrar |

---

## Monitoring

| Component | Monitoring |
|-----------|------------|
| Frontend | Vercel/Netlify analytics |
| OTP Server | Render/Fly.io logs |
| Database | Supabase dashboard |
| Edge Functions | Supabase logs |

---

## Current Limitations

| Limitation | Impact |
|------------|--------|
| No custom domain | Using hosting default |
| No CDN | Static assets served directly |
| No caching | Repeated queries |
| No real-time | Polling for updates |

---

*This is the source of truth for CodeOrbit's current deployment state.*
