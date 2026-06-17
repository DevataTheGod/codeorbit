# 🛡️ CodeOrbit — Security Architecture

This document outlines the security controls, authentication rules, database isolation layers, and integrity validations implemented in CodeOrbit.

---

## 1. Row-Level Security (RLS) & Role Access Controls

All data tables run on Row-Level Security:
- **Profile Secrecy:** Student profiles are visible but modification queries (`UPDATE`/`DELETE`) are constrained strictly to `auth.uid() = id`.
- **Intake Isolation:** A student can only view and update their own `project_submissions`, `milestones`, `tasks`, and chat logs.
- **Mentor Boundaries:** Mentor access is authorized using a custom SQL function `has_role('mentor', auth.uid())` checking permission mappings in the database.

---

## 2. API & Secrets Protection

- **Express Endpoint Authentication:** The Express mailer microservice handles email dispatches. Direct calls are blocked unless validated with the custom header `x-api-key`.
- **JWT Storage Best Practices:** Currently, frontend mocks save session JWT tokens in `localStorage`. For production, it is highly recommended to transition authorization routes to set `httpOnly` secure cookies from the Express server. This mitigates Cross-Site Scripting (XSS) token theft.

---

## 3. Academic Integrity & Anti-Cheat Telemetry

To ensure that the student is actually typing and writing their code:
- **Typing telemetry:** [useTelemetry.ts](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/hooks/useTelemetry.ts) monitors keystroke timestamps. Instantly pasted blocks of code are flagged.
- **Socratic Code Defense:** Pasted codes trigger Socratic oral exams where Orbit AI quizzes the student. Task locks can only be manually released by human mentors in the [MentorDashboard.tsx](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/pages/MentorDashboard.tsx).
