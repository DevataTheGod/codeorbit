# Table Mapping: Old Schema → New Schema

## Overview
Your old Supabase database has 8 tables. The new schema also has 8 tables but with different structures. This guide shows how to map data from old tables to new tables.

---

## Table Mapping

### 1. **profiles** → **users**
| Old Column | New Column | Notes |
|-----------|-----------|-------|
| id | id | UUID primary key |
| email | email | Email address |
| full_name | full_name | Full name |
| avatar_url | avatar_url | Profile picture URL |
| role | - | MOVED: Now in `user_roles` table |
| created_at | created_at | Timestamp |
| - | updated_at | NEW: Use current timestamp |

**Migration Query:**
```sql
INSERT INTO public.users (id, email, full_name, avatar_url, created_at, updated_at)
SELECT id, email, full_name, avatar_url, created_at, NOW()
FROM old_schema.profiles;
```

---

### 2. **user_roles** → **user_roles** (Structure Changed)
| Old Column | New Column | Notes |
|-----------|-----------|-------|
| id | id | UUID primary key |
| user_id | user_id | User reference |
| role | role | 'student', 'mentor', 'admin' |
| assigned_at | assigned_at | Timestamp |
| - | assigned_by | NEW: Admin who assigned role |

**Note:** If your old `user_roles` table has different structure, we may need custom migration logic.

---

### 3. **project_submissions** → **project_submissions** (Same)
| Old Column | New Column | Notes |
|-----------|-----------|-------|
| id | id | UUID primary key |
| user_id | user_id | Student who submitted |
| title | title | Project title |
| description | description | Project description |
| tech_stack | tech_stack | Technologies used |
| status | status | 'draft', 'submitted', 'in-review', 'approved', 'rejected' |
| submission_date | submission_date | When submitted |
| created_at | created_at | Created timestamp |
| updated_at | updated_at | Updated timestamp |

**Migration Query:**
```sql
INSERT INTO public.project_submissions (id, user_id, title, description, tech_stack, status, submission_date, created_at, updated_at)
SELECT id, user_id, title, description, tech_stack, status, submission_date, created_at, updated_at
FROM old_schema.project_submissions;
```

---

### 4. **chat_messages** → **messages**
| Old Column | New Column | Notes |
|-----------|-----------|-------|
| id | id | UUID primary key |
| conversation_id | conversation_id | Link to conversation |
| sender_id | - | REMOVED: Derived from conversation.user_id + role |
| role | role | 'user' or 'assistant' |
| content | content | Message text |
| - | message_type | NEW: 'explanation', 'hint', 'question', 'warning' |
| - | file_ops | NEW: JSONB for file operations |
| - | mentor_report | NEW: JSONB for mentor reports |
| tokens_used | tokens_used | Token count for AI calls |
| created_at | created_at | Timestamp |

**Note:** You'll need `conversations` table first (see below).

---

### 5. **NEW: conversations** (No Old Equivalent)
This is a new table grouping chat messages by project/submission.

| Column | Notes |
|--------|-------|
| id | UUID primary key |
| user_id | Student who started conversation |
| submission_id | Project submission being discussed |
| title | Conversation title |
| project_idea | User's project idea |
| tech_stack | Technologies for project |
| skill_level | User's skill level |
| timeline | Expected timeline |
| intake_confirmed | Whether intake form was completed |
| status | 'active', 'archived', 'deleted' |
| created_at | Timestamp |
| updated_at | Timestamp |
| last_message_at | When last message was sent |

**Creation Logic:**
You'll need to group `chat_messages` by conversation. If your old schema doesn't have conversation grouping, we can:
- Create one conversation per user per project_submission
- Or group messages by submission_id

---

### 6. **tasks** → **progress_entries**
| Old Column | New Column | Notes |
|-----------|-----------|-------|
| id | id | UUID primary key |
| user_id | user_id | Student who created task |
| submission_id | submission_id | Related project |
| - | conversation_id | NEW: Optional, link to chat |
| title | title | Task title |
| description | description | Task description |
| - | milestone_number | NEW: Milestone sequence number |
| status | status | 'planned', 'in-progress', 'completed', 'blocked' |
| - | files_snapshot | NEW: JSONB for file snapshots |
| - | meta | NEW: JSONB for metadata |
| created_at | created_at | Timestamp |
| updated_at | updated_at | Timestamp |

**Migration Query:**
```sql
INSERT INTO public.progress_entries (id, user_id, submission_id, title, description, status, created_at, updated_at)
SELECT id, user_id, submission_id, title, description, status, created_at, updated_at
FROM old_schema.tasks;
```

---

### 7. **mentor_reviews** → **mentor_reports**
| Old Column | New Column | Notes |
|-----------|-----------|-------|
| id | id | UUID primary key |
| submission_id | submission_id | Project being reviewed |
| - | conversation_id | NEW: Optional, link to chat |
| review | report | Feedback as JSONB |
| reviewer_notes | mentor_notes | Mentor's additional notes |
| - | raw_text | NEW: Raw review text |
| status | status | 'generated', 'reviewed', 'acted-upon' |
| created_at | created_at | Timestamp |
| updated_at | updated_at | Timestamp |

**Migration Query:**
```sql
INSERT INTO public.mentor_reports (id, submission_id, report, mentor_notes, raw_text, status, created_at, updated_at)
SELECT id, submission_id, 
       '{"review": "' || review || '"}'::jsonb, 
       reviewer_notes, 
       review, 
       status, 
       created_at, 
       updated_at
FROM old_schema.mentor_reviews;
```

---

### 8. **milestones** → **progress_entries** (Consolidated)
| Old Column | New Column | Notes |
|-----------|-----------|-------|
| id | id | UUID primary key |
| user_id | user_id | Student |
| submission_id | submission_id | Project |
| - | conversation_id | NEW: Optional |
| title | title | Milestone name |
| description | description | Milestone details |
| sequence | milestone_number | Sequential order |
| status | status | Progress status |
| - | files_snapshot | NEW: Code snapshots |
| created_at | created_at | Timestamp |
| updated_at | updated_at | Timestamp |

**Note:** `milestones` and `tasks` both map to `progress_entries`. We'll merge them during migration.

---

## NEW TABLE: audit_log
This table is new and tracks all database changes:

| Column | Notes |
|--------|-------|
| id | UUID primary key |
| user_id | User who made change |
| action | Type of action ('CREATE', 'UPDATE', 'DELETE') |
| table_name | Which table was changed |
| record_id | Which record was changed |
| old_values | Previous values (JSONB) |
| new_values | New values (JSONB) |
| ip_address | IP address of user |
| user_agent | Browser/client info |
| created_at | When change occurred |

**Note:** No data to migrate from old schema.

---

## Migration Steps

### Step 1: Create New Supabase Project
✅ Already done - Project ID: `bszuklqqocfntoeszjdq`

### Step 2: Execute Schema SQL
Run `SCHEMA_SQL_TO_EXECUTE.sql` in Supabase SQL Editor

### Step 3: Migrate Users & Roles
```sql
-- Insert users first
INSERT INTO public.users (id, email, full_name, avatar_url, created_at, updated_at)
SELECT id, email, full_name, avatar_url, created_at, NOW()
FROM old_schema.profiles
ON CONFLICT (id) DO NOTHING;

-- Insert user roles
INSERT INTO public.user_roles (id, user_id, role, assigned_at, assigned_by)
SELECT id, user_id, role, assigned_at, NULL
FROM old_schema.user_roles
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 4: Migrate Projects
```sql
INSERT INTO public.project_submissions 
SELECT * FROM old_schema.project_submissions
ON CONFLICT (id) DO NOTHING;
```

### Step 5: Create Conversations from Chat Messages
```sql
-- Group chat messages by submission
INSERT INTO public.conversations (id, user_id, submission_id, title, status, created_at, updated_at, last_message_at)
SELECT 
  gen_random_uuid(),
  user_id,
  submission_id,
  'Conversation for Project: ' || (SELECT title FROM old_schema.project_submissions ps WHERE ps.id = psubm.submission_id LIMIT 1),
  'active',
  NOW(),
  NOW(),
  NOW()
FROM (
  SELECT DISTINCT user_id, submission_id FROM old_schema.chat_messages
) AS psubm;
```

### Step 6: Migrate Messages
Requires mapping to new conversation IDs - **NEEDS CUSTOM LOGIC**

### Step 7: Migrate Tasks & Milestones to Progress Entries
```sql
-- Migrate tasks
INSERT INTO public.progress_entries (id, user_id, submission_id, title, description, milestone_number, status, created_at, updated_at)
SELECT id, user_id, submission_id, title, description, 0, status, created_at, updated_at
FROM old_schema.tasks
ON CONFLICT (id) DO NOTHING;

-- Migrate milestones
INSERT INTO public.progress_entries (id, user_id, submission_id, title, description, milestone_number, status, created_at, updated_at)
SELECT id, user_id, submission_id, title, description, sequence, status, created_at, updated_at
FROM old_schema.milestones
ON CONFLICT (id) DO NOTHING;
```

### Step 8: Migrate Mentor Reviews
```sql
INSERT INTO public.mentor_reports (id, submission_id, report, mentor_notes, status, created_at, updated_at)
SELECT 
  id, 
  submission_id, 
  ('{"review": "' || review || '"}')::jsonb, 
  reviewer_notes, 
  status, 
  created_at, 
  updated_at
FROM old_schema.mentor_reviews
ON CONFLICT (id) DO NOTHING;
```

---

## Important Notes

1. **Conversation Grouping**: Your old schema has `chat_messages` without explicit conversation grouping. You'll need to decide:
   - Group by `submission_id` and `user_id`?
   - Or do you have another way to group messages?

2. **Foreign Key Constraints**: Ensure all referenced IDs exist in parent tables before inserting.

3. **RLS Policies**: New schema has RLS enabled. Make sure policies allow your migration user to insert data.

4. **Data Validation**: After migration, run checks to ensure:
   - No orphaned foreign keys
   - All user IDs are valid
   - No duplicate entries
   - Timestamps are reasonable

5. **Backup Old Data**: Before running migration, export your old database as CSV for backup.

---

## Questions for You

To refine the migration, please answer:

1. **Does your `chat_messages` table have a `submission_id` or `project_id` field?** This determines how we group conversations.
2. **Does your `user_roles` table have an `assigned_by` field?** Or should we set it to NULL?
3. **Do you want to keep all old data, or only certain records?** (e.g., only active projects)
4. **Are there any custom fields in old tables not listed here?**

Once you clarify these, I can create exact migration SQL queries for your data.
