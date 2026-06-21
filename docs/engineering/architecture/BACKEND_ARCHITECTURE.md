# Backend Architecture

Supabase, Edge Functions, and Express OTP Server.

---

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Supabase                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ PostgreSQL  │  │   Auth      │  │   Edge Functions    │ │
│  │   + RLS     │  │   (JWT)     │  │   (Deno)           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express OTP Server                        │
│                    (Node.js:8787)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Supabase

### PostgreSQL Database

- 11 tables with Row-Level Security (RLS)
- Role-based access: student, mentor, admin
- Automatic timestamp triggers
- See `DATABASE_ARCHITECTURE.md` for schema

### Auth

| Method | Implementation |
|--------|----------------|
| Email/Password | Supabase Auth |
| Google OAuth | Supabase Auth |
| JWT Tokens | Supabase Auth |
| Session Management | Supabase Auth |

**Roles**: Stored in `user_roles` table, checked via RLS policies.

### Edge Functions

Runtime: Deno

| Function | Location | Purpose |
|----------|----------|---------|
| `orbit-chat` | `supabase/functions/orbit-chat/` | Socratic AI chat |
| `generate-milestones` | `supabase/functions/generate-milestones/` | Roadmap generation |

---

## Edge Functions

### orbit-chat

**Purpose**: Socratic AI mentor that guides students through project-based learning.

**Location**: `supabase/functions/orbit-chat/index.ts`

**AI Provider**: Gemini 2.5 Flash via Lovable AI Gateway

**Endpoint**: `POST /functions/v1/orbit-chat`

**Request Body**:
```json
{
  "messages": [
    { "role": "user", "content": "How do I implement JWT authentication?" }
  ],
  "currentTask": "Setup Auth Controller",
  "currentCode": "// code snippet",
  "projectFiles": { "path": "content" },
  "projectStructure": ["file1.ts", "file2.ts"],
  "projectFilesContent": { "path": "content" },
  "progressEntries": [],
  "studentDashboardContext": {}
}
```

**Response**: Streaming text response with Socratic guidance.

**System Prompt Mandates**:
1. NO-EXECUTION RULE: Never provide full code blocks
2. CLARIFY & INTAKE: Collect project info before proceeding
3. MILESTONE CREATION: Produce ordered milestones
4. MILESTONE DETAILS FORMAT: Include objective, concepts, output, structure, criteria
5. GUIDANCE STYLE: Step-wise thinking guidance
6. PROGRESS VALIDATION: Check student understanding
7. MENTOR FEEDBACK REPORT: Generate JSON summary
8. ANTI-SHORTCUT ENFORCEMENT: Halt if student tries to skip
9. TONE: Professional, encouraging, patient

**Safety**: Regex-based code generation detection. Refuses to output complete solutions.

---

### generate-milestones

**Purpose**: AI-powered roadmap generator that creates structured project breakdowns.

**Location**: `supabase/functions/generate-milestones/index.ts`

**AI Provider**: Gemini 2.5 Flash via Lovable AI Gateway

**Endpoint**: `POST /functions/v1/generate-milestones`

**Request Body**:
```json
{
  "submissionId": "uuid"
}
```

**Response**:
```json
{
  "milestones": [
    {
      "title": "Project Setup & Authentication",
      "description": "...",
      "order_index": 1,
      "tasks": [
        {
          "title": "Initialize React app",
          "description": "...",
          "order_index": 1
        }
      ]
    }
  ]
}
```

**Workflow**:
1. Fetch submission data from Supabase
2. Generate milestones via AI with tool-calling
3. Persist milestones to database
4. Return structured roadmap

**Fallback**: If AI unavailable, generates basic roadmap from templates.

---

## Express OTP Server

**Location**: `backend/`

**Port**: 8787

**Purpose**: Email OTP delivery via Resend.

**Endpoints**:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/send-otp` | POST | Send OTP email |
| `/health` | GET | Provider status |

**Request Body** (`/send-otp`):
```json
{
  "email": "student@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Email Provider**: Resend

**Environment Variable**: `RESEND_API_KEY`

---

## Data Flow

### Student Chat Flow

```
1. Student opens IDE
2. Student asks Orbit a question
3. Frontend sends POST to /functions/v1/orbit-chat
4. Edge function processes with Gemini
5. Response streams back to frontend
6. Message saved to messages table
7. Conversation updated in conversations table
```

### Milestone Generation Flow

```
1. Student submits project
2. Frontend sends POST to /functions/v1/generate-milestones
3. Edge function fetches submission data
4. AI generates milestones with tool-calling
5. Milestones saved to milestones table
6. Tasks saved to tasks table (if exists)
7. Roadmap returned to frontend
```

### OTP Flow

```
1. User requests OTP
2. Frontend sends POST to /send-otp (Express)
3. Express generates OTP
4. Resend sends email
5. User enters OTP
6. Supabase Auth verifies
```

---

## Security

| Layer | Implementation |
|-------|----------------|
| Authentication | Supabase Auth (JWT) |
| Authorization | Row-Level Security (RLS) |
| API Security | CORS, API keys |
| Data Encryption | Supabase managed |
| Secrets | Environment variables |

---

## Known Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| Edge Functions cold start | 1-2s latency | Acceptable for MVP |
| No WebSocket | No real-time chat | HTTP polling |
| Express single instance | Scaling limits | Move to Supabase later |

---

*This is the source of truth for CodeOrbit's backend implementation.*
