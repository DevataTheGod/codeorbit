# 🗄️ CodeOrbit — Database Architecture

CodeOrbit uses a Supabase-managed PostgreSQL database. Security and access scopes are controlled at the database level using Row-Level Security (RLS) policies.

---

## 1. Database Entity-Relationship Diagram (ERD)

```
  profiles (1:1) ── users (1:N) ── user_roles
     │              │
     │              └── project_submissions (1:N) ── milestones (1:N) ── tasks
     │                       │
     │                       ├─ mentor_reports
     │                       └─ help_requests
     │
     └─ conversations (1:N) ── messages
```

---

## 2. Table Definitions

### 1. `users` & `profiles`
- **`users`:** Core user table linked to Supabase authentication (`auth.users`).
  - Fields: `id` (UUID, PK), `email` (VARCHAR, Unique), `role` (VARCHAR), `created_at`, `updated_at`.
- **`profiles`:** Stores public profile information.
  - Fields: `id` (UUID, PK), `user_id` (UUID reference to `auth.users(id)`), `full_name` (TEXT), `email` (TEXT), `avatar_url` (TEXT), `role` (ENUM: `admin` | `mentor` | `student`), `plan` (VARCHAR: `'free'` | `'pro'`).

### 2. `user_roles`
- Mappings to control roles in PostgreSQL queries.
  - Fields: `id` (UUID, PK), `user_id` (UUID reference to `auth.users(id)`), `role` (ENUM `app_role`: `'student'`, `'mentor'`, `'admin'`).

### 3. `project_submissions`
- Tracks projects submitted by students.
  - Fields: `id` (UUID, PK), `user_id` (UUID reference to `auth.users(id)`), `project_title` (TEXT), `project_description` (TEXT), `tech_stack` (TEXT[]), `skill_assessment` (JSONB), `skill_score` (INTEGER), `deadline` (DATE), `status` (TEXT: `'draft'`, `'submitted'`, `'in-review'`, `'approved'`, `'rejected'`), `mentor_access` (BOOLEAN), `full_name` (TEXT), `email` (TEXT), `college` (TEXT), `year_of_study` (TEXT).

### 4. `milestones` & `tasks`
- **`milestones`:** Automated milestone roadmap steps.
  - Fields: `id` (UUID, PK), `submission_id` (UUID reference to `project_submissions(id)`), `title` (TEXT), `description` (TEXT), `status` (TEXT: `'pending'`, `'in_progress'`, `'completed'`, `'approved'`, `'rejected'`), `order_index` (INTEGER), `source` (TEXT: `'ai'` | `'mentor'` | `'student'`).
- **`tasks`:** Granular checklist steps.
  - Fields: `id` (UUID, PK), `milestone_id` (UUID reference to `milestones(id)`), `title` (TEXT), `description` (TEXT), `progress` (INTEGER), `status` (TEXT: `'pending'`, `'in_progress'`, `'completed'`), `order_index` (INTEGER).

### 5. `conversations` & `messages`
- **`conversations`:** Tracks Socratic learning sessions.
  - Fields: `id` (UUID, PK), `user_id` (UUID reference to `auth.users(id)`), `submission_id` (UUID reference to `project_submissions(id)`), `title` (TEXT), `project_idea` (TEXT), `tech_stack` (TEXT), `intake_confirmed` (BOOLEAN), `status` (VARCHAR).
- **`messages`:** Individual chat messages.
  - Fields: `id` (UUID, PK), `conversation_id` (UUID reference to `conversations(id)`), `role` (VARCHAR: `'user'`, `'assistant'`), `content` (TEXT), `message_type` (VARCHAR), `file_ops` (JSONB), `mentor_report` (JSONB).

### 6. `mentor_reports`
- AI-generated student progress evaluations.
  - Fields: `id` (UUID, PK), `submission_id` (UUID reference to `project_submissions(id)`), `conversation_id` (UUID reference to `conversations(id)`), `report` (JSONB), `status` (VARCHAR).

---

## 3. Row-Level Security (RLS) Policies

All tables have RLS enabled (`ALTER TABLE ENABLE ROW LEVEL SECURITY`). Policies define who can read, update, or insert data:
- **Student Policy:** Users can only select, insert, or update rows that match their own authenticated UID (`auth.uid()`).
  - Example (`project_submissions`): `user_id = auth.uid()`
- **Mentor Policy:** Mentors can view all profiles, submissions, milestones, tasks, conversations, and reports to facilitate review and grading. Checked via user role validation.
- **Admin Policy:** Admins bypass RLS filters for user roles and audit logs.

---

## 4. Database Functions & Triggers

### 1. Updated At Trigger
Automatically synchronizes the `updated_at` column to `CURRENT_TIMESTAMP` on updates.
- Function: `update_updated_at_column()`
- Bound to: `conversations`, `project_submissions`, `mentor_reports`, `milestones`.

### 2. User Role Security Helper
Determines if an authenticated user possesses administrative or mentorship roles before resolving policy checks:
- Function: `has_role(_role app_role, _user_id UUID) -> BOOLEAN`
- Definition: Returns true if the query on `user_roles` matches the target role.
