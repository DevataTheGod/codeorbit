# 📋 CodeOrbit — Production Deployment Checklist

Use this checklist to verify that all deployment steps are complete before promoting the CodeOrbit platform to production.

---

## 1. Environment Variables & Secrets Verification

### Frontend Client Host (e.g. Vercel / Netlify)
- [ ] Set `VITE_SUPABASE_URL` to your live Supabase project endpoint.
- [ ] Set `VITE_SUPABASE_ANON_KEY` to the public anonymous client token.
- [ ] Set `VITE_OTP_SERVER_URL` to your hosted Express OTP backend URL.
- [ ] Set `VITE_OTP_SERVER_API_KEY` matching the Express server secret.

### Backend Express Server Host (e.g. Render / Fly.io)
- [ ] Set `PORT` (e.g. `8787`).
- [ ] Set `FRONTEND_ORIGIN` to the URL of the deployed client dashboard.
- [ ] Set `RESEND_API_KEY` to your live production Resend API token.
- [ ] Set `OTP_SERVER_API_KEY` matching the client credentials header token.

### Supabase Edge Functions Secrets
- [ ] Run secret config commands:
  ```bash
  supabase secrets set GEMINI_API_KEY="<YOUR_LIVE_GEMINI_API_KEY>"
  ```

---

## 2. Database & Storage Provisioning

- [ ] Execute [COMPLETE_DATABASE_SCHEMA.sql](file:///home/dev/Desktop/projects/Project-Skill/database/schema/COMPLETE_DATABASE_SCHEMA.sql) in your live Supabase database editor.
- [ ] Execute [CREATE_USER_TRIGGER.sql](file:///home/dev/Desktop/projects/Project-Skill/database/setup/CREATE_USER_TRIGGER.sql) to set up profile creations.
- [ ] Confirm Row-Level Security (RLS) is enabled across all tables.

---

## 3. Build & Deployment Executions

- [ ] Run `npm run build` locally to confirm all TypeScript files compile successfully.
- [ ] Push changes to triggers or deploy via webhooks to your hosting providers.
- [ ] Deploy Edge functions using Supabase CLI:
  ```bash
  supabase functions deploy bodhit-chat
  supabase functions deploy generate-milestones
  ```

---

## 4. Domain, SSL & Monitoring

- [ ] Point custom domain DNS configurations to your hosts (Vite Client and Express backend).
- [ ] Confirm SSL certificates are issued and active (HTTPS enabled for all connections).
- [ ] Verify Supabase edge functions logs contain no execution exceptions.
- [ ] Set up database backup schedules (standard daily snapshots) inside the Supabase control panel.
