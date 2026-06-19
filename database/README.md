# 🗄️ CodeOrbit — Database Files & Setup SQL Mappings

This index details the purpose of all SQL files located in the `database/` directory of the repository.

---

## 1. Schema Files (`database/schema/`)

- **[COMPLETE_DATABASE_SCHEMA.sql](file:///home/dev/Desktop/projects/codeorbit/database/schema/COMPLETE_DATABASE_SCHEMA.sql):**
  - *Purpose:* Recreates the entire, final production database structure.
  - *Details:* Initializes core tables (`users`, `profiles`, `user_roles`, `project_submissions`, `milestones`, `tasks`, `help_requests`, `conversations`, `messages`, `mentor_reports`, `progress_entries`, `audit_log`), configures primary and foreign key constraints, creates lookup indexes, and activates Row-Level Security (RLS) policies.
- **[SCHEMA_SQL_TO_EXECUTE.sql](file:///home/dev/Desktop/projects/codeorbit/database/schema/SCHEMA_SQL_TO_EXECUTE.sql):**
  - *Purpose:* Batch script containing schema definitions and helper functions for seed provisioning.

---

## 2. Setup Scripts (`database/setup/`)

- **[CREATE_USER_TRIGGER.sql](file:///home/dev/Desktop/projects/codeorbit/database/setup/CREATE_USER_TRIGGER.sql):**
  - *Purpose:* Creates the automated PostgreSQL trigger function `public.handle_new_user()`.
  - *Details:* Automatically inserts a public profile record into `public.profiles` and sets user role permissions to `'student'` whenever a new account is signed up in Supabase Auth (`auth.users`).
- **[FIX_DATABASE_SYNC.sql](file:///home/dev/Desktop/projects/codeorbit/database/setup/FIX_DATABASE_SYNC.sql):**
  - *Purpose:* Fixes synchronization drift between tables and validates trigger functions.
- **[CREATE_MISSING_DASHBOARD_TABLES.sql](file:///home/dev/Desktop/projects/codeorbit/database/setup/CREATE_MISSING_DASHBOARD_TABLES.sql):**
  - *Purpose:* Installs supplemental metrics tables used to track student dashboard progress logs.
- **[CREATE_MISSING_HELP_REQUESTS_TABLE.sql](file:///home/dev/Desktop/projects/codeorbit/database/setup/CREATE_MISSING_HELP_REQUESTS_TABLE.sql):**
  - *Purpose:* Creates the student support messaging system table (`help_requests`).
- **[CREATE_OLD_CHAT_MESSAGES_TABLE.sql](file:///home/dev/Desktop/projects/codeorbit/database/setup/CREATE_OLD_CHAT_MESSAGES_TABLE.sql):**
  - *Purpose:* Installs legacy logs tables used for audit archiving.

---

## 3. Unified Setup Script (`database/`)

- **[UNIFIED_DATABASE_SETUP.sql](file:///home/dev/Desktop/projects/codeorbit/database/UNIFIED_DATABASE_SETUP.sql):**
  - *Purpose:* Combines all 12 chronological database migrations and fixes into a single, copy-pasteable script for setting up the Supabase PostgreSQL database.
