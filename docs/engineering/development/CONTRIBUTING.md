# 🤝 Contributing to CodeOrbit (CONTRIBUTING.md)

Thank you for choosing to contribute to CodeOrbit! Follow these guidelines to ensure a smooth development and review process.

---

## 🛠️ Local Setup

1. Fork and clone the repository.
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Set up your local environment file:
   ```bash
   cp config/.env.example .env
   ```
4. Run the frontend client and backend OTP servers concurrently (see [LOCAL_SETUP.md](file:///home/dev/Desktop/projects/codeorbit/docs/engineering/development/LOCAL_SETUP.md)).
5. Code updates should be fully typed and adhere to naming guidelines.

---

## 🌿 Branching Strategy

- Name feature branches using the pattern: `feature/short-description`.
- Name bug fixes using: `bugfix/short-description`.
- Target all Pull Requests (PRs) to the `main` branch.

---

## 📝 Coding Standards

- **TypeScript:** Enforce typing; avoid using `any` type definitions unless specifically bypassing generated DB types.
- **Components:** Keep React components reusable, located under `frontend/src/components/`.
- **Styling:** Use Tailwind CSS utility classes aligned with tokens defined in [tailwind.config.ts](file:///home/dev/Desktop/projects/codeorbit/tailwind.config.ts).
- **Comments:** Retain all documentation strings and descriptive comments.

---

## 📬 Pull Request Process

1. Run `npm run build` locally to verify that the project compiles without TypeScript or Vite errors.
2. Confirm ESLint passes: `npm run lint`.
3. Submit your PR with a description of the changes made and link the relevant issue.
