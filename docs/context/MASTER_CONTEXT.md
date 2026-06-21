# CodeOrbit — Master Context

**Last Updated**: 2026-06-20

---

## What Is CodeOrbit

CodeOrbit is a **Learning Infrastructure Platform** for bootcamps that measures and develops engineering judgment at scale.

---

## Why It Exists

The AI era broke learning verification. ChatGPT, Copilot, and Cursor enable fake project completion. Bootcamps cannot verify whether students actually understand their work. Mentors cannot scale beyond 20 students.

CodeOrbit solves this through:
- **Understanding Score** — Quantified comprehension, not completion
- **Orbit AI** — Socratic mentor that forces thinking, not copying
- **Telemetry** — Behavioral signals that detect AI-assisted learning
- **Mentor Intelligence** — Scales mentorship to 100+ students

---

## Who It Serves

**Customer**: Bootcamps (50-200 students/cohort)

**Users**: Students and Mentors

**Buyers**: Founders, Academic Heads, Placement Heads, Lead Mentors

---

## Core Problem

| Problem | Impact |
|---------|--------|
| Understanding unverifiable | 4-12 week gap between submission and interview |
| AI making assessment worse | Fake project completion, false confidence |
| Mentors don't scale | 20 sustainable, 50 difficult, 100+ impossible |

---

## Product Priorities

| # | Feature | Purpose |
|---|---------|---------|
| 1 | Understanding Score | Core differentiator |
| 2 | Reflection Challenges | Verifies comprehension |
| 3 | Mentor Dashboard | Scales mentorship |
| 4 | Orbit Mentor | Socratic guidance |
| 5 | Roadmaps | Structured learning |
| 6 | Telemetry | Detects cheating |
| 7 | IDE | Supporting infrastructure |

---

## The Moat

**Pedagogy + Telemetry + Mentor Intelligence + Understanding Verification**

Not the IDE. Not the features. The ability to verify engineering judgment at scale.

---

## Current Architecture

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind + Monaco |
| Backend | Supabase (PostgreSQL + RLS + Edge Functions) |
| Edge Functions | Deno (Gemini 2.5 Flash via Lovable AI gateway) |
| OTP Service | Express.js (port 8787, Resend email) |
| AI Provider | Gemini via Lovable AI gateway (NOT Claude) |
| Infrastructure | Supabase hosted (NOT AWS) |

**Note**: This is the actual deployed architecture. See `docs/strategy/TARGET_ARCHITECTURE.md` for aspirational vision.

---

## North Star Metric

**% of students who can independently explain and defend their project decisions.**

Target: 75%+ by Month 6.

---

## Key Files

| File | Purpose |
|------|---------|
| [FOUNDER_THESIS.md](../strategy/FOUNDER_THESIS.md) | Why CodeOrbit exists |
| [PRODUCT_DECISION_FRAMEWORK.md](../product/PRODUCT_DECISION_FRAMEWORK.md) | Feature decision filter |
| [AI_AGENT_RULES.md](../ai/AI_AGENT_RULES.md) | Rules for AI agents |
| [CURRENT_ARCHITECTURE.md](../engineering/architecture/CURRENT_ARCHITECTURE.md) | Actual architecture |

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Frontend: http://localhost:8080
# OTP Server: http://localhost:8787
```

---

## Documentation Structure

```
docs/
├── context/        # Start here
├── strategy/       # Business strategy
├── product/        # Product definition
├── engineering/    # Technical docs
├── operations/     # Deployment
├── ai/            # AI system
├── reports/       # Audit & status
└── archive/       # Legacy docs
```

---

*This is the single source of truth for CodeOrbit. Any AI agent, developer, mentor, founder, investor, or bootcamp partner should read this file first.*
