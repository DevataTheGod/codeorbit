# 🗺️ CodeOrbit — Repository Restructuring Map (REPOSITORY_RESTRUCTURE.md)

This document maps the restructuring of the CodeOrbit workspace from the legacy cluttered structure to the enterprise-grade organized layout.

---

## 1. Directory Layout

The repository has been restructured into the following directory tree:

```
project-root/
├── README.md                           # Rebuilt project root navigation hub
├── CONTRIBUTING.md                     # Code of conduct and dev workflows
├── CHANGELOG.md                        # Version history and audits logs
├── LICENSE                             # License agreement (MIT)
│
├── frontend/                           # React Frontend Application Workspace
│   ├── index.html                      # HTML entry point (Vite root)
│   ├── public/                         # Public assets (favicon, svgs)
│   └── src/                            # React frontend source files (pages, components)
│
├── backend/                            # Express OTP Microservice Server
│   ├── server.ts                       # Server entry point
│   └── routes/                         # Express routing files
│
├── database/                           # PostgreSQL Database Resources
│   ├── schema/                         # Schema declarations (.sql)
│   ├── migrations/                     # Supabase DB schema migrations
│   └── setup/                          # Miscellaneous setup scripts and trigger fixes
│
├── functions/                          # Supabase Deno Edge Functions
│   ├── bodhit-chat/                    # Socratic tutor edge function
│   └── generate-milestones/            # Milestone builder edge function
│
├── docs/                               # Consolidated Documentation Hub
│   ├── architecture/                   # VFS, Telemetry, and design docs
│   ├── api/                            # REST & Edge Function APIs references
│   ├── database/                       # DB relationships, ERD, and setups
│   ├── deployment/                     # Production checklist and setup
│   ├── development/                    # Onboarding, workflows, and guidelines
│   ├── integrations/                   # OTP, Resend, and Auth guides
│   ├── troubleshooting/                # Common bugs and solutions
│   └── reports/                        # Chat simulations results
│
├── scripts/                            # Deployments & automation shell scripts
├── tests/                              # Integration chat simulator tests
├── config/                             # Env templates and configs
└── archive/                            # Deprecated/archived documentation
```

---

## 2. File Migration Map

The table below shows the exact migrations that were performed to achieve the restructured layout:

| Old Path | New Path | Action / Category |
|---|---|---|
| `/src/backend/server.ts` | `/backend/server.ts` | Move / Separated Server |
| `/src/backend/routes/googleAuthOTP.ts` | `/backend/routes/googleAuthOTP.ts` | Move / Separated Server |
| `/index.html` | `/frontend/index.html` | Move / Fronted Root |
| `/public/` | `/frontend/public/` | Move / Frontend Assets |
| `/src/` (excluding backend) | `/frontend/src/` | Move / Frontend SPA |
| `/supabase/functions/` | `/functions/` | Move / Edge Functions (Symlinked) |
| `/supabase/migrations/` | `/database/migrations/` | Move / Migrations (Symlinked) |
| `/COMPLETE_DATABASE_SCHEMA.sql` | `/database/schema/COMPLETE_DATABASE_SCHEMA.sql` | Move / Schema SQL |
| `/SCHEMA_SQL_TO_EXECUTE.sql` | `/database/schema/SCHEMA_SQL_TO_EXECUTE.sql` | Move / Schema SQL |
| `/CREATE_MISSING_DASHBOARD_TABLES.sql` | `/database/setup/CREATE_MISSING_DASHBOARD_TABLES.sql` | Move / Setup SQL |
| `/CREATE_MISSING_HELP_REQUESTS_TABLE.sql` | `/database/setup/CREATE_MISSING_HELP_REQUESTS_TABLE.sql` | Move / Setup SQL |
| `/CREATE_OLD_CHAT_MESSAGES_TABLE.sql` | `/database/setup/CREATE_OLD_CHAT_MESSAGES_TABLE.sql` | Move / Setup SQL |
| `/CREATE_USER_TRIGGER.sql` | `/database/setup/CREATE_USER_TRIGGER.sql` | Move / Setup SQL |
| `/FIX_DATABASE_SYNC.sql` | `/database/setup/FIX_DATABASE_SYNC.sql` | Move / Setup SQL |
| `/deploy.sh` | `/scripts/deploy.sh` | Move / Deployment Script |
| `/deploy.bat` | `/scripts/deploy.bat` | Move / Deployment Script |
| `/test-chatbot-simulation.ts` | `/tests/test-chatbot-simulation.ts` | Move / Test Suite |
| `/CHATBOT_SIMULATION_RESULTS.md` | `/docs/reports/CHATBOT_SIMULATION_RESULTS.md` | Move / Report Doc |
| `/CONVERSATION_PERSISTENCE_GUIDE.md` | `/docs/development/CONVERSATION_PERSISTENCE_GUIDE.md` | Move / Development Guide |
| `/CSV_DATA_IMPORT_GUIDE.md` | `/docs/database/CSV_DATA_IMPORT_GUIDE.md` | Move / Database Guide |
| `/DATABASE_COMPARISON.md` | `/docs/database/DATABASE_COMPARISON.md` | Move / Database Guide |
| `/DATABASE_MIGRATION_GUIDE.md` | `/docs/database/DATABASE_MIGRATION_GUIDE.md` | Move / Database Guide |
| `/DATABASE_SETUP_CHECKLIST.md` | `/docs/database/DATABASE_SETUP_CHECKLIST.md` | Move / Database Guide |
| `/DEPLOYMENT_GUIDE.md` | `/docs/deployment/DEPLOYMENT_GUIDE.md` | Move / Deployment Guide |
| `/EXECUTE_SCHEMA_QUICK_GUIDE.md` | `/docs/database/EXECUTE_SCHEMA_QUICK_GUIDE.md` | Move / Database Guide |
| `/GOOGLE_AUTH_OTP_SETUP.md` | `/docs/integrations/GOOGLE_AUTH_OTP_SETUP.md` | Move / Integration Guide |
| `/IDE_FILE_SYSTEM_GUIDE.md` | `/docs/architecture/IDE_FILE_SYSTEM_GUIDE.md` | Move / Architecture Guide |
| `/OTP_IMPLEMENTATION_GUIDE.md` | `/docs/architecture/OTP_IMPLEMENTATION_GUIDE.md` | Move / Architecture Guide |
| `/OTP_SETUP_GUIDE.md` | `/docs/integrations/OTP_SETUP_GUIDE.md` | Move / Integration Guide |
| `/REQUIREMENTS.md` | `/docs/development/REQUIREMENTS.md` | Move / Development Guide |
| `/TABLE_MAPPING_GUIDE.md` | `/docs/database/TABLE_MAPPING_GUIDE.md` | Move / Database Guide |
| `/TODO.md` | `/docs/development/TODO.md` | Move / Roadmap |
| `/API_ENDPOINTS_REFERENCE.ts` | `/docs/api/API_ENDPOINTS_REFERENCE.ts` | Move / API Guide |
| `/CREDENTIALS_AND_CODE_CHANGES.md` | `/archive/CREDENTIALS_AND_CODE_CHANGES.md` | Move / Legacy Logs |
| `/.env.example` | `/config/.env.example` | Copy / Configuration Template |

---

## 3. Configuration Syncing Actions
- **Vite Configuration (`vite.config.ts`):** Modified path alias `"@"` to point to `./frontend/src` and set `root: "frontend"`, outputting builds to `../dist`.
- **TypeScript Configs (`tsconfig.json`, `tsconfig.app.json`):** Updated module paths `@/*` to target `./frontend/src/*` and adjusted inclusions.
- **shadcn CLI Config (`components.json`):** Re-pointed CSS configuration key to target `frontend/src/index.css`.
- **Tailwind Config (`tailwind.config.ts`):** Updated `content` lookup array to map `frontend/pages`, `frontend/components`, and `frontend/src` files.
- **Project scripts (`package.json`):** Adjusted the `"otp-server"` command to run `tsx backend/server.ts`.
