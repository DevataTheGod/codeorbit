# 📜 Changelog

All notable changes to CodeOrbit will be documented here.

---

## [1.1.0] - 2026-06-18

### Cleaned
- Removed all pre-rebrand legacy documentation ("Forge Learn", "BODHIT", "Lovable API" references).
- Deleted redundant files: `REPOSITORY_RESTRUCTURE.md`, `AUDIT_REPORT.md`, `DEPLOYMENT_CHECKLIST.md`, `SCHEMA_SQL_TO_EXECUTE.sql`, legacy `OTP_SETUP_GUIDE.md` (nodemailer/Gmail App Password approach).
- Consolidated 4 overlapping database setup guides into a single `database/DATABASE_SETUP_GUIDE.md`.
- Removed `lovable-tagger` from `devDependencies`.
- Rewrote `README.md` — concise, table-driven, accurate.
- Rewrote `docs/DEPLOYMENT_GUIDE.md` — reflects actual Resend + Gemini + Supabase stack.
- Rewrote `docs/integrations/GOOGLE_AUTH_OTP_SETUP.md` — covers actual Supabase Auth + Resend approach.
- Rewrote `docs/development/CONVERSATION_PERSISTENCE_GUIDE.md` — accurate hook/service API reference.

---

## [1.0.0] - 2026-06-18

### Added
- Vertical navigation bar [`ActivityBar.tsx`](frontend/src/components/ide/ActivityBar.tsx).
- Open-file tab management [`FileTabs.tsx`](frontend/src/components/ide/FileTabs.tsx).
- Bottom status panel [`StatusBar.tsx`](frontend/src/components/ide/StatusBar.tsx) with cursor line/column.
- Path breadcrumbs [`Breadcrumbs.tsx`](frontend/src/components/ide/Breadcrumbs.tsx).
- Local file upload in [`FileOperationsPanel.tsx`](frontend/src/components/ide/FileOperationsPanel.tsx).
- Cursor telemetry monitoring in [`CodeEditor.tsx`](frontend/src/components/ide/CodeEditor.tsx).

### Changed
- Rebranded platform from "Forge Learn" / "BODHIT" → **CodeOrbit** / **Orbit AI**.
- Restructured workspace: `frontend/`, `backend/`, `database/`, `functions/`, `docs/`.
- Aligned `tsconfig.json`, `tailwind.config.ts`, `vite.config.ts`, and `components.json` to new paths.

### Fixed
- File selection tab sync bug in [`IDEWorkspace.tsx`](frontend/src/components/ide/IDEWorkspace.tsx).
