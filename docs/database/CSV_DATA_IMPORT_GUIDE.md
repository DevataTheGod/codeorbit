# Database Migration: Import CSV Data

## Step 1: Prepare Your CSV Files

You need CSV files for these tables (in this order):

1. **users.csv** - Columns: `id, email, full_name, avatar_url, role, created_at, updated_at`
2. **user_roles.csv** - Columns: `id, user_id, role, assigned_at, assigned_by`
3. **project_submissions.csv** - Columns: `id, user_id, title, description, tech_stack, status, submission_date, created_at, updated_at`
4. **conversations.csv** - Columns: `id, user_id, submission_id, title, project_idea, tech_stack, skill_level, timeline, intake_confirmed, status, created_at, updated_at, last_message_at`
5. **messages.csv** - Columns: `id, conversation_id, role, content, message_type, file_ops, mentor_report, tokens_used, created_at`
6. **mentor_reports.csv** - Columns: `id, submission_id, conversation_id, report, raw_text, mentor_notes, status, created_at, updated_at`
7. **progress_entries.csv** - Columns: `id, user_id, submission_id, conversation_id, title, description, milestone_number, status, files_snapshot, meta, created_at, updated_at`
8. **audit_log.csv** - Columns: `id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at`

---

## Step 2: Format CSV Files Correctly

### CSV Format Requirements:
- **Encoding**: UTF-8
- **Delimiter**: Comma (,)
- **Quote character**: Double quotes (")
- **Line ending**: LF (\n)
- **NULL values**: Leave empty or use `\N`
- **Dates**: ISO 8601 format (`YYYY-MM-DD HH:MM:SS+00:00`)
- **UUIDs**: Standard UUID format (`550e8400-e29b-41d4-a716-446655440000`)
- **JSON columns**: Escaped JSON strings in quotes

### Example CSV Structure:

**users.csv**:
```csv
id,email,full_name,avatar_url,role,created_at,updated_at
550e8400-e29b-41d4-a716-446655440001,student1@example.com,John Doe,,student,2025-01-01T10:00:00+00:00,2025-01-01T10:00:00+00:00
550e8400-e29b-41d4-a716-446655440002,mentor1@example.com,Jane Smith,,mentor,2025-01-01T10:00:00+00:00,2025-01-01T10:00:00+00:00
```

**conversations.csv**:
```csv
id,user_id,submission_id,title,project_idea,tech_stack,skill_level,timeline,intake_confirmed,status,created_at,updated_at,last_message_at
550e8400-e29b-41d4-a716-446655440010,550e8400-e29b-41d4-a716-446655440001,,Chat Session 1,Build a blog app,React + Node.js,beginner,4 weeks,true,active,2025-01-05T14:30:00+00:00,2025-01-05T14:35:00+00:00,2025-01-05T14:35:00+00:00
```

**messages.csv**:
```csv
id,conversation_id,role,content,message_type,file_ops,mentor_report,tokens_used,created_at
550e8400-e29b-41d4-a716-446655440020,550e8400-e29b-41d4-a716-446655440010,user,How do I structure my React project?,question,,,,2025-01-05T14:30:00+00:00
550e8400-e29b-41d4-a716-446655440021,550e8400-e29b-41d4-a716-446655440010,assistant,Here are best practices for React structure...,explanation,,,,2025-01-05T14:31:00+00:00
```

---

## Step 3: Import Using Supabase SQL Editor

### Method A: Using COPY Command (Recommended for small files)

```sql
-- First, upload CSV files to a temporary location or paste data

-- 1. Import users
TRUNCATE TABLE public.users CASCADE;

COPY public.users (id, email, full_name, avatar_url, role, created_at, updated_at)
FROM STDIN (FORMAT csv, HEADER true);
-- Paste CSV data here, then end with \. on new line

-- 2. Import user_roles
TRUNCATE TABLE public.user_roles CASCADE;

COPY public.user_roles (id, user_id, role, assigned_at, assigned_by)
FROM STDIN (FORMAT csv, HEADER true);
-- Paste CSV data

-- 3. Continue for other tables...
```

### Method B: Using Supabase CSV Import UI

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create new query: `TRUNCATE TABLE public.users CASCADE;`
3. Execute to clear existing data
4. Go to **Table Editor** → Select table
5. Click **Import** button
6. Upload CSV file
7. Map columns correctly
8. Confirm import

---

## Step 4: SQL Import Scripts (Alternative)

### Create Insert Statements from CSV

If you have the CSV content, I can generate the INSERT statements:

```sql
-- Example: Insert users
INSERT INTO public.users (id, email, full_name, avatar_url, role, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'student1@example.com', 'John Doe', NULL, 'student', '2025-01-01T10:00:00+00:00', '2025-01-01T10:00:00+00:00'),
('550e8400-e29b-41d4-a716-446655440002', 'mentor1@example.com', 'Jane Smith', NULL, 'mentor', '2025-01-01T10:00:00+00:00', '2025-01-01T10:00:00+00:00');

-- Example: Insert conversations
INSERT INTO public.conversations (id, user_id, submission_id, title, project_idea, tech_stack, skill_level, timeline, intake_confirmed, status, created_at, updated_at, last_message_at) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Chat Session 1', 'Build a blog app', 'React + Node.js', 'beginner', '4 weeks', true, 'active', '2025-01-05T14:30:00+00:00', '2025-01-05T14:35:00+00:00', '2025-01-05T14:35:00+00:00');
```

---

## Step 5: Data Validation

After importing, run these checks:

```sql
-- Count records per table
SELECT 'users' as table_name, COUNT(*) as row_count FROM public.users
UNION ALL
SELECT 'user_roles', COUNT(*) FROM public.user_roles
UNION ALL
SELECT 'project_submissions', COUNT(*) FROM public.project_submissions
UNION ALL
SELECT 'conversations', COUNT(*) FROM public.conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM public.messages
UNION ALL
SELECT 'mentor_reports', COUNT(*) FROM public.mentor_reports
UNION ALL
SELECT 'progress_entries', COUNT(*) FROM public.progress_entries
UNION ALL
SELECT 'audit_log', COUNT(*) FROM public.audit_log;

-- Check for missing foreign key references
SELECT c.id, c.user_id FROM public.conversations c
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = c.user_id);

SELECT m.id, m.conversation_id FROM public.messages m
WHERE NOT EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = m.conversation_id);

-- Check for duplicate IDs
SELECT id, COUNT(*) as duplicate_count FROM public.users
GROUP BY id HAVING COUNT(*) > 1;
```

---

## Step 6: Handle JSONB Columns

For columns with JSONB data (file_ops, mentor_report, files_snapshot, meta):

### In CSV File:
```csv
id,conversation_id,role,content,message_type,file_ops,mentor_report,tokens_used,created_at
550e8400-e29b-41d4-a716-446655440020,550e8400-e29b-41d4-a716-446655440010,user,Question,question,"{""action"":""create"",""path"":""/src/index.ts""}",,,2025-01-05T14:30:00+00:00
```

### Or use SQL INSERT:
```sql
INSERT INTO public.messages (id, conversation_id, role, content, message_type, file_ops, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', 'user', 'Question', 'question', '{"action":"create","path":"/src/index.ts"}'::jsonb, '2025-01-05T14:30:00+00:00');
```

---

## Step 7: Post-Import Steps

After importing all data:

1. **Refresh sequences** (if using auto-increment):
   ```sql
   -- Not needed for UUID columns, but good to check
   ANALYZE public.users;
   ANALYZE public.conversations;
   ANALYZE public.messages;
   ANALYZE public.progress_entries;
   ```

2. **Verify row counts match**:
   - Count rows in old database
   - Count rows in new database
   - Ensure numbers match

3. **Test application**:
   - Restart `npm run dev`
   - Check conversations load
   - Verify messages display
   - Test progress entries

4. **Check for errors**:
   - Look for NULL values in required columns
   - Verify all foreign keys exist
   - Test RLS policies work correctly

---

## Step 8: Rollback (If Needed)

If import fails, rollback:

```sql
TRUNCATE TABLE public.audit_log CASCADE;
TRUNCATE TABLE public.progress_entries CASCADE;
TRUNCATE TABLE public.mentor_reports CASCADE;
TRUNCATE TABLE public.messages CASCADE;
TRUNCATE TABLE public.conversations CASCADE;
TRUNCATE TABLE public.project_submissions CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.users CASCADE;
```

Then re-import after fixing CSV files.

---

## Next Steps

1. **Provide your CSV files** (attached or as content)
2. **I'll generate the exact INSERT statements** for your data
3. **You'll paste them into Supabase SQL Editor**
4. **Done! Your database will be fully populated**

Do you have the CSV files ready? If yes, please share them and I'll generate the import SQL for you.
