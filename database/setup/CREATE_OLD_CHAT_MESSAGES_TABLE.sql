-- CREATE_OLD_CHAT_MESSAGES_TABLE.sql
-- Run this in Supabase SQL Editor to create the legacy `chat_messages` table
-- (Matches the columns shown in your screenshot so you can import CSVs directly)

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  submission_id UUID,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: indexes to speed imports and lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_submission_id ON public.chat_messages(submission_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Note:
-- - This table intentionally does not add FK constraints to `public.users` or `public.project_submissions`
--   to make CSV import easier. If you prefer strict FK constraints, run ALTER TABLE to add them after import.
-- - If your CSV uses different column names, map them when importing.
-- Sample import mapping (CSV headers expected): id,user_id,submission_id,role,content,created_at

-- ===================================================================
-- After running this, use Supabase Table Editor → chat_messages → Import CSV
-- Map columns and upload. When import completes, tell me and I will:
--  1) generate SQL to create `conversations` rows (grouping by user+submission),
--  2) generate SQL to migrate `chat_messages` into the new `messages` table
-- ===================================================================
