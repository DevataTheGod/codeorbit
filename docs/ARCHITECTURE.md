# 🏗️ CodeOrbit — System Architecture

This document outlines the software design, runtime environments, and core subsystems of CodeOrbit.

---

## 1. Overall System Architecture

CodeOrbit is structured as a decoupled full-stack application. The client is a React SPA built on Vite, communicating with Supabase PostgreSQL and Edge Functions, supported by an Express OTP mailer server.

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (React + Vite)                   │
│   ┌───────────────┐     ┌───────────────┐     ┌──────────┐  │
│   │   Pages &     │     │  Browser IDE  │     │ Telemetry│  │
│   │  Dashboards   │     │ (Monaco + VFS)│     │  Hook    │  │
│   └───────────────┘     └───────────────┘     └──────────┘  │
└──────────────────────┬───────────────────────────────┬──────┘
                       │                               │
                Supabase Client                  Direct REST
                       │                               │
┌──────────────────────▼──────────────────────┐ ┌──────▼──────┐
│                  BACKEND                    │ │  LOCAL INF  │
│  ┌───────────────┐  ┌────────────────────┐  │ │ ┌─────────┐ │
│  │  PostgreSQL   │  │   Edge Functions   │  │ │ │ Express │ │
│  │   Database    │  │ (bodhit-chat,      │  │ │ │   OTP   │ │
│  │  (RLS+Roles)  │  │  gen-milestones)   │  │ │ │ Server  │ │
│  └───────────────┘  └────────────────────┘  │ │ └─────────┘ │
└─────────────────────────────────────────────┘ └─────────────┘
```

---

## 2. In-Browser Virtual Filesystem (VFS)

Since CodeOrbit runs entirely in the browser without server-side compute containers, it implements an in-memory virtual filesystem:
- **Service Layer ([IDEFileSystem.ts](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/services/IDEFileSystem.ts)):** Maps files and folder structures to a nested JSON object representation. It handles file operations like folder creation, file deletion, and renaming.
- **State Layer ([useProjectFiles.tsx](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/hooks/useProjectFiles.tsx)):** Provides React contexts that broadcast file states, active file selections, and handles automatic saving.
- **Persistence:** All VFS data is auto-saved on keystroke and persisted in the user's browser `localStorage` under the namespace key `CODEORBIT_IDE_FILES`.

---

## 3. Monaco Editor Integration

The code editor utilizes Microsoft's `@monaco-editor/react` library, offering VS Code features inside the browser:
- **Tab Synchronization:** Horizontal [FileTabs.tsx](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/components/ide/FileTabs.tsx) show open files. Selecting a file loads its content into Monaco. Closing a tab updates the active editor page.
- **Dynamic Syntax Highlighting:** Resolves language types (`typescript`, `javascript`, `json`, `markdown`, `css`, `html`) based on file path extensions.
- **Active Cursor Tracking:** Listens to Monaco's `onDidChangeCursorPosition` event. The cursor line and column coordinates are piped directly to the bottom status bar in real-time.

---

## 4. Telemetry & Anti-Cheat Subsystem

To verify that students are writing their code manually:
- **Plagiarism Telemetry Hook ([useTelemetry.ts](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/hooks/useTelemetry.ts)):**
  - Measures keystroke typing intervals (milliseconds between key presses).
  - Captures paste events. If a user pastes a block of code, it analyzes the length. If a block of code (>50 characters) is inserted instantly, it sets a `suspiciousActivity` flag.
  - Activates a persistent blinking `CHEAT DETECTION ACTIVE` warning overlay inside the IDE.
- **Proof-of-Work Oral Exam ([CodeExplanationModal.tsx](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/components/ide/CodeExplanationModal.tsx)):**
  - Prompted on submission if cheat indicators are active.
  - Orbit AI quizzes the student, requesting an explanation of specific parts of the code they pasted.
  - If the student fails the assessment, the task status is locked, preventing progression until reviewed by a human mentor.
