# 📜 Changelog

All notable changes to the CodeOrbit project will be documented in this file.

---

## [1.0.0] - 2026-06-18

### Added
- Created vertical vertical navigation [ActivityBar.tsx](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/components/ide/ActivityBar.tsx).
- Created [FileTabs.tsx](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/components/ide/FileTabs.tsx) to manage open virtual filesystem documents.
- Created status panel [StatusBar.tsx](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/components/ide/StatusBar.tsx) showing cursor line/column coordinates and branches.
- Created breadcrumbs panel [Breadcrumbs.tsx](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/components/ide/Breadcrumbs.tsx).
- Created local files upload capability in [FileOperationsPanel.tsx](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/components/ide/FileOperationsPanel.tsx).
- Added cursor position telemetry monitoring in Monaco [CodeEditor.tsx](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/components/ide/CodeEditor.tsx).

### Changed
- Rebranded the platform from "Forge Learn" / "BODHIT" to **CodeOrbit** and **Orbit AI**.
- Restructured workspace directory layout: moved frontend elements under `/frontend`, backend Express mailer under `/backend`, database SQL setups under `/database`, edge functions under `/functions`, and consolidated documentation under `/docs`.
- Standardized configuration scopes in `tsconfig.json`, `tailwind.config.ts`, `vite.config.ts`, and `components.json`.

### Fixed
- Resolved file selection tab synchronization bug in [IDEWorkspace.tsx](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/components/ide/IDEWorkspace.tsx).
