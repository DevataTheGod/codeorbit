# Product Context

How CodeOrbit becomes a product.

---

## What CodeOrbit Is

A **Learning Infrastructure Platform** that measures and develops engineering judgment at scale.

---

## What CodeOrbit Is NOT

- ❌ LMS — We don't manage courses
- ❌ Bootcamp — We don't teach coding
- ❌ AI Copilot — We never write solutions
- ❌ Browser IDE (core) — VS Code is free; not our moat
- ❌ Video Platform — We don't believe in passive content

---

## Product Hierarchy

### Tier 1: Core Differentiators (The Moat)

| Feature | Purpose |
|---------|---------|
| **Understanding Score** | Quantified comprehension, not completion |
| **Orbit Mentor** | Socratic method forces thinking |
| **Telemetry** | Detects AI-assisted learning |
| **Mentor Intelligence** | Scales mentorship to 100+ students |

### Tier 2: Supporting Features

| Feature | Purpose |
|---------|---------|
| **Reflection Challenges** | Verifies comprehension through explanation |
| **Project Roadmap Generator** | Structured learning paths |
| **Mentor Dashboard** | Cohort visibility and risk alerts |

### Tier 3: Infrastructure

| Feature | Purpose |
|---------|---------|
| **Browser IDE** | Development environment |
| **Authentication** | User management |
| **OTP Service** | Email verification |

---

## Core Features (MVP)

### 1. Orbit Mentor (Socratic AI)

**Behavior**:
- Asks clarifying questions, never gives solutions
- Detects paste events and challenges understanding
- Generates mentor reports for human oversight

**Example**:
```
Student: "How do I authenticate users?"
Orbit: "What data needs to be protected? What are the common ways to verify identity?"
```

### 2. Understanding Score

**Formula**:
```
Overall = Engagement × 0.3 + Explanation × 0.4 + Progress × 0.3
```

**Dimensions**:
- Engagement: Orbit interactions, time spent, questions asked
- Explanation: Reflection challenge responses, code explanations
- Progress: Milestones completed, tasks finished

### 3. Reflection Challenges

**Triggers**:
- Post-paste: "I notice you pasted code. Explain what this does."
- Post-milestone: "Describe your implementation approach."
- Concept verification: "What is the difference between X and Y?"

### 4. Mentor Dashboard

**Views**:
- Individual student: Understanding Score, concept mastery, risk level
- Cohort overview: Distribution of scores, students needing attention
- Placement prediction: Which students will likely fail interviews

### 5. Project Roadmap Generator

**Input**: Goal + tech stack + timeline + experience level
**Output**: 5–7 milestones with 3–5 tasks each

### 6. Telemetry Engine

**Signals**:
- Paste events and paste-to-code ratio
- Typing patterns and speed
- Code explanation quality
- Time spent per task

---

## Understanding Score Philosophy

**Core Principle**: Measure comprehension, not completion.

**What It Measures**:
- Can the student explain what they built?
- Do they understand the tradeoffs?
- Can they debug without copying?

**What It Doesn't Measure**:
- Lines of code written
- Features shipped
- Time spent in platform

**Anti-Metrics** (what we DON'T optimize):
- Total code lines
- Number of commits
- IDE complexity
- Time on platform (without learning)

---

## Product Roadmap

### Phase 1: MVP (Month 1–2)
- Orbit Mentor (Socratic AI)
- Understanding Score Dashboard
- Project Roadmap Generator
- Basic Telemetry

### Phase 2: Pilot Refinement (Month 2–3)
- Reflection Challenges
- Mentor Dashboard
- Advanced Telemetry
- Anti-cheating system

### Phase 3: Scale with Proof (Month 4–6)
- Cohort management
- Placement prediction
- Curriculum analytics
- API for integrations

### Phase 4: Expansion (Month 6–12)
- University partnerships
- Corporate training
- Certification system
- Marketplace for mentors

---

## Definition of Done

Every feature must:
- [ ] Code reviewed
- [ ] 70%+ unit test coverage
- [ ] Integration tests passing
- [ ] Staging tested
- [ ] Performance tested
- [ ] Documentation updated
- [ ] WCAG 2.1 AA accessible
- [ ] Production monitoring
- [ ] User feedback collected

---

*This document defines what CodeOrbit is as a product. Feature decisions should reference PRODUCT_DECISION_FRAMEWORK.md.*
