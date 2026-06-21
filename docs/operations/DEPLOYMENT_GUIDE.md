# Deployment Guide

How to deploy from scratch.

---

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp config/.env.example .env
# Fill in values

# Run frontend (port 8080)
npm run dev

# Run OTP server (port 8787) - separate terminal
npm run otp-server
```

---

## Frontend Deploy (Vercel/Netlify)

```bash
# Build
npm run build

# Output: dist/
```

**Settings**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Node Version: 18+

**Environment Variables**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OTP_SERVER_URL`

---

## Supabase Deploy

```bash
# Login
supabase login

# Link project
supabase link --project-ref <YOUR_PROJECT_REF>

# Push database migrations
supabase db push

# Deploy edge functions
supabase functions deploy orbit-chat --project-ref <YOUR_PROJECT_REF>
supabase functions deploy generate-milestones --project-ref <YOUR_PROJECT_REF>

# Set secrets
supabase secrets set LOVABLE_API_KEY="<YOUR_KEY>" --project-ref <YOUR_PROJECT_REF>
```

**Fresh Database**:
Run `database/UNIFIED_DATABASE_SETUP.sql` in Supabase SQL Editor.

---

## OTP Server Deploy (Render/Fly.io)

**Environment Variables**:
- `PORT` = 8787
- `FRONTEND_ORIGIN` = deployed frontend URL
- `RESEND_API_KEY`
- `OTP_FROM_EMAIL`

**Start Command**:
```bash
npx tsx backend/server.ts
```

---

## Production Verification

### Auth
- [ ] Google OAuth login works
- [ ] OTP email login works
- [ ] Logout works

### Orbit
- [ ] Chat panel loads
- [ ] Orbit responds to questions
- [ ] Socratic method enforced (no code generation)

### Milestones
- [ ] Submit project form works
- [ ] Milestones generate
- [ ] Roadmap displays

### IDE
- [ ] Editor loads
- [ ] File explorer works
- [ ] Files save to localStorage

### Dashboard
- [ ] Student dashboard loads
- [ ] Mentor dashboard loads
- [ ] Admin dashboard loads (if applicable)

---

*This is the source of truth for CodeOrbit deployment procedures.*
