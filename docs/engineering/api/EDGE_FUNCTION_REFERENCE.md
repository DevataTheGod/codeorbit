# ⚡ CodeOrbit — Deno Edge Functions Reference (EDGE_FUNCTION_REFERENCE.md)

This document provides details for the Supabase Deno Edge Functions deployed on the CodeOrbit backend.

---

## 1. Edge Function: `orbit-chat`

Processes chat communication between the student and Orbit AI, enforcing the Socratic teaching style and evaluating coding telemetry.

- **URL Endpoint:** `POST <SUPABASE_URL>/functions/v1/orbit-chat`
- **JWT Verification:** Disabled (`verify_jwt = false` for initial intake configuration)
- **Model:** `google/gemini-2.5-flash`
- **Request Body:**
  ```json
  {
    "messages": [
      { "role": "user", "content": "How do I implement JWT token verification?" }
    ],
    "currentTask": "Setup Auth Controller",
    "files": {
      "/src/controllers/auth.ts": {
        "content": "const login = async () => {};"
      }
    },
    "telemetry": {
      "typingSpeed": 45,
      "pasteEvents": 1,
      "suspiciousActivity": true
    }
  }
  ```

- **Socratic System Rules Enforced:**
  - **No Direct Code Generation:** Orbit is strictly forbidden from writing code snippets. It must explain the logic and concepts instead.
  - **Telemetry Check:** If `suspiciousActivity` is `true`, Orbit transitions into "Verification Mode" and initiates a Socratic explanation challenge.
  - **Report Generation:** Automatically outputs JSON-formatted reviews saved directly to the `mentor_reports` database table.

- **Response Body (Streaming/JSON):**
  ```json
  {
    "text": "Before we look at the verification middleware, can you explain what steps occur when a token is unpacked?",
    "messageType": "question",
    "mentorReport": {
      "milestoneName": "JWT Setup",
      "understandingLevel": "Struggling",
      "strengths": ["Understands route syntax"],
      "weakAreas": ["Doesn't understand signing keys"],
      "redFlags": ["Pasted code block from external source"]
    }
  }
  ```

---

## 2. Edge Function: `generate-milestones`

Triggered upon new project submissions from the student intake form. It parses descriptions to construct structured learning tracks.

- **URL Endpoint:** `POST <SUPABASE_URL>/functions/v1/generate-milestones`
- **Request Body:**
  ```json
  {
    "submissionId": "uuid-string",
    "title": "Build a Task Manager API",
    "description": "I want to build a backend system using Express and PostgreSQL that allows users to register, log in, and perform CRUD operations on tasks.",
    "techStack": ["Node.js", "Express", "PostgreSQL"],
    "skillLevel": "beginner",
    "duration": "4 weeks"
  }
  ```

- **Processing Behavior:**
  - Invokes Gemini to decompose the user's project details into 4-6 sequential Milestones.
  - Decomposes each Milestone into 3-5 specific coding Tasks.
  - Persists the milestones and tasks directly to the `milestones` and `tasks` tables in PostgreSQL under the matching `submissionId`.

- **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "milestonesCount": 4,
    "tasksCount": 15
  }
  ```
