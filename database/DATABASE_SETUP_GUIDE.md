# 🗄️ CodeOrbit — Database Setup Guide

This guide covers provisioning and initializing the Supabase PostgreSQL database for CodeOrbit.

---

## 1. Initial Setup (Fresh Database)

1. Open your [Supabase Project Dashboard](https://app.supabase.com) → **SQL Editor**.
2. Paste and execute `database/schema/COMPLETE_DATABASE_SCHEMA.sql`.
3. Paste and execute `database/setup/CREATE_USER_TRIGGER.sql`.

**Tables created:**
- `profiles`, `user_roles` — auth & role data
- `project_submissions`, `milestones`, `tasks` — student roadmaps
- `conversations`, `messages` — Orbit AI chat history
- `mentor_reports`, `mentor_reviews` — AI evaluation summaries
- `help_requests` — student flagging system

---

## 2. Applying Migrations

Migrations in `database/migrations/` are numbered chronologically. To apply them via CLI:

```bash
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push
```

Or paste individual migration files manually in the SQL Editor.

---

## 3. Troubleshooting

| Problem | Fix |
|---|---|
| Table already exists | Use `DROP TABLE IF EXISTS ... CASCADE;` before re-running |
| Profiles not created on signup | Re-run `database/setup/CREATE_USER_TRIGGER.sql` |
| RLS blocking queries | Ensure policies in schema are applied; check Supabase Dashboard → Auth → Policies |

---

## 4. Setup Scripts Reference

| File | Purpose |
|---|---|
| `schema/COMPLETE_DATABASE_SCHEMA.sql` | Full schema — all tables, indexes, RLS |
| `setup/CREATE_USER_TRIGGER.sql` | Syncs `auth.users` → `public.profiles` on signup |
| `setup/CREATE_MISSING_DASHBOARD_TABLES.sql` | Adds any tables missing from older installs |
| `setup/FIX_DATABASE_SYNC.sql` | Patches profile sync issues for existing users |
