# 🚀 CodeOrbit — Deployment Guide

Deploy the React frontend, Express OTP server, and Supabase backend/Edge Functions to production.

---

## 1. Supabase Database

```bash
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push
```

> Run `database/UNIFIED_DATABASE_SETUP.sql` in the Supabase SQL Editor if deploying fresh to create all tables, enums, triggers, and column schemas in one step.

---

## 2. Edge Functions

```bash
supabase functions deploy bodhit-chat --project-ref <YOUR_PROJECT_REF>
supabase functions deploy generate-milestones --project-ref <YOUR_PROJECT_REF>
supabase secrets set GEMINI_API_KEY="<YOUR_KEY>" --project-ref <YOUR_PROJECT_REF>
```

---

## 3. Express OTP Server

Host on Render, Fly.io, or similar. Set these environment variables on the host:

| Variable | Description |
|---|---|
| `PORT` | Server port (default `8787`) |
| `FRONTEND_ORIGIN` | Your deployed frontend URL |
| `RESEND_API_KEY` | Resend transactional email key |
| `OTP_SERVER_API_KEY` | Shared secret for client auth |

Start command: `npx tsx backend/server.ts`

---

## 4. React Frontend (Vite)

Host on Vercel, Netlify, or AWS Amplify.

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:** See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
