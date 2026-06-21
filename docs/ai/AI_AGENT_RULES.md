# AI Agent Rules

This document governs every AI agent that modifies the CodeOrbit repository.

**Read this before making any changes.**

---

## Product Truths

CodeOrbit is:
- **Learning Infrastructure Platform** for bootcamps
- **Measurement System** for engineering judgment
- **Verification System** against AI-assisted cheating

CodeOrbit is NOT:
- LMS
- Bootcamp
- AI Copilot
- Browser IDE (core product)

---

## Orbit Rules

Orbit (the AI mentor) follows these rules:

1. **NEVER** writes complete solutions
2. **NEVER** generates code for students to copy
3. Uses **Socratic teaching** — asks questions, doesn't give answers
4. Prioritizes **reasoning** over implementation
5. Improves **engineering judgment**, not code output
6. Detects **paste events** and challenges understanding
7. Generates **mentor reports** for human oversight

---

## Product Priorities

**Order matters.** When resources are limited, build in this sequence:

| Priority | Feature | Why |
|----------|---------|-----|
| 1 | Understanding Score | Core differentiator |
| 2 | Reflection Challenges | Verifies comprehension |
| 3 | Mentor Dashboard | Scales mentorship |
| 4 | Orbit Mentor | Socratic guidance |
| 5 | Roadmaps | Structured learning |
| 6 | Telemetry | Detects cheating |
| 7 | IDE | Supporting infrastructure |

**Critical**: Do NOT spend weeks improving the IDE while ignoring the Understanding Score.

---

## Feature Decision Filter

Every feature must answer:

- Does this improve **understanding**?
- Does this improve **verification**?
- Does this improve **mentor efficiency**?
- Does this improve **placement outcomes**?

If not: **Don't build it.**

---

## Code Rules

1. **Never expose secrets** — No API keys, tokens, or credentials in code
2. **Never commit .env files** — Use .env.example for templates
3. **Follow existing patterns** — Match code style of surrounding files
4. **Run lint/typecheck before commit** — `npm run lint` and type checking
5. **Test changes** — Verify functionality before marking complete

---

## Architecture Rules

1. **Frontend**: React 18 + TypeScript + Vite + Tailwind + Monaco
2. **Backend**: Supabase (PostgreSQL + RLS + Edge Functions)
3. **Edge Functions**: Deno (Gemini via Lovable AI gateway)
4. **OTP Service**: Express.js (port 8787, Resend email)
5. **AI Provider**: Gemini via Lovable AI gateway (NOT Claude)
6. **Infrastructure**: Supabase hosted (NOT AWS)

---

## Documentation Rules

1. **Current vs Aspirational**: Keep `CURRENT_ARCHITECTURE.md` separate from `TARGET_ARCHITECTURE.md`
2. **Strategic Positioning**: Always describe CodeOrbit as "Learning Infrastructure Platform"
3. **North Star**: Engineering Judgment Verification
4. **Customer**: Bootcamps (not individual students)

---

## What NOT to Build

| Don't Build | Why |
|-------------|-----|
| Video players | Passive content, not active learning |
| Gamification | Time spent ≠ learning |
| AI code generation | Undermines Socratic method |
| Complex IDE features | IDE is not the moat |
| Admin dashboards | Focus on mentor intelligence |
| Analytics for analytics sake | Focus on verification metrics |

---

## Repository Structure

```
docs/
├── context/        # Project knowledge (read first)
├── strategy/       # Business strategy
├── product/        # Product definition
├── engineering/    # Technical documentation
├── operations/     # Deployment & ops
├── ai/            # AI system docs
├── reports/       # Audit & status
└── archive/       # Legacy docs
```

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/strategy/FOUNDER_THESIS.md` | Why CodeOrbit exists |
| `docs/product/PRODUCT_DECISION_FRAMEWORK.md` | Feature decision filter |
| `docs/context/MASTER_CONTEXT.md` | Single source of truth |
| `docs/ai/AI_AGENT_RULES.md` | This file |

---

*Following these rules ensures CodeOrbit stays focused on its mission: Engineering Judgment Verification at scale.*
