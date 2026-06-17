# 💻 CodeOrbit — Local Development Guide

Follow this guide to set up and run CodeOrbit in your local development environment.

---

## 1. Prerequisites

Ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** or **bun**
- **Supabase CLI** (optional, for local DB development)

---

## 2. Environment Configurations

Create a `.env` file in the project root by copying the template:
```bash
cp config/.env.example .env
```

Fill in the required variables (see [ENVIRONMENT_VARIABLES.md](file:///home/dev/Desktop/projects/Project-Skill/docs/ENVIRONMENT_VARIABLES.md)).

---

## 3. Running the Project Locally

Two local runtimes must be started concurrently to enable the full workflow:

### 1. Start Frontend Vite Server
Launches the browser IDE and student/mentor dashboards.
```bash
npm run dev
```
- **Local Address:** `http://localhost:8080` (configured in `vite.config.ts`).

### 2. Start Express OTP Server
Launches the email sending microservice.
```bash
npm run otp-server
```
- **Local Address:** `http://localhost:8787` (configured in `backend/server.ts`).

---

## 4. Testing Socratic Chat Offline

A simulation script is provided to test the Socratic Chat (Orbit AI) prompts and report outputs in the terminal:
```bash
npm run tsx tests/test-chatbot-simulation.ts
```
This script acts as a headless client mock to verify that Gemini responds using Socratic directives without generating code blocks.
