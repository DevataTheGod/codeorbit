# Execute Schema SQL - Quick Guide

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com
2. Sign in to your account
3. Click on your project: `bszuklqqocfntoeszjdq`

### Step 2: Open SQL Editor
1. In left sidebar, click **SQL Editor**
2. Click **New Query** button (top right)
3. A blank SQL editor will open

### Step 3: Copy Schema SQL
1. Open file: `COMPLETE_DATABASE_SCHEMA.sql` in your project
2. Select all content (Ctrl+A)
3. Copy it (Ctrl+C)

### Step 4: Paste into Supabase
1. In the Supabase SQL Editor, click in the text area
2. Paste all SQL (Ctrl+V)
3. You should see the entire schema SQL loaded

### Step 5: Execute SQL
1. Click **Run** button (or press Ctrl+Enter)
2. Wait for execution to complete (5-10 seconds)
3. You should see success message

### Step 6: Verify Tables Created
1. In left sidebar, click **Table Editor**
2. You should see 8 new tables:
   - ✅ users
   - ✅ user_roles
   - ✅ project_submissions
   - ✅ conversations
   - ✅ messages
   - ✅ mentor_reports
   - ✅ progress_entries
   - ✅ audit_log

---

## SQL File Location

📁 **`c:\Users\ANURAG\Dropbox\FORGE-LEARN\forge-learn\COMPLETE_DATABASE_SCHEMA.sql`**

---

## Expected Output After Execution

```
✅ All queries executed successfully

Tables created:
- public.users
- public.user_roles
- public.project_submissions
- public.conversations
- public.messages
- public.mentor_reports
- public.progress_entries
- public.audit_log

Indexes created: 25+
Triggers created: 4
RLS enabled: All tables
```

---

## Troubleshooting

### If you get an error:
- **"Table already exists"** → Delete existing tables first or use "DROP TABLE IF EXISTS"
- **"Syntax error"** → Make sure entire SQL file is copied
- **"Permission denied"** → Ensure you're logged in with admin access

### If you need to clear tables before re-running:
```sql
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.progress_entries CASCADE;
DROP TABLE IF EXISTS public.mentor_reports CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.project_submissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

Then re-run the full COMPLETE_DATABASE_SCHEMA.sql

---

## Confirmation Checklist

After execution, verify:

- [ ] No error messages shown
- [ ] All 8 tables visible in Table Editor
- [ ] Each table has correct columns
- [ ] Indexes are created
- [ ] RLS policies enabled

Then come back and let me know it's done!
