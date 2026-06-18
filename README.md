# 🎓 CodeOrbit

> **"Stay in orbit. Master the code."**

CodeOrbit is an enterprise-grade, project-based educational SaaS platform. It combines a learning management dashboard, Socratic AI mentorship (Orbit), and an in-browser VS Code-like IDE to ensure students write every line of code themselves.

---

## ✨ Core Features

| Feature | Description |
|---|---|
| **Browser IDE** | Monaco Editor with file tree, tabs, terminal, breadcrumbs, and status bar |
| **Orbit AI (Socratic)** | Side-panel AI that asks questions, never writes code |
| **Cheat Detection** | Paste event monitoring and keystroke telemetry |
| **Proof-of-Work Quiz** | Oral code defense modal triggered by suspicious paste activity |
| **AI Milestone Generator** | Gemini auto-generates a project roadmap from a student's intake form |
| **Mentor Reports** | AI-generated progress summaries for human mentor review |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 + Tailwind CSS + shadcn/ui |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Auth + DB | Supabase (PostgreSQL + JWT + Row-Level Security) |
| Edge Functions | Supabase Deno (Gemini-2.5-Flash) |
| Backend | Node.js / Express (OTP micro-server) |
| Email | Resend |

---

## 📁 Project Structure

```
Project-Skill/
├── frontend/                   # React SPA (Vite)
│   └── src/
│       ├── pages/              # Route-level page components
│       ├── components/ide/     # VS Code-like IDE components
│       ├── hooks/              # Auth, telemetry, file system hooks
│       └── services/           # Supabase, GitHub, OTP, VFS services
├── backend/                    # Express OTP microservice
├── functions/                  # Supabase Deno Edge Functions
│   ├── bodhit-chat/            # Orbit AI Socratic chat
│   └── generate-milestones/    # AI roadmap generator
├── database/
│   ├── schema/                 # Full PostgreSQL schema
│   ├── migrations/             # Supabase migration history
│   └── setup/                  # Trigger scripts and patch helpers
├── docs/                       # Developer documentation
├── scripts/                    # Deployment shell scripts
├── tests/                      # Chatbot simulation tests
└── config/                     # Env templates
```

---

## ⚙️ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set environment variables
```bash
cp config/.env.example .env
# Fill in values — see docs/ENVIRONMENT_VARIABLES.md
```

### 3. Set up the database
Run in Supabase SQL Editor (in order):
1. `database/schema/COMPLETE_DATABASE_SCHEMA.sql`
2. `database/setup/CREATE_USER_TRIGGER.sql`

See [DATABASE_SETUP_GUIDE.md](database/DATABASE_SETUP_GUIDE.md) for details.

### 4. Run locally (two terminals)
```bash
npm run dev          # Frontend → http://localhost:8080
npm run otp-server   # Express OTP server → http://localhost:8787
```

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Student** | Submit project → Get AI roadmap → Code in IDE → AI assessment |
| **Mentor** | Review students, grade AI reports, respond to help flags |
| **Admin** | Manage roles, view platform analytics |

---

## 🔌 API Reference

| Endpoint | Service | Description |
|---|---|---|
| `GET /` | Express | Health check |
| `POST /send-otp` | Express | OTP delivery via Resend |
| `POST /functions/v1/bodhit-chat` | Deno | Orbit AI Socratic chat |
| `POST /functions/v1/generate-milestones` | Deno | AI roadmap generation |

See [docs/api/API_REFERENCE.md](docs/api/API_REFERENCE.md) for full schemas.

---

## 📚 Documentation Index

| Document | Location |
|---|---|
| System Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Database Architecture | [docs/DATABASE_ARCHITECTURE.md](docs/DATABASE_ARCHITECTURE.md) |
| Database Setup | [database/DATABASE_SETUP_GUIDE.md](database/DATABASE_SETUP_GUIDE.md) |
| Environment Variables | [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) |
| Authentication Flows | [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) |
| Feature Walkthroughs | [docs/FEATURE_DOCUMENTATION.md](docs/FEATURE_DOCUMENTATION.md) |
| Local Development | [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md) |
| Deployment Guide | [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) |
| Security | [docs/SECURITY.md](docs/SECURITY.md) |
| Troubleshooting | [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) |
| OTP & Google Auth | [docs/integrations/GOOGLE_AUTH_OTP_SETUP.md](docs/integrations/GOOGLE_AUTH_OTP_SETUP.md) |
| Conversation Persistence | [docs/development/CONVERSATION_PERSISTENCE_GUIDE.md](docs/development/CONVERSATION_PERSISTENCE_GUIDE.md) |
| REST API Reference | [docs/api/API_REFERENCE.md](docs/api/API_REFERENCE.md) |
| Edge Function Reference | [docs/api/EDGE_FUNCTION_REFERENCE.md](docs/api/EDGE_FUNCTION_REFERENCE.md) |

---

## 🚀 Deployment

Host the frontend on **Vercel/Netlify**, the Express server on **Render/Fly.io**, and the database/Edge Functions on **Supabase**.

See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for step-by-step instructions.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for coding guidelines and branch conventions.

---

## 📄 License

MIT — see [LICENSE](LICENSE).
