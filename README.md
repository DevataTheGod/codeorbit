# 🎓 CodeOrbit

> **"Stay in orbit. Master the code."**

CodeOrbit is an enterprise-grade, project-based educational SaaS platform. It combines a learning management dashboard, Socratic AI mentorship, and an in-browser IDE with Monaco Editor to deliver a guided learning environment. The platform ensures students write code themselves using plagiarism-detection telemetry and oral verification quiz modules.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Local Development](#local-development)
  - [Running Frontend](#running-frontend)
  - [Running Backend](#running-backend)
  - [Running Edge Functions](#running-edge-functions)
- [Deployment](#deployment)
- [CI/CD](#cicd)
- [User Roles](#user-roles)
- [API Overview](#api-overview)
- [Database Overview](#database-overview)
- [Documentation Index](#documentation-index)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🔍 Overview

In online software education, students often fall into **Tutorial Hell** (passively watching video lessons without coding) or **AI Copypasta** (asking chatbots to generate code, then copy-pasting it without learning). 

CodeOrbit breaks this cycle by combining structured milestones, Socratic guidance (where the AI chatbot, Orbit, asks questions rather than giving code), typing interval telemetry, and oral explanation defense modals.

---

## ✨ Features

- **VS Code-Style Browser IDE:** Multi-tab file explorer tree, editor, terminal, breadcrumbs, status bar, and search.
- **Socratic AI Mentor (Orbit):** Integrated side-panel assistant that guides code development without generating solutions.
- **Cheat Detection Telemetry:** Monitors typing intervals and copy-paste events. Large pasted blocks flag the student.
- **Oral Verification (Proof-of-Work):** Suspicious submissions trigger a code defense quiz modal. Orbit AI prompts the student to explain pasted lines.
- **Intake Generator:** Auto-generates customized milestones and tasks based on project stack and skill levels.
- **Mentor Reports:** Generates structured progress logs, strengths, weaknesses, and flags for review by human mentors.

---

## 🏗️ Architecture

CodeOrbit uses a React single-page application on the frontend, Supabase PostgreSQL on the database layer, Deno Edge Functions for LLM orchestration, and a Node/Express OTP delivery server.

For a detailed breakdown, see the [System Architecture Document](file:///home/dev/Desktop/projects/Project-Skill/docs/ARCHITECTURE.md).

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite 5, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Lucide React.
- **Backend:** Node.js, Express, tsx.
- **Database + Auth:** Supabase (PostgreSQL, JWT, Row-Level Security).
- **Edge Runtimes:** Supabase Deno Edge Functions.
- **AI Integration:** Google Gemini-2.5-Flash.
- **Transactional Mailer:** Resend.

---

## 📁 Folder Structure

```
project-root/
├── docs/                               # Consolidated Documentation Hub
│   ├── api/                            # REST & Edge Function APIs references
│   ├── database/                       # DB relationships, ERD, and setups
│   └── development/                    # Onboarding, workflows, and guidelines
├── database/                           # PostgreSQL Database Resources
│   ├── schema/                         # Schema declarations (.sql)
│   ├── migrations/                     # Supabase DB migrations
│   └── setup/                          # Triggers and sync helpers
├── frontend/                           # React Frontend Application Workspace
├── backend/                            # Express OTP Microservice Server
├── functions/                          # Supabase Deno Edge Functions
├── scripts/                            # Deployments & automation shell scripts
├── tests/                              # Integration chat simulator tests
├── config/                             # Env templates and configs
└── archive/                            # Deprecated/archived documentation
```

For a full breakdown of the layout, see [REPOSITORY_RESTRUCTURE.md](file:///home/dev/Desktop/projects/Project-Skill/REPOSITORY_RESTRUCTURE.md).

---

## ⚙️ Installation

Install all node dependencies inside the project root:
```bash
npm install
```

---

## 🔑 Environment Variables

Copy the template file to set up environment variables:
```bash
cp config/.env.example .env
```
For variable descriptions and values, see [ENVIRONMENT_VARIABLES.md](file:///home/dev/Desktop/projects/Project-Skill/docs/ENVIRONMENT_VARIABLES.md).

---

## 🗄️ Database Setup

To provision your Supabase PostgreSQL database:
1. Open the SQL editor in your Supabase project dashboard.
2. Execute the database initialization script: [COMPLETE_DATABASE_SCHEMA.sql](file:///home/dev/Desktop/projects/Project-Skill/database/schema/COMPLETE_DATABASE_SCHEMA.sql).
3. Execute the automated profile sync trigger script: [CREATE_USER_TRIGGER.sql](file:///home/dev/Desktop/projects/Project-Skill/database/setup/CREATE_USER_TRIGGER.sql).

See [DATABASE_SETUP_GUIDE.md](file:///home/dev/Desktop/projects/Project-Skill/database/DATABASE_SETUP_GUIDE.md) for more details.

---

## 💻 Local Development

For complete local instructions, see [LOCAL_DEVELOPMENT.md](file:///home/dev/Desktop/projects/Project-Skill/docs/LOCAL_DEVELOPMENT.md).

### Running Frontend
```bash
npm run dev
```
- Local URL: `http://localhost:8080`

### Running Backend
```bash
npm run otp-server
```
- Local URL: `http://localhost:8787`

### Running Edge Functions
Start local Supabase services:
```bash
supabase start
```

---

## 🚀 Deployment

We host the client on Vercel/Netlify, the Express server on Render/Fly.io, and the database/edge functions on Supabase.
See [DEPLOYMENT_GUIDE.md](file:///home/dev/Desktop/projects/Project-Skill/docs/DEPLOYMENT_GUIDE.md) for detailed deployment steps, and use the [Production Deployment Checklist](file:///home/dev/Desktop/projects/Project-Skill/DEPLOYMENT_CHECKLIST.md) before promoting builds.

---

## 🔄 CI/CD

Vite builds are integrated with webhooks triggered on git pushes. Supabase Edge Functions can be deployed automatically using GitHub actions:
```yaml
- name: Deploy Edge Function
  run: supabase functions deploy bodhit-chat --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
```

---

## 👥 User Roles

- **Student:** Intake configuration, milestone task completion, VFS coding, and AI assessments.
- **Mentor:** Assigned student list reviews, AI report grading, and student support.
- **Admin:** Permissions role assignments and platform usage analytics.

---

## 🔌 API Overview

- **`GET /`**: Server diagnostics ping.
- **`POST /send-otp`**: Delivery endpoint formatting and mailing OTP pins.
- **`POST /functions/v1/bodhit-chat`**: Orbit AI Socratic chat logic wrapper.
- **`POST /functions/v1/generate-milestones`**: Generates project roadmap milestones and tasks.

Review the [REST API Reference](file:///home/dev/Desktop/projects/Project-Skill/docs/api/API_REFERENCE.md) and [Edge Function Reference](file:///home/dev/Desktop/projects/Project-Skill/docs/api/EDGE_FUNCTION_REFERENCE.md).

---

## 🗄️ Database Overview

CodeOrbit runs on PostgreSQL:
- **`profiles` / `user_roles`**: User roles and metadata.
- **`project_submissions` / `milestones` / `tasks`**: Active roadmap tracks.
- **`conversations` / `messages`**: Chat history.
- **`mentor_reports` / `mentor_reviews`**: AI evaluation summaries.

Review [DATABASE_ARCHITECTURE.md](file:///home/dev/Desktop/projects/Project-Skill/docs/DATABASE_ARCHITECTURE.md) and the [Database Schema Map](file:///home/dev/Desktop/projects/Project-Skill/database/README.md).

---

## 📚 Documentation Index

All technical and architectural guides have been consolidated inside the `docs/` and `database/` folders:

- **Overview:** [docs/PROJECT_OVERVIEW.md](file:///home/dev/Desktop/projects/Project-Skill/docs/PROJECT_OVERVIEW.md)
- **Technical Architecture:** [docs/ARCHITECTURE.md](file:///home/dev/Desktop/projects/Project-Skill/docs/ARCHITECTURE.md)
- **Database Architecture:** [docs/DATABASE_ARCHITECTURE.md](file:///home/dev/Desktop/projects/Project-Skill/docs/DATABASE_ARCHITECTURE.md)
- **Database Setup Guide:** [database/DATABASE_SETUP_GUIDE.md](file:///home/dev/Desktop/projects/Project-Skill/database/DATABASE_SETUP_GUIDE.md)
- **Database Files Map:** [database/README.md](file:///home/dev/Desktop/projects/Project-Skill/database/README.md)
- **REST API Reference:** [docs/api/API_REFERENCE.md](file:///home/dev/Desktop/projects/Project-Skill/docs/api/API_REFERENCE.md)
- **Edge Functions Reference:** [docs/api/EDGE_FUNCTION_REFERENCE.md](file:///home/dev/Desktop/projects/Project-Skill/docs/api/EDGE_FUNCTION_REFERENCE.md)
- **Authentication Flows:** [docs/AUTHENTICATION.md](file:///home/dev/Desktop/projects/Project-Skill/docs/AUTHENTICATION.md)
- **Feature Walkthroughs:** [docs/FEATURE_DOCUMENTATION.md](file:///home/dev/Desktop/projects/Project-Skill/docs/FEATURE_DOCUMENTATION.md)
- **Local Onboarding:** [docs/LOCAL_DEVELOPMENT.md](file:///home/dev/Desktop/projects/Project-Skill/docs/LOCAL_DEVELOPMENT.md)
- **Environment Variables:** [docs/ENVIRONMENT_VARIABLES.md](file:///home/dev/Desktop/projects/Project-Skill/docs/ENVIRONMENT_VARIABLES.md)
- **Deployment Guide:** [docs/DEPLOYMENT_GUIDE.md](file:///home/dev/Desktop/projects/Project-Skill/docs/DEPLOYMENT_GUIDE.md)
- **Deployment Checklist:** [DEPLOYMENT_CHECKLIST.md](file:///home/dev/Desktop/projects/Project-Skill/DEPLOYMENT_CHECKLIST.md)
- **Security Protocols:** [docs/SECURITY.md](file:///home/dev/Desktop/projects/Project-Skill/docs/SECURITY.md)
- **Troubleshooting FAQ:** [docs/TROUBLESHOOTING.md](file:///home/dev/Desktop/projects/Project-Skill/docs/TROUBLESHOOTING.md)

---

## 🔧 Troubleshooting

For common build errors, CORS origin policies mismatches, or database synchronizations errors, check our [Troubleshooting Guide](file:///home/dev/Desktop/projects/Project-Skill/docs/TROUBLESHOOTING.md).

---

## 🤝 Contributing

Contributions are welcome! Please check the guidelines in [CONTRIBUTING.md](file:///home/dev/Desktop/projects/Project-Skill/CONTRIBUTING.md).

---

## 📄 License

CodeOrbit is licensed under the MIT License. See [LICENSE](file:///home/dev/Desktop/projects/Project-Skill/LICENSE) for more details.
