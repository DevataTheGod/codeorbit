# CodeOrbit

**Learning Infrastructure Platform for Bootcamps**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Why CodeOrbit Exists

The AI era broke learning verification.

Bootcamps cannot verify whether students truly understand their work. ChatGPT, Copilot, and Cursor enable fake project completion. Mentors cannot scale beyond 20 students.

**CodeOrbit exists to solve this.**

---

## Mission

Develop and verify independent software engineers at scale.

---

## How It Works

```
Student Creates Project
        ↓
Orbit Guides Learning (Never writes code)
        ↓
Telemetry Captures Behavior
        ↓
Reflection Challenges Test Understanding
        ↓
Understanding Score Generated
        ↓
Mentor Reviews & Validates
```

---

## Core Features

### Understanding Score

AI-powered comprehension measurement based on:
- **Engagement** (30%) — Orbit interactions, typing time, task attempts
- **Reflection Quality** (40%) — How well students explain their code
- **Progress** (30%) — Milestones completed

### Orbit AI Mentor

Socratic teaching assistant that:
- Guides students through projects
- Never writes code for them
- Asks questions to deepen understanding
- Generates reflection challenges

### Mentor Dashboard

Scale mentorship to 100+ students:
- View student scores and risk levels
- Review reflection responses
- Submit mentor assessments
- Track student progress over time

### Validation Framework

Prove the Understanding Score works:
- Mentor vs. system ranking comparison
- Correlation calculation
- CSV export for analysis
- Audit trail for debugging

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind + Monaco |
| Backend | Supabase (PostgreSQL + RLS + Edge Functions) |
| Edge Functions | Deno (Gemini 2.5 Flash via AI gateway) |
| Testing | Vitest + React Testing Library |

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/DevataTheGod/codeorbit.git
cd codeorbit

# Install dependencies
npm install

# Set up environment
cp config/.env.example .env

# Start development
npm run dev
```

See [Local Development Guide](docs/engineering/development/LOCAL_DEVELOPMENT_GUIDE.md) for full setup.

---

## Documentation

### For Students
- [Student Guide](docs/users/STUDENT_GUIDE.md) — How to use CodeOrbit

### For Mentors
- [Mentor Guide](docs/users/MENTOR_GUIDE.md) — How to review students

### For Admins
- [Admin Guide](docs/users/ADMIN_GUIDE.md) — How to manage the platform

### For Developers
- [Engineering Handbook](docs/engineering/ENGINEERING_HANDBOOK.md) — Coding standards
- [Local Development Guide](docs/engineering/development/LOCAL_DEVELOPMENT_GUIDE.md) — Setup instructions
- [Current Architecture](docs/engineering/architecture/CURRENT_ARCHITECTURE.md) — System design

### For Investors
- [Investor Deck](docs/investor/INVESTOR_DECK.md) — Business overview

### For Pilot Partners
- [Bootcamp Pilot Guide](docs/pilot/BOOTCAMP_PILOT_GUIDE.md) — How to run a pilot

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Student │  │  Mentor  │  │  Admin   │  │     IDE     │ │
│  │Dashboard│  │Dashboard │  │Dashboard │  │  (Monaco)   │ │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │
│       │            │             │                │        │
│       └────────────┴─────────────┴────────────────┘        │
│                          │                                  │
│                    Supabase Client                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Supabase Backend                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │PostgreSQL│  │   RLS    │  │   Auth   │  │   Edge     │ │
│  │ Database │  │ Policies │  │  (JWT)   │  │ Functions  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

See [Architecture Documentation](docs/engineering/architecture/) for details.

---

## Product Status

| Area | Status |
|------|--------|
| Authentication & RBAC | ✅ Production |
| Student Workflow | ✅ Production |
| Orbit AI | 🟡 Pilot |
| Understanding Score | 🟡 Pilot |
| Mentor Dashboard | 🟡 Pilot |
| Validation Framework | 🟡 Pilot |

See [Feature Completion Matrix](docs/reports/FEATURE_COMPLETION_MATRIX.md) for details.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

---

## License

MIT © CodeOrbit
