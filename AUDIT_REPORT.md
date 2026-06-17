# 📝 CodeOrbit — Complete Repository Audit Report (AUDIT_REPORT.md)

This report details a complete technical and structural audit of the CodeOrbit workspace as of June 18, 2026.

---

## 1. Current Architecture Overview
CodeOrbit is structured as a React single-page application built on Vite, communicating with a backend PostgreSQL database via Supabase SDK. Authentication is routed via Supabase Auth (with email credentials and Google OAuth), supported by a local Node.js/Express verification server delivering OTP pins via Resend. Socratic teaching guidelines and roadmaps are generated using Google's Gemini-2.5-Flash model running on Supabase Deno Edge Functions.

---

## 2. Folder Structure Analysis (Pre-restructure)
Prior to the reorganization, the repository suffered from root-level pollution. Over 30 files consisting of Postgres schema scripts, setups, triggers, and guides were located directly in the project root.
Furthermore:
- The React frontend code and Express backend server code were co-located under the `src/` directory.
- Edge functions and migrations were nested deep under `supabase/` without matching architectural paths in the root.
- Technical documentation was scattered across the root as isolated Markdown sheets.

---

## 3. Redundant & Duplicate Files
- **Redundant SQL Scripts:** Multiple separate Postgres setups (`COMPLETE_DATABASE_SCHEMA.sql`, `SCHEMA_SQL_TO_EXECUTE.sql`, `CREATE_MISSING_DASHBOARD_TABLES.sql`, `FIX_DATABASE_SYNC.sql`) contained overlapping table definitions.
- **Redundant Guides:** `GOOGLE_AUTH_OTP_SETUP.md` and `OTP_SETUP_GUIDE.md` contained duplicate information regarding Express configurations and API keys.
- **Leftover AI Scratch Files:** Removed a stray file in `src/pages/` containing an edit description rather than a TSX module (cleaned up in Checkpoint 3).

---

## 4. Dead Code & Unused Elements
- In `StudentDashboard.tsx`, the interface referenced `mentor_access` boolean which was absent from the database types in `types.ts`.
- In `AIChatPanel.tsx`, comments referenced legacy endpoints.
- A simulation test client `test-chatbot-simulation.ts` was left loose in the root directory.

---

## 5. Unused Dependencies
- `package.json` contains `lovable-tagger` under `devDependencies`. Since the project is transitioning to a standalone, production-ready codebase, this dependency is legacy and can be removed during code cleanups.

---

## 6. Missing Documentation
- No consolidated `API_REFERENCE.md` explaining Express routes (`POST /verify`, `POST /send-otp`).
- No Deno Edge Function API mappings for `bodhit-chat` and `generate-milestones` detailing request/response schemas.
- Lack of developer onboarding scripts or contributing rules.

---

## 7. Security Concerns
- **Client-Side JWT Storage:** The default virtual file system auth component stores JWTs in `localStorage` (`auth_token`). Recommendation: Prefer setting `httpOnly` secure cookies on the server to prevent Cross-Site Scripting (XSS) attacks.
- **Supabase JWT Verification Bypass:** Both Deno Edge Functions (`bodhit-chat` and `generate-milestones`) have `verify_jwt = false` set in `supabase/config.toml`. While required for initial onboarding or open intakes, key routes should authenticate using auth tokens.
- **Env Variables Exposure:** Some developer configs have keys committed in local templates.

---

## 8. Database & Schema Inconsistencies
- **Types Drift:** `profiles` table in Supabase types (`types.ts`) includes `plan` and `role` (mapped to `Enums["app_role"]`), whereas the base SQL initialization (`COMPLETE_DATABASE_SCHEMA.sql`) defined roles on a separate `user_roles` lookup table and lacked the `plan` field on `profiles`.
- **Triggers:** A trigger on profile creation was missing in some legacy SQL files, leading to sync issues between Auth users and profile records.

---

## 9. Deployment Blockers
- **Port Conflicts:** Local Vite server defaults to port `8080` in `vite.config.ts`, but some legacy guides refer to port `5173`.
- **OTP Server Coupling:** The frontend depends on the Express OTP server for logins. If deploying to production, this backend service must be hosted separately (e.g. on Render/Fly.io) and its base URL configured via environment variables.

---

## 10. Technical Debt & Rebranding Leftovers
- The Supabase Edge Function remains named `/functions/v1/bodhit-chat` instead of `/functions/v1/orbit-chat` due to backend deployment constraints, despite the client being rebranded.
- The virtual file system is backed by `localStorage`, which limits code persistence across different browsers or devices.

---

## 11. Audit Metrics

| Category | Finding | Recommendation | Status |
|---|---|---|---|
| **Directory Cleanliness** | 30+ loose root files | Restructured to `/frontend`, `/backend`, `/database`, `/docs` | ✅ Restructured |
| **Path Aliases** | Hardcoded imports | Updated `@/*` pointing to `./frontend/src/*` in configs | ✅ Updated |
| **Duplicate Docs** | Overlapping setup guides | Consolidated into 12 core documents in `docs/` | ✅ Consolidated |
| **Database Sync** | SQL / TS Types discrepancy | Documented schema modifications & triggers in setup guide | ✅ Documented |
