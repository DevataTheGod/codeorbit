# Database Setup Checklist - Complete Database Build

## Phase 1: Schema Creation ✅

### Step 1: Execute Complete Schema SQL

**Location**: Supabase Dashboard → SQL Editor → New Query

1. Open `COMPLETE_DATABASE_SCHEMA.sql` from the project
2. Copy entire SQL content
3. In Supabase SQL Editor:
   - Create new query
   - Paste all SQL
   - Click "Run" button
   - Wait for completion (should take 5-10 seconds)

**Expected Result**:
```
Tables created: 8
- users
- user_roles
- project_submissions
- conversations
- messages
- mentor_reports
- progress_entries
- audit_log

Indexes created: 25+
Triggers created: 4
RLS Policies: All enabled
```

### Verification Query (Run after schema creation):

```sql
-- Verify all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should return 8 tables
```

---

## Phase 2: Data Migration

### Option A: If You Have CSV Files

**Files Needed**:
- [ ] users.csv
- [ ] user_roles.csv
- [ ] project_submissions.csv
- [ ] conversations.csv
- [ ] messages.csv
- [ ] mentor_reports.csv
- [ ] progress_entries.csv
- [ ] audit_log.csv (optional)

**Steps**:
1. Prepare CSV files with correct format (see CSV_DATA_IMPORT_GUIDE.md)
2. Go to Supabase Table Editor
3. For each table:
   - Click table name
   - Click "Import" button
   - Upload CSV file
   - Map columns correctly
   - Confirm import
4. Verify row counts after each import

**Verification SQL** (Run after import):
```sql
SELECT 'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'conversations', COUNT(*) FROM public.conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM public.messages
UNION ALL
SELECT 'mentor_reports', COUNT(*) FROM public.mentor_reports
UNION ALL
SELECT 'progress_entries', COUNT(*) FROM public.progress_entries;
```

### Option B: If You Provide CSV Content

1. Share CSV data (paste or attach)
2. I'll generate INSERT statements
3. Execute generated SQL in Supabase
4. Done!

### Option C: Start Fresh (No Migration)

Skip data import, tables are ready for new data.

---

## Phase 3: Verification Checklist

### ✅ Schema Verification

```sql
-- 1. Check all tables created
\dt public.*

-- 2. Check row counts
SELECT COUNT(*) FROM public.users;
SELECT COUNT(*) FROM public.conversations;
SELECT COUNT(*) FROM public.messages;
SELECT COUNT(*) FROM public.mentor_reports;
SELECT COUNT(*) FROM public.progress_entries;

-- 3. Verify indexes exist
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- 4. Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- 5. Test RLS (logged in as specific user)
SELECT * FROM public.conversations WHERE user_id = auth.uid();
```

### ✅ Data Integrity

```sql
-- Check for orphaned references (conversation without user)
SELECT c.id, c.user_id FROM public.conversations c
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = c.user_id);

-- Check for orphaned messages (message without conversation)
SELECT m.id, m.conversation_id FROM public.messages m
WHERE NOT EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = m.conversation_id);

-- Check for required fields
SELECT * FROM public.conversations WHERE title IS NULL OR user_id IS NULL LIMIT 5;
SELECT * FROM public.messages WHERE content IS NULL OR role IS NULL LIMIT 5;
```

### ✅ Application Connection

After schema setup:

1. **Restart dev server**:
   ```powershell
   npm run dev
   ```

2. **Test in browser**:
   - Navigate to `http://localhost:8080/ide`
   - Start a new conversation
   - Send a message
   - Check browser DevTools Console for errors
   - Verify no 404 or CORS errors

3. **Check data persistence**:
   - In Supabase SQL Editor, run:
   ```sql
   SELECT * FROM public.conversations ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM public.messages ORDER BY created_at DESC LIMIT 5;
   ```
   - Should see your new conversation and messages

---

## Phase 4: Production Checklist

### Before Going Live

- [ ] All 8 tables created
- [ ] 25+ indexes created
- [ ] 4 triggers active
- [ ] RLS policies enabled on all tables
- [ ] Data imported successfully (if migrating)
- [ ] All foreign keys valid (no orphaned records)
- [ ] App connects without errors
- [ ] Messages save and retrieve
- [ ] Progress entries persist
- [ ] Conversations load in history sidebar
- [ ] No console errors in browser
- [ ] Build completes: `npm run build`

### Performance Checks

```sql
-- Check indexes are being used
EXPLAIN ANALYZE
SELECT * FROM public.conversations 
WHERE user_id = 'some-uuid'::uuid 
ORDER BY updated_at DESC;

-- Should show "Index Scan" or "Index Only Scan" in plan

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Phase 5: Backup Strategy

### Create Backup Before Migration

1. **In Supabase Dashboard**:
   - Settings → Backups
   - Click "Request a backup"
   - Wait for completion

2. **Export data (optional)**:
   ```sql
   -- Export conversations
   \COPY (SELECT * FROM public.conversations) TO 'conversations_backup.csv' WITH CSV HEADER;
   
   -- Export messages
   \COPY (SELECT * FROM public.messages) TO 'messages_backup.csv' WITH CSV HEADER;
   ```

### Recovery Procedure (If Needed)

1. In Supabase: Settings → Backups → Restore
2. Choose backup date
3. Wait for restore completion
4. Restart app

---

## Summary

### Database Ready Checklist

| Component | Status | Action |
|-----------|--------|--------|
| **Schema** | Pending | Execute COMPLETE_DATABASE_SCHEMA.sql |
| **8 Tables** | Pending | ✅ After schema execution |
| **25+ Indexes** | Pending | ✅ After schema execution |
| **RLS Policies** | Pending | ✅ After schema execution |
| **Data Migration** | Pending | ⚠️ Optional - depends on CSV files |
| **App Connection** | Pending | ✅ Restart `npm run dev` |
| **Testing** | Pending | Test in `/ide` route |
| **Production Ready** | Pending | All above + backup |

---

## Quick Setup Timeline

| Time | Task |
|------|------|
| 5 min | Execute schema SQL |
| 10 min | Import CSV data (if available) |
| 5 min | Verify data integrity |
| 5 min | Restart dev server & test |
| **Total: 25 minutes** | ✅ Full database ready |

---

## Need Help?

### If schema creation fails:
- Check for syntax errors in SQL
- Ensure all tables don't already exist
- Run `TRUNCATE public.* CASCADE;` to clear, then retry

### If data import fails:
- Check CSV format (encoding, delimiters)
- Verify UUID formats are valid
- Check dates are ISO 8601 format
- Look for duplicate IDs

### If app doesn't connect:
- Verify .env credentials are correct
- Restart `npm run dev`
- Check browser console for errors
- Verify RLS policies allow read

---

**Ready to proceed? Provide your CSV files or confirm to start with fresh database!**
