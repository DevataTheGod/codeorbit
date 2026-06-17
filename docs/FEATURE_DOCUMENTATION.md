# 🚀 CodeOrbit — Feature Documentation

This document explains the key capabilities and user workflows of CodeOrbit.

---

## 1. Project Intake & Roadmap Generator

- **Student Onboarding:** Students submit their project idea, target stack, experience level, and timeline via `/submit-project`.
- **Milestone Generator:** The backend calls `generate-milestones` Edge Function. Gemini splits the description into a structured, step-by-step roadmap of **Milestones** and **Tasks** stored directly in the database.

---

## 2. Browser-Based IDE Workspace

CodeOrbit includes a zero-config, VS Code-like coding workspace at `/ide`:
- **Filesystem Tree:** Create, delete, rename, and drag-and-drop virtual files saved in the browser's `localStorage` state.
- **Monaco Editor:** Syntax highlighting, brackets matching, and code suggestions.
- **Dynamic File Tabs:** Work on multiple files concurrently using tab layouts.
- **Interactive Terminal:** Simulates terminal command executions.
- **Orbit AI Integration:** Orbit is embedded directly in the side panel of the editor, giving context-aware Socratic help based on the code you are editing.

---

## 3. Plagiarism Telemetry & Code Explanation Modal

- **Paste Detection:** If the IDE detects a block copy-paste event, the workspace flags the milestone as "suspicious" and activates an alert banner.
- **Code Quiz (POW Verification):** When the student clicks "Submit for Review," they must explain their code changes via the [CodeExplanationModal.tsx](file:///home/dev/Desktop/projects/Project-Skill/frontend/src/components/ide/CodeExplanationModal.tsx). Orbit quizzes the student on the pasted code. Passing verifies the work, while failing flags it for review.

---

## 4. Mentor Review System

- **Dashboard Review:** Mentors can view all students, their roadmap statuses, help flags, and chat transcripts.
- **AI Mentor Reports:** Orbit generates reports summarizing the student's understanding, strengths, weaknesses, and potential plagiarism. Mentors read these reports to easily catch students who need assistance.
