# Technical Context

How CodeOrbit is actually built today.

---

## Current Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite 5 + Tailwind CSS + shadcn/ui |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Auth + DB | Supabase (PostgreSQL + JWT + Row-Level Security) |
| Edge Functions | Deno (Gemini 2.5 Flash via Lovable AI gateway) |
| Backend | Node.js / Express (OTP micro-server, port 8787) |
| Email | Resend |
| Build | Vite (root in `frontend/`, builds to `dist/`) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│         Pages: Auth, Dashboard, IDE, Submit, Progress        │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐  ┌────────────────────┐  ┌─────────────┐
│   Supabase      │  │   Edge Functions   │  │   Express   │
│   PostgreSQL    │  │   (orbit-chat,     │  │   OTP       │
│   + RLS         │  │    gen-milestones) │  │   Server    │
└─────────────────┘  └────────────────────┘  └─────────────┘
```

---

## Frontend

**Location**: `frontend/`

**Key Files**:
- `frontend/src/App.tsx` — Router + providers
- `frontend/src/pages/` — 11 route-level pages
- `frontend/src/components/ide/` — 13 IDE components
- `frontend/src/hooks/` — 7 custom hooks
- `frontend/src/services/` — 6 service modules

**Routes**:
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Index | Landing page |
| `/auth` | Auth | Login/signup |
| `/student` | StudentDashboard | Student view |
| `/mentor` | MentorDashboard | Mentor view |
| `/admin` | AdminDashboard | Admin view |
| `/ide` | IDE | Browser IDE |
| `/submit-project` | SubmitProject | Project intake |
| `/progress` | Progress | Progress tracking |

---

## Backend

### Supabase

**Database**: PostgreSQL with Row-Level Security
**Auth**: JWT-based with role management
**Edge Functions**: Deno runtime

**Tables**:
| Table | Purpose |
|-------|---------|
| `users` | Auth base (UUID, email, name, role) |
| `profiles` | Extended profile (username, bio, social links) |
| `user_roles` | Role assignments (student/mentor/admin) |
| `project_submissions` | Student project submissions |
| `milestones` | AI-generated milestones per submission |
| `conversations` | Chat sessions with Orbit AI |
| `messages` | Individual chat messages |
| `mentor_reports` | AI-generated mentor feedback |
| `progress_entries` | Student progress tracking |
| `help_requests` | Student support/flagging |

### Edge Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `orbit-chat` | `supabase/functions/orbit-chat/` | Orbit Socratic chat |
| `generate-milestones` | `supabase/functions/generate-milestones/` | Roadmap generation |

### Express OTP Server

**Location**: `backend/`
**Port**: 8787
**Purpose**: Email OTP delivery via Resend

---

## AI Architecture

**Provider**: Gemini 2.5 Flash via Lovable AI Gateway

**Endpoint**: `https://ai.gateway.lovable.dev/v1/chat/completions`

**Environment Variable**: `LOVABLE_API_KEY`

**Functions**:
- `orbit-chat`: Socratic teaching, mentor reports, anti-shortcut enforcement
- `generate-milestones`: Roadmap generation with tool-calling

---

## Database Schema

**Full Schema**: `database/schema/COMPLETE_DATABASE_SCHEMA.sql`

**Migrations**: `database/migrations/` (12 files)

**Setup Scripts**: `database/setup/` (5 files)

---

## Known Technical Debt

| Issue | Impact | Priority |
|-------|--------|----------|
| Duplicate function directories (was `functions/` vs `supabase/functions/`) | Resolved | Done |
| `AMIT-BODHIT` in AI prompts | Resolved | Done |
| `bodhit-chat` naming | Resolved | Done |
| Missing Understanding Score implementation | High | Medium |
| Missing Mentor Dashboard | High | Medium |
| Missing Reflection Challenges | Medium | Medium |

---

## Environment Variables

**Template**: `config/.env.example`

**Required**:
| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `LOVABLE_API_KEY` | AI gateway authentication |
| `RESEND_API_KEY` | Email delivery |

---

## Deployment

**Frontend**: Vercel/Netlify
**OTP Server**: Render/Fly.io
**Database + Edge Functions**: Supabase

See `docs/operations/DEPLOYMENT_GUIDE.md` for details.

---

*This document describes the actual deployed architecture. For aspirational vision, see `docs/strategy/TARGET_ARCHITECTURE.md`.*
