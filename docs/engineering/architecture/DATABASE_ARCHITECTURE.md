# Database Architecture

PostgreSQL database with Row-Level Security on Supabase.

---

## Tables

### 1. users

Authentication base table.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, references auth.uid() |
| email | VARCHAR(255) | Unique, not null |
| full_name | VARCHAR(255) | |
| avatar_url | TEXT | |
| role | VARCHAR(50) | Default: 'student' |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**RLS**: Users can view/update own profile only.

---

### 2. profiles

Extended user profile details.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, references users(id) |
| username | VARCHAR(255) | Unique |
| bio | TEXT | |
| website | TEXT | |
| github_url | TEXT | |
| linkedin_url | TEXT | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**RLS**: Users view all profiles, update own only.

---

### 3. user_roles

Role assignments (student, mentor, admin).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | References users(id) |
| role | VARCHAR(50) | 'student', 'mentor', 'admin' |
| assigned_at | TIMESTAMP | |
| assigned_by | UUID | References users(id) |

**RLS**: Admins/mentors view all roles.

---

### 4. project_submissions

Student project submissions.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | References users(id) |
| title | VARCHAR(255) | Not null |
| description | TEXT | |
| tech_stack | TEXT | |
| status | VARCHAR(50) | 'draft', 'submitted', 'in-review', 'approved', 'rejected' |
| submission_date | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**RLS**: Users view/modify own submissions. Mentors view all.

---

### 5. milestones

Project deliverables within submissions.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| submission_id | UUID | References project_submissions(id) |
| title | VARCHAR(255) | Not null |
| description | TEXT | |
| status | VARCHAR(50) | 'pending', 'in-progress', 'completed', 'blocked' |
| due_date | TIMESTAMP | |
| order_index | INT | Default: 0 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**RLS**: Users view own submission milestones. Mentors view all.

---

### 6. help_requests

Student support/flagging system.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| student_id | UUID | References users(id) |
| submission_id | UUID | References project_submissions(id) |
| title | VARCHAR(255) | Not null |
| description | TEXT | Not null |
| status | VARCHAR(50) | 'open', 'in-progress', 'resolved', 'closed' |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**RLS**: Users view/insert own requests. Mentors view/update all.

---

### 7. conversations

Chat sessions with Orbit AI.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | References users(id) |
| submission_id | UUID | References project_submissions(id), nullable |
| title | TEXT | Default: 'Untitled Conversation' |
| project_idea | TEXT | |
| tech_stack | TEXT | |
| skill_level | VARCHAR(50) | |
| timeline | TEXT | |
| intake_confirmed | BOOLEAN | Default: false |
| status | VARCHAR(50) | 'active', 'archived', 'deleted' |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| last_message_at | TIMESTAMP | |

**RLS**: Users view/insert/update own conversations. Mentors view all.

---

### 8. messages

Individual chat messages.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| conversation_id | UUID | References conversations(id) |
| role | VARCHAR(50) | 'user', 'assistant' |
| content | TEXT | Not null |
| message_type | VARCHAR(50) | 'explanation', 'hint', 'question', 'warning' |
| file_ops | JSONB | |
| mentor_report | JSONB | |
| tokens_used | INT | |
| created_at | TIMESTAMP | |

**RLS**: Users view/insert messages in own conversations. Mentors view all.

---

### 9. mentor_reports

AI-generated mentor feedback.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| submission_id | UUID | References project_submissions(id) |
| conversation_id | UUID | References conversations(id), nullable |
| report | JSONB | Not null |
| raw_text | TEXT | |
| mentor_notes | TEXT | |
| status | VARCHAR(50) | 'generated', 'reviewed', 'acted-upon' |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**RLS**: Users view reports for own submissions. Mentors view all.

---

### 10. progress_entries

Milestone and progress tracking.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | References users(id) |
| submission_id | UUID | References project_submissions(id), nullable |
| conversation_id | UUID | References conversations(id), nullable |
| title | VARCHAR(255) | Not null |
| description | TEXT | |
| milestone_number | INT | |
| status | VARCHAR(50) | 'planned', 'in-progress', 'completed', 'blocked' |
| files_snapshot | JSONB | |
| meta | JSONB | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**RLS**: Users view/insert/update own progress. Mentors view all.

---

### 11. audit_log

Security audit trail.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | References users(id) |
| action | VARCHAR(255) | Not null |
| table_name | VARCHAR(255) | |
| record_id | UUID | |
| old_values | JSONB | |
| new_values | JSONB | |
| ip_address | INET | |
| user_agent | TEXT | |
| created_at | TIMESTAMP | |

**RLS**: Admins view audit log only.

---

## Relationships

```
users ──┬── profiles (1:1)
        ├── user_roles (1:N)
        ├── project_submissions (1:N)
        ├── conversations (1:N)
        ├── progress_entries (1:N)
        └── audit_log (1:N)

project_submissions ──┬── milestones (1:N)
                      ├── help_requests (1:N)
                      ├── conversations (1:N)
                      ├── mentor_reports (1:N)
                      └── progress_entries (1:N)

conversations ──┬── messages (1:N)
                ├── mentor_reports (1:N)
                └── progress_entries (1:N)
```

---

## Indexes

| Table | Index | Column |
|-------|-------|--------|
| users | idx_users_email | email |
| user_roles | idx_user_roles_user_id | user_id |
| user_roles | idx_user_roles_role | role |
| project_submissions | idx_project_submissions_user_id | user_id |
| project_submissions | idx_project_submissions_status | status |
| project_submissions | idx_project_submissions_created_at | created_at DESC |
| milestones | idx_milestones_submission_id | submission_id |
| help_requests | idx_help_requests_student_id | student_id |
| help_requests | idx_help_requests_submission_id | submission_id |
| help_requests | idx_help_requests_status | status |
| conversations | idx_conversations_user_id | user_id |
| conversations | idx_conversations_submission_id | submission_id |
| conversations | idx_conversations_updated_at | updated_at DESC |
| conversations | idx_conversations_status | status |
| messages | idx_messages_conversation_id | conversation_id |
| messages | idx_messages_role | role |
| messages | idx_messages_created_at | created_at ASC |
| mentor_reports | idx_mentor_reports_submission_id | submission_id |
| mentor_reports | idx_mentor_reports_conversation_id | conversation_id |
| mentor_reports | idx_mentor_reports_created_at | created_at DESC |
| progress_entries | idx_progress_entries_user_id | user_id |
| progress_entries | idx_progress_entries_submission_id | submission_id |
| progress_entries | idx_progress_entries_conversation_id | conversation_id |
| progress_entries | idx_progress_entries_status | status |
| progress_entries | idx_progress_entries_created_at | created_at DESC |
| audit_log | idx_audit_log_user_id | user_id |
| audit_log | idx_audit_log_created_at | created_at DESC |
| audit_log | idx_audit_log_action | action |

---

## Triggers

| Table | Trigger | Function |
|-------|---------|----------|
| conversations | conversations_updated_at | update_updated_at_column() |
| project_submissions | project_submissions_updated_at | update_updated_at_column() |
| mentor_reports | mentor_reports_updated_at | update_updated_at_column() |
| progress_entries | progress_entries_updated_at | update_updated_at_column() |
| milestones | milestones_updated_at | update_updated_at_column() |

---

## Schema Source

**Full Schema**: `database/schema/COMPLETE_DATABASE_SCHEMA.sql`

**Migrations**: `database/migrations/`

**Setup Scripts**: `database/setup/`

---

*This is the source of truth for CodeOrbit's database design.*
