# CodeOrbit

Learning Infrastructure Platform for Bootcamps

---

## Why CodeOrbit Exists

The AI era broke learning verification.

Bootcamps cannot verify whether students truly understand their work. ChatGPT, Copilot, and Cursor enable fake project completion. Mentors cannot scale beyond 20 students.

CodeOrbit exists to solve this.

---

## Mission

Develop and verify independent software engineers at scale.

---

## Core Problem

| Problem | Impact |
|---------|--------|
| Understanding unverifiable | 4-12 week gap between submission and interview |
| AI making assessment worse | Fake project completion, false confidence |
| Mentors don't scale | 20 sustainable, 50 difficult, 100+ impossible |

---

## Core Customer

Bootcamps (50-200 students/cohort)

---

## Primary Users

Students and Mentors

---

## Platform Components

1. **Understanding Score System** — Verify comprehension at scale
2. **Orbit Socratic AI Mentor** — Never writes code, always teaches
3. **Mentor Dashboard** — Scale mentorship to 100+ students
4. **Project Roadmap Generator** — AI-powered milestone creation
5. **Telemetry Engine** — Detect AI-assisted learning
6. **Browser IDE** — Supporting infrastructure (not the moat)

---

## The Moat

Pedagogy + Telemetry + Mentor Intelligence + Understanding Verification

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind + Monaco |
| Backend | Supabase (PostgreSQL + RLS + Edge Functions) |
| Edge Functions | Deno (Gemini 2.5 Flash via Lovable AI gateway) |
| OTP Service | Express.js (port 8787, Resend email) |

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp config/.env.example .env

# Run development
npm run dev          # Frontend → http://localhost:8080
npm run otp-server   # OTP Server → http://localhost:8787
```

See [docs/engineering/development/LOCAL_SETUP.md](docs/engineering/development/LOCAL_SETUP.md) for full setup.

---

## Architecture Overview

See [docs/engineering/architecture/CURRENT_ARCHITECTURE.md](docs/engineering/architecture/CURRENT_ARCHITECTURE.md) for the actual deployed architecture.

---

## Documentation Index

### Context (Start Here)
- [Master Context](docs/context/MASTER_CONTEXT.md) — Single source of truth
- [Business Context](docs/context/BUSINESS_CONTEXT.md) — Business model, customer, revenue
- [Technical Context](docs/context/TECHNICAL_CONTEXT.md) — Architecture, stack, deployment

### Strategy
- [Founder Thesis](docs/strategy/FOUNDER_THESIS.md) — Why CodeOrbit exists
- [Business Strategy](docs/strategy/BUSINESS_STRATEGY.md) — Business strategy
- [GTM Execution](docs/strategy/GTM_EXECUTION.md) — Go-to-market plan

### Product
- [Product Decision Framework](docs/product/PRODUCT_DECISION_FRAMEWORK.md) — Feature decision filter
- [Product North Star](docs/product/PRODUCT_NORTH_STAR.md) — Mission, metrics, priorities
- [Product Spec](docs/product/PRODUCT_SPEC.md) — Product requirements

### Engineering
- [Current Architecture](docs/engineering/architecture/CURRENT_ARCHITECTURE.md) — Actual architecture
- [API Reference](docs/engineering/api/API_REFERENCE.md) — API documentation
- [Database Reference](docs/engineering/architecture/DATABASE_ARCHITECTURE.md) — Database schema and RLS design

### AI
- [AI Agent Rules](docs/ai/AI_AGENT_RULES.md) — Rules for AI agents
- [Orbit AI System](docs/context/AI_CONTEXT.md) — Socratic AI system design
- [Prompts Reference](docs/context/AI_CONTEXT.md#prompt-architecture) — AI prompt inventory and mandates

---

## Product Priorities

1. Understanding Score
2. Reflection Challenges
3. Mentor Dashboard
4. Orbit Mentor
5. Roadmaps
6. Telemetry
7. IDE

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for coding guidelines.

---

## License

MIT
