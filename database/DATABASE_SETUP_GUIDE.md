# 🗄️ CodeOrbit — Database Setup Guide

This guide walks you through setting up, migrations tracking, and deploying the PostgreSQL database for CodeOrbit.

---

## 1. Database Architecture & Schema Structure

The database resides in Supabase PostgreSQL, operating with strict constraints, indexes on lookup paths (e.g. `user_id`, `email`), and RLS security.

- **Primary Schema SQL:** [COMPLETE_DATABASE_SCHEMA.sql](file:///home/dev/Desktop/projects/Project-Skill/database/schema/COMPLETE_DATABASE_SCHEMA.sql)
- **Automatic User Sync Trigger:** [CREATE_USER_TRIGGER.sql](file:///home/dev/Desktop/projects/Project-Skill/database/setup/CREATE_USER_TRIGGER.sql)

---

## 2. Table Relationships

- **Profiles:** Extended user profiles referencing `auth.users(id) ON DELETE CASCADE`.
- **User Roles:** RBAC records matching profiles. Checked inside RLS policies using `has_role()`.
- **Submissions -> Milestones -> Tasks:** Cascade deletes are set: deleting a submission removes all generated milestones and their tasks.
- **Conversations -> Messages:** Chat logs. Deleting a conversation cascades to clear all contained messages.

---

## 3. Row-Level Security (RLS) Policy Declarations

RLS is enabled on all tables. Students can only select or mutate their own rows. Mentors and admins check user roles to inspect all rows.
For example, the student insert policy on `project_submissions`:
```sql
CREATE POLICY "Students can submit own projects" 
ON public.project_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

---

## 4. Functions & Triggers Setup

Triggers automate auditing and profile sync:
1. **`update_updated_at_column()`:** Automatically modifies `updated_at` timestamps on updates.
2. **`handle_new_user()`:** Triggered `AFTER INSERT ON auth.users`. Synchronizes auth details to public profiles:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. Migration Setup Process

### Local Database Setup (Supabase CLI)
1. Initialize local Supabase instance:
   ```bash
   supabase start
   ```
2. Apply migrations locally:
   ```bash
   supabase migration up
   ```

### Live Production Database Setup
1. Open the **SQL Editor** inside your Supabase project dashboard.
2. Open and copy the contents of [COMPLETE_DATABASE_SCHEMA.sql](file:///home/dev/Desktop/projects/Project-Skill/database/schema/COMPLETE_DATABASE_SCHEMA.sql).
3. Paste and click **Run** to generate the database schema and RLS policies.
4. Next, copy the contents of [CREATE_USER_TRIGGER.sql](file:///home/dev/Desktop/projects/Project-Skill/database/setup/CREATE_USER_TRIGGER.sql).
5. Paste and click **Run** to initialize the auto-profile synchronization trigger.
