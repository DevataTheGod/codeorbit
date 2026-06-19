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

Fill in the required variables (see [ENVIRONMENT_VARIABLES.md](file:///home/dev/Desktop/projects/codeorbit/docs/ENVIRONMENT_VARIABLES.md)).

---

## 3. Running the Project Locally

To run the project locally, you can start both the frontend client and the backend server concurrently using a single command:

```bash
npm start
```

*   **Vite Frontend Client:** http://localhost:8080
*   **Express OTP Server:** http://localhost:8787

Alternatively, you can start them in separate terminal tabs if you need isolated logs:

### 1. Start Frontend Vite Server
```bash
npm run dev
```

### 2. Start Express OTP Server
```bash
npm run otp-server
```

---

## 4. Testing Socratic Chat Offline

A simulation script is provided to test the Socratic Chat (Orbit AI) prompts and report outputs in the terminal:
```bash
npm run test:simulation
```
This script acts as a headless client mock to verify that Gemini responds using Socratic directives without generating code blocks.
