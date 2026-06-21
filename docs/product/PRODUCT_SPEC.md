# Product Specification

CodeOrbit Product Requirements Document.

---

## Problem

Bootcamps cannot verify whether students actually understand their work.

**Three Pillars**:
1. Understanding is unverifiable (4-12 week gap)
2. AI is making assessment worse (ChatGPT, Copilot)
3. Mentors don't scale (20 sustainable, 100+ impossible)

---

## Customer

**Emerging Bootcamps** (50-200 students/cohort)

**Decision-Makers**: Placement Head, Academic Head, Lead Mentors, Founder/CEO

**Budget**: ₹2.5-5L for pilot, ₹99-149/student/year for growth

---

## Product Definition

**Category**: Learning Infrastructure Platform (B2B SaaS)

**What It Is**:
- Measurement system for learning
- Guidance engine using Socratic method
- Scaling multiplier for mentors
- Verification system against AI cheating

**What It Is NOT**:
- LMS
- Bootcamp
- AI Copilot
- Browser IDE (core)

---

## Core Features (MVP)

### 1. Orbit Mentor (Socratic AI)

**User**: Students

**Behavior**:
- Asks clarifying questions, never gives solutions
- Detects paste events and challenges understanding
- Generates mentor reports for human oversight

**Success Criteria**:
- 80%+ responses rated helpful by mentors
- Students ask Orbit questions (vs Stack Overflow)
- Mentors report better student questions

---

### 2. Understanding Score Dashboard

**User**: Mentors, Academic Heads

**Display**:
- Per-student understanding score (0-100%)
- Concept mastery breakdown
- Engagement metrics
- Risk assessment
- Telemetry flags

**Success Criteria**:
- 30%+ reduction in mentor review time
- Identify struggling students within 2 days
- Dashboard adoption > 90%

---

### 3. Project Roadmap Generator

**User**: Students, Mentors

**Input**: Goal + tech stack + timeline + experience level

**Output**: 5-7 milestones with 3-5 tasks each

**Success Criteria**:
- 80%+ students follow the roadmap
- Average task completion < 7 days
- Roadmaps match project complexity

---

### 4. Reflection Challenges

**User**: Students

**Triggers**:
- Post-paste: "Explain what this does"
- Post-milestone: "Describe your approach"
- Concept verification: "Explain X vs Y"

**Success Criteria**:
- 90%+ challenge response rate
- Average response score 75%+
- Concept mastery improves 10%+ monthly

---

### 5. Mentor Dashboard

**User**: Mentors

**Views**:
- Cohort overview (all students)
- Individual student details
- Risk alerts
- Conversation summaries

**Success Criteria**:
- Mentors use daily
- NPS > 50
- Placement prediction accuracy > 70%

---

### 6. Telemetry Engine

**System**: Background

**Signals**:
- Paste events
- Typing patterns
- Time per task
- Code explanations

**Success Criteria**:
- Detect AI-assisted learning with 80%+ accuracy
- False positive rate < 10%

---

### 7. Browser IDE

**User**: Students

**Features**:
- Monaco Editor
- File explorer
- AI chat panel
- Save to server

**Note**: Supporting infrastructure, not the moat.

---

## User Stories

### Student Stories

| Story | Acceptance Criteria |
|-------|---------------------|
| As a student, I want a clear project roadmap | Roadmap generated from intake form |
| As a student, I want help when stuck | Orbit provides Socratic guidance |
| As a student, I want to understand my progress | Understanding Score displayed |
| As a student, I want to explain my work | Reflection Challenges verify understanding |

### Mentor Stories

| Story | Acceptance Criteria |
|-------|---------------------|
| As a mentor, I want to see all students | Dashboard shows cohort overview |
| As a mentor, I want to identify struggling students | Risk alerts for students below 60% |
| As a mentor, I want to understand student progress | Conversation summaries available |
| As a mentor, I want to predict placement success | Placement prediction feature |

### Bootcamp Operator Stories

| Story | Acceptance Criteria |
|-------|---------------------|
| As an operator, I want to verify understanding | Understanding Score correlates with outcomes |
| As an operator, I want to scale mentorship | One mentor supports 50+ students |
| As an operator, I want to improve placement rates | 10%+ improvement in placement |
| As an operator, I want to detect AI cheating | Telemetry flags suspicious activity |

---

## Roadmap

### Phase 1: MVP (Month 1-2)
- Orbit Mentor (Socratic AI)
- Understanding Score Dashboard
- Project Roadmap Generator
- Basic Telemetry

### Phase 2: Pilot Refinement (Month 2-3)
- Reflection Challenges
- Mentor Dashboard
- Advanced Telemetry
- Anti-cheating system

### Phase 3: Scale with Proof (Month 4-6)
- Cohort management
- Placement prediction
- Curriculum analytics
- API for integrations

### Phase 4: Expansion (Month 6-12)
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

*This is the source of truth for CodeOrbit's product definition.*
