# Current Architecture

What is running today.

**Last Updated**: 2026-06-20

---

## Overview

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

| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| Language | TypeScript |
| Bundler | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Editor | Monaco Editor |
| State | React Query + Context |
| Routing | React Router |

**Location**: `frontend/`

**Entry Point**: `frontend/src/main.tsx`

**Router**: `frontend/src/App.tsx`

---

## Backend

### Supabase

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL |
| Auth | Supabase Auth (JWT) |
| Security | Row-Level Security (RLS) |
| Edge Functions | Deno runtime |

**Tables**: 8 tables with RLS enabled

### Edge Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `orbit-chat` | `supabase/functions/orbit-chat/` | Socratic AI chat |
| `generate-milestones` | `supabase/functions/generate-milestones/` | Roadmap generation |

**AI Provider**: Gemini 2.5 Flash via Lovable AI Gateway

**Endpoint**: `https://ai.gateway.lovable.dev/v1/chat/completions`

### Express OTP Server

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express |
| Port | 8787 |
| Email | Resend |

**Location**: `backend/`

---

## Authentication

| Method | Provider |
|--------|----------|
| Email/Password | Supabase Auth |
| Google OAuth | Supabase Auth |
| OTP | Express + Resend |

**Roles**: student, mentor, admin

---

## Storage

| Type | Location | Purpose |
|------|----------|---------|
| Database | Supabase PostgreSQL | User data, conversations, milestones |
| Local | localStorage | IDE files (`CODEORBIT_IDE_FILES`) |

---

## Deployment

| Component | Hosting |
|-----------|---------|
| Frontend | Vercel/Netlify |
| OTP Server | Render/Fly.io |
| Database | Supabase |
| Edge Functions | Supabase |

---

## API Endpoints

| Endpoint | Service | Purpose |
|----------|---------|---------|
| `GET /` | Express | Health check |
| `POST /send-otp` | Express | OTP delivery |
| `POST /functions/v1/orbit-chat` | Supabase | Orbit AI chat |
| `POST /functions/v1/generate-milestones` | Supabase | Roadmap generation |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `LOVABLE_API_KEY` | AI gateway authentication |
| `RESEND_API_KEY` | Email delivery |

---

## What This Is NOT

This document describes the **actual deployed architecture**.

For aspirational vision (AWS, Claude, Prisma, Redis), see `docs/strategy/TARGET_ARCHITECTURE.md`.

---

*This is the source of truth for CodeOrbit's current technical implementation.*
