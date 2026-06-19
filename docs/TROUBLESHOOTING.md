# 🔧 CodeOrbit — Troubleshooting Guide

Review this guide to resolve common developmental or architectural issues when working on CodeOrbit.

---

## 1. Local Build & Path Compilation Failures

### Issue: Vite fails to find package or source file (e.g. `Cannot find module '@/...'`)
- **Cause:** Restructured directories may not be updated in your editor config or package managers.
- **Solution:**
  1. Confirm your `tsconfig.json` and `tsconfig.app.json` reference the new path mappings: `"@/*": ["./frontend/src/*"]`.
  2. Verify that `vite.config.ts` sets `root: "frontend"` and resolving aliases points to `./frontend/src`.
  3. Reset build caches: `rm -rf node_modules/.vite` and run `npm run dev` again.

---

## 2. Authentication & OTP Delivery Failures

### Issue: Logins fail or OTP emails are not received
- **Cause:** Express server (OTP service) is down or API keys are misconfigured.
- **Solution:**
  1. Ensure `npm run otp-server` is running in your terminal on port `8787`.
  2. Check that the `VITE_OTP_SERVER_API_KEY` matches the `OTP_SERVER_API_KEY` defined in the server's `.env` environment file.
  3. Confirm the `RESEND_API_KEY` in the server's `.env` file is valid and active.

---

## 3. Database Sync & Profile Creation Failures

### Issue: New users sign up but cannot load StudentDashboard (roles/profiles missing)
- **Cause:** The PostgreSQL trigger that duplicates `auth.users` into `public.profiles` failed or is missing.
- **Solution:**
  1. Run the [CREATE_USER_TRIGGER.sql](file:///home/dev/Desktop/projects/codeorbit/database/setup/CREATE_USER_TRIGGER.sql) script inside your Supabase SQL editor to reinstate the profile sync trigger.
  2. Ensure RLS is enabled and policies allow public selects on profiles.
