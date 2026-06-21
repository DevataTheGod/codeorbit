# API Reference

REST API and Edge Function endpoints.

---

## Express OTP Server

**Base URL**: `http://localhost:8787`

### Health Check

```
GET /
```

**Response**:
```json
{
  "status": "ok",
  "service": "CodeOrbit OTP Server"
}
```

---

### Send OTP

```
POST /send-otp
```

**Request Body**:
```json
{
  "email": "student@example.com"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Response** (Error):
```json
{
  "success": false,
  "message": "Failed to send OTP"
}
```

---

### Provider Health

```
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "provider": "resend"
}
```

---

## Supabase Edge Functions

**Base URL**: `{VITE_SUPABASE_URL}/functions/v1`

### orbit-chat

```
POST /functions/v1/orbit-chat
```

**Purpose**: Socratic AI chat with Orbit mentor.

**Headers**:
```
Authorization: Bearer {SUPABASE_ANON_KEY}
Content-Type: application/json
```

**Request Body**:
```json
{
  "messages": [
    { "role": "user", "content": "How do I implement JWT authentication?" }
  ],
  "currentTask": "Setup Auth Controller",
  "currentCode": "// optional code snippet",
  "projectFiles": { "src/auth.ts": "content" },
  "projectStructure": ["src/auth.ts", "src/types.ts"],
  "projectFilesContent": { "src/auth.ts": "content" },
  "progressEntries": [],
  "studentDashboardContext": {}
}
```

**Response**: Streaming text

**Example Flow**:
```
Student: "How do I authenticate users?"
Orbit: "What data needs to be protected? What are the common ways to verify identity?"
```

---

### generate-milestones

```
POST /functions/v1/generate-milestones
```

**Purpose**: Generate project roadmap from submission.

**Headers**:
```
Authorization: Bearer {SUPABASE_ANON_KEY}
Content-Type: application/json
```

**Request Body**:
```json
{
  "submissionId": "uuid-of-submission"
}
```

**Response**:
```json
{
  "milestones": [
    {
      "title": "Project Setup & Authentication",
      "description": "Set up the project foundation with authentication",
      "order_index": 1,
      "tasks": [
        {
          "title": "Initialize React app",
          "description": "Create React app with TypeScript and configure environment",
          "order_index": 1
        },
        {
          "title": "Set up backend",
          "description": "Create Express server with database connection",
          "order_index": 2
        }
      ]
    }
  ]
}
```

---

## Supabase Database API

**Base URL**: `{VITE_SUPABASE_URL}/rest/v1`

**Auth**: JWT token in Authorization header

### Common Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/users` | GET | List users |
| `/users?id=eq.{id}` | GET | Get user by ID |
| `/conversations` | GET | List conversations |
| `/messages?conversation_id=eq.{id}` | GET | List messages |
| `/milestones?submission_id=eq.{id}` | GET | List milestones |
| `/project_submissions` | GET | List submissions |

### RLS Restrictions

All queries are filtered by Row-Level Security:
- Students see only their own data
- Mentors see assigned cohort data
- Admins see all data

---

## Authentication

### Supabase Auth

**Sign Up**:
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})
```

**Sign In**:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

**Google OAuth**:
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

**Sign Out**:
```typescript
const { error } = await supabase.auth.signOut()
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden (RLS) |
| 404 | Not found |
| 500 | Server error |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Express OTP | 10 requests/min |
| Edge Functions | Supabase defaults |
| Database | Supabase defaults |

---

*This is the source of truth for CodeOrbit's API endpoints.*
