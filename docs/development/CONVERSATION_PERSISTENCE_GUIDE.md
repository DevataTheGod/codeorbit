# 💬 CodeOrbit — Conversation Persistence

Orbit AI chat history is persisted to Supabase so students can resume sessions across devices and browsers.

---

## Architecture

| Layer | File | Responsibility |
|---|---|---|
| **Database** | `database/migrations/20260204120000_create_conversations_and_messages.sql` | `conversations` + `messages` tables with RLS |
| **Service** | `frontend/src/services/ConversationService.ts` | CRUD operations against Supabase |
| **Hook** | `frontend/src/hooks/useConversationHistory.ts` | React state wrapper over ConversationService |
| **UI** | `frontend/src/components/ConversationHistory.tsx` | Sidebar list of past sessions |

---

## Data Model

**`conversations`**
- `id`, `user_id`, `submission_id`, `title`, `project_idea`, `tech_stack`, `intake_confirmed`, `status`, `created_at`

**`messages`**
- `id`, `conversation_id`, `role` (`user` | `assistant`), `content`, `message_type`, `file_ops` (JSONB), `mentor_report` (JSONB), `created_at`

---

## Hook API

```ts
const {
  conversations,         // all user conversations
  currentConversation,   // active session
  startNewConversation,  // () => void
  addMessage,            // (role, content, extras?) => void
  saveIntake,            // (intakeData) => void
  updateTitle,           // (id, title) => void
  removeConversation,    // (id) => void
} = useConversationHistory();
```

---

## RLS Policies

- **Students** — can only read/write their own conversations and messages.
- **Mentors** — can read all conversations for students they oversee.
- **Admins** — full read access.
