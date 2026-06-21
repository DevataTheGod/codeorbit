# Glossary

Term definitions for consistent usage across CodeOrbit.

---

## Core Terms

### CodeOrbit
**Definition**: Learning Infrastructure Platform for bootcamps that measures and develops engineering judgment at scale.
**Category**: Product
**NOT**: LMS, bootcamp, AI copilot, browser IDE

### Orbit
**Definition**: The Socratic AI mentor that guides students through project-based learning using questioning, not code generation.
**Category**: Feature
**Also called**: Orbit AI, Orbit Mentor

### Understanding Score
**Definition**: Quantified measure of student comprehension across engagement (30%), explanation quality (40%), and progress (30%).
**Category**: Core Metric
**Formula**: `Overall = Engagement × 0.3 + Explanation × 0.4 + Progress × 0.3`

### Engineering Judgment
**Definition**: The ability to independently explain and defend project decisions, including tradeoffs, alternatives, and reasoning.
**Category**: North Star
**Measurement**: Understanding Score

### Reflection Challenge
**Definition**: Prompt that requires students to explain their code or decisions in their own words, triggered by paste events, milestone completion, or concept verification.
**Category**: Feature
**Purpose**: Verify comprehension, detect AI-assisted learning

### Telemetry
**Definition**: Behavioral signals collected during student interaction, including paste events, typing patterns, time spent, and code explanations.
**Category**: System
**Purpose**: Detect AI-assisted learning, inform Understanding Score

### Mentor Intelligence
**Definition**: System capabilities that scale mentor effectiveness, including cohort dashboards, risk alerts, conversation summaries, and placement predictions.
**Category**: Feature
**Purpose**: Enable one mentor to support 50+ students

### Roadmap Generator
**Definition**: AI-powered system that creates structured project breakdowns from high-level goals, producing milestones with tasks, concepts, and success criteria.
**Category**: Feature
**Input**: Goal + tech stack + timeline + experience level

---

## Technical Terms

### Learning Infrastructure Platform
**Definition**: B2B SaaS category for tools that support technical training organizations in measuring and improving learning outcomes.
**Category**: Category
**NOT**: LMS, course platform, content delivery

### Socratic Method
**Definition**: Teaching approach where the mentor asks clarifying questions to guide students toward understanding, rather than providing direct answers.
**Category**: Pedagogy
**Used by**: Orbit AI

### Row-Level Security (RLS)
**Definition**: Supabase/PostgreSQL feature that restricts data access based on user roles and policies.
**Category**: Security
**Used in**: All database tables

### Edge Functions
**Definition**: Serverless functions running on Supabase's Deno runtime, used for AI chat and milestone generation.
**Category**: Infrastructure
**Location**: `supabase/functions/`

### Lovable AI Gateway
**Definition**: Third-party API gateway that provides access to Gemini 2.5 Flash for AI capabilities.
**Category**: Infrastructure
**NOT**: Claude, OpenAI

---

## Business Terms

### Pilot
**Definition**: 4–8 week engagement with a bootcamp (30–50 students) to validate CodeOrbit's value proposition.
**Category**: GTM
**Price**: ₹2.5–5L ($3–6k USD)

### North Star Metric
**Definition**: The single most important metric that reflects CodeOrbit's core value: % of students who can independently explain and defend their project decisions.
**Category**: Metric
**Target**: 75%+ by Month 6

### Moat
**Definition**: Defensible competitive advantage: Pedagogy + Telemetry + Mentor Intelligence + Understanding Verification.
**Category**: Strategy
**NOT**: IDE, features, technology

---

## User Terms

### Student
**Definition**: Individual learning through CodeOrbit, typically enrolled in a bootcamp cohort.
**Category**: User
**Uses**: IDE, Orbit AI, Roadmap, Reflection Challenges

### Mentor
**Definition**: Bootcamp instructor who uses CodeOrbit to scale their effectiveness across 50+ students.
**Category**: User
**Uses**: Dashboard, Understanding Scores, Risk Alerts, Reports

### Bootcamp
**Definition**: Technical training organization (50–200 students/cohort) that is CodeOrbit's primary customer.
**Category**: Customer
**Buys**: Pilot → Growth → Enterprise tiers

---

## Anti-Patterns

### What NOT to Call Things

| Don't Use | Use Instead |
|-----------|-------------|
| "AI code generator" | "Socratic AI mentor" |
| "Learning management system" | "Learning Infrastructure Platform" |
| "Student tracking" | "Understanding verification" |
| "Cheating detection" | "AI-assisted learning detection" |
| "Student scoring" | "Engineering judgment measurement" |
| "IDE features" | "Supporting infrastructure" |

---

*This glossary ensures consistent terminology across all CodeOrbit documentation and communication.*
