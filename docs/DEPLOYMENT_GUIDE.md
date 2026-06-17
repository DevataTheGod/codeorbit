# 🚀 CodeOrbit — Deployment Guide

This document describes how to deploy the React frontend, Express OTP server, and Supabase database/Edge Functions of CodeOrbit to production.

---

## 1. Supabase Database & Migrations Deployment

1. **Initialize Supabase CLI:**
   Ensure you have the Supabase CLI installed and logged in.
   ```bash
   supabase login
   ```
2. **Link Project:**
   Link your local codebase to your live Supabase project reference:
   ```bash
   supabase link --project-ref <YOUR_PROJECT_REFERENCE_ID>
   ```
3. **Push Schema Migrations:**
   Apply database changes and RLS policies:
   ```bash
   supabase db push
   ```

---

## 2. Deploy Deno Edge Functions

Deploy the Socratic chat and milestone generator to Supabase:
```bash
supabase functions deploy bodhit-chat --project-ref <YOUR_PROJECT_REFERENCE_ID>
supabase functions deploy generate-milestones --project-ref <YOUR_PROJECT_REFERENCE_ID>
```

Set LLM API keys in Supabase Edge environment variables:
```bash
supabase secrets set GEMINI_API_KEY="AIzaSy..." --project-ref <YOUR_PROJECT_REFERENCE_ID>
```

---

## 3. Deploy Express OTP Server

The Express server (OTP Delivery Service) must be hosted on a cloud application runtime (such as Render, Heroku, or Fly.io).

1. **Set Environment Variables on Host:**
   - `PORT`: Define running port (e.g., `8787`).
   - `FRONTEND_ORIGIN`: URL of your deployed frontend (e.g., `https://codeorbit.app`).
   - `RESEND_API_KEY`: API key for email delivery.
   - `OTP_SERVER_API_KEY`: Shared secret header key to validate client requests.
2. **Build and Start Commands:**
   - Build: `npm run build`
   - Start: `node dist/backend/server.js` (or run it via tsx in Node containers).

---

## 4. Deploy React Frontend (Vite)

The frontend can be built and hosted on Vercel, Netlify, or AWS Amplify:

1. **Build Settings:**
   - Build Command: `npm run build`
   - Publish Directory: `dist`
2. **Environment Variables:**
   - `VITE_SUPABASE_URL`: Live URL of your Supabase instance.
   - `VITE_SUPABASE_ANON_KEY`: Supabase client anonymous token.
   - `VITE_OTP_SERVER_URL`: Live URL of your deployed Express server.
   - `VITE_OTP_SERVER_API_KEY`: Shared secret key matching the Express server.
