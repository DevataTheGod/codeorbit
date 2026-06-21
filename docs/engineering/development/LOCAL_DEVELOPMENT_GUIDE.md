# Local Development Guide

This guide walks you through setting up CodeOrbit for local development.

---

## Prerequisites

- **Node.js** 18+ and npm
- **Git**
- **Supabase CLI** (optional, for local Supabase)
- **Code editor** (VS Code recommended)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/DevataTheGod/codeorbit.git
cd codeorbit
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
cp config/.env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### 4. Start Development Server

```bash
npm run dev
```

This starts the Vite dev server at `http://localhost:8080`.

### 5. Start OTP Server (Optional)

```bash
npm run otp-server
```

This starts the Express OTP server at `http://localhost:8787`.

---

## Project Structure

```
codeorbit/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── services/      # Business logic
│   │   ├── hooks/         # React hooks
│   │   └── integrations/  # Supabase config
│   └── ...
├── supabase/              # Edge Functions
│   └── functions/
├── database/              # SQL migrations
├── docs/                  # Documentation
├── tests/                 # Test files
└── scripts/               # Build scripts
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run otp-server` | Start OTP server |

---

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |

### Optional

| Variable | Description |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | For admin operations |
| `RESEND_API_KEY` | For OTP emails |

---

## Database Setup

### Using Supabase Cloud

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migrations in `database/migrations/`
3. Copy the URL and keys to `.env`

### Using Local Supabase

```bash
supabase init
supabase start
supabase db push
```

---

## Common Issues

### Build Fails

1. Run `npm install` again
2. Check Node.js version (18+)
3. Clear cache: `rm -rf node_modules/.cache`

### TypeScript Errors

```bash
npx tsc --noEmit --project tsconfig.app.json
```

Fix any reported errors before committing.

### Supabase Connection Issues

1. Verify `.env` has correct credentials
2. Check Supabase project is running
3. Verify RLS policies allow your operations

---

## IDE Setup (VS Code)

### Recommended Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Vim)

### Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test

```bash
npx vitest run tests/understanding-score/
```

### Watch Mode

```bash
npx vitest
```

---

## Building for Production

```bash
npm run build
```

Output goes to `dist/`.

---

## Deployment

See [DEPLOYMENT_GUIDE.md](../operations/DEPLOYMENT_GUIDE.md) for production deployment instructions.
