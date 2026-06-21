# Engineering Handbook

This document describes the engineering standards, conventions, and architecture patterns used in CodeOrbit.

---

## Project Structure

```
codeorbit/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level page components
│   │   ├── services/      # Business logic and API calls
│   │   ├── hooks/         # Custom React hooks
│   │   ├── integrations/  # Third-party service configs
│   │   └── lib/           # Utility functions
│   └── ...
├── supabase/          # Edge Functions (Deno)
│   └── functions/
│       ├── orbit-chat/        # AI chat endpoint
│       └── generate-milestones/ # Milestone generation
├── database/          # SQL migrations and schema
│   ├── migrations/
│   ├── schema/
│   └── setup/
├── docs/              # Documentation
├── tests/             # Test files
└── scripts/           # Build and utility scripts
```

---

## Coding Standards

### TypeScript

- Use strict TypeScript (`strict: true` in tsconfig)
- Avoid `any` type — use `unknown` or specific types
- Define interfaces for all data structures
- Use type imports: `import type { X } from '...'`

### React Components

- Use functional components with hooks
- Keep components under 200 lines
- One component per file
- Name files after the component: `MyComponent.tsx`

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `StudentDashboard.tsx` |
| Services | PascalCase | `UnderstandingScoreService.ts` |
| Hooks | camelCase with `use` | `useAuth.tsx` |
| Utils | camelCase | `formatDate.ts` |
| Types | PascalCase | `types.ts` or `interfaces.ts` |

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow the design system in `tailwind.config.ts`
- Use `cn()` utility for conditional classes
- Avoid inline styles

---

## Component Architecture

### Page Components

Location: `frontend/src/pages/`

- Route-level components
- Handle data fetching
- Manage page-level state
- Export as default

### Feature Components

Location: `frontend/src/components/`

- Reusable UI components
- Receive props, render UI
- Minimal business logic
- Export as named exports

### Service Layer

Location: `frontend/src/services/`

- Business logic and data transformations
- Supabase queries
- API calls
- Export as named exports

### Hooks

Location: `frontend/src/hooks/`

- Custom React hooks
- State management
- Side effects
- Export as named exports

---

## Data Flow

```
User Action
    ↓
Page Component
    ↓
Service Layer
    ↓
Supabase Client
    ↓
PostgreSQL / Edge Functions
    ↓
Response
    ↓
Update State
    ↓
Re-render UI
```

---

## Supabase Patterns

### Client Initialization

```typescript
import { supabase as supabaseOriginal } from '@/integrations/supabase/client';
const supabase = supabaseOriginal as any;
```

The `as any` cast is used because local type generation may not include all tables.

### Query Pattern

```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);

if (error) throw error;
```

### RLS Pattern

All tables have Row-Level Security enabled. Policies use:

```sql
auth.uid() = user_id  -- Owner access
```

Or role-based:

```sql
EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
)
```

---

## Edge Function Patterns

### Location

```
supabase/functions/{function-name}/index.ts
```

### Structure

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // 1. Verify JWT
  // 2. Parse request
  // 3. Process logic
  // 4. Return response
});
```

### JWT Verification

All edge functions must verify the JWT:

```typescript
const authHeader = req.headers.get("Authorization");
const token = authHeader?.replace("Bearer ", "");
const supabase = createClient(url, key, {
  global: { headers: { Authorization: `Bearer ${token}` } },
});
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) return new Response("Unauthorized", { status: 401 });
```

---

## Testing

### Framework

- **Vitest** for unit tests
- **React Testing Library** for component tests

### Test Location

```
tests/
├── auth/
├── telemetry/
├── understanding-score/
└── reflection-challenges/
```

### Running Tests

```bash
npm test          # Run all tests
npx vitest run    # Same as above
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature', () => {
  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

---

## Git Conventions

### Branch Naming

- `feature/description` — New features
- `bugfix/description` — Bug fixes
- `docs/description` — Documentation changes

### Commit Messages

- Use imperative mood: "Add feature" not "Added feature"
- Keep under 72 characters
- Reference issues when applicable

### Pull Requests

1. Run `npm run build` — must pass
2. Run `npm test` — must pass
3. Describe changes clearly
4. Link related issues

---

## Security Practices

### Environment Variables

- Never commit `.env` files
- Use `config/.env.example` as template
- Rotate keys regularly

### Authentication

- JWT verification on all edge functions
- RLS on all database tables
- Role-based access control

### Input Validation

- Validate at system boundaries
- Use Zod for schema validation
- Sanitize user inputs

---

## Performance

### Frontend

- Lazy load routes
- Optimize bundle size
- Use React.memo for expensive renders

### Backend

- Index database queries
- Use connection pooling
- Cache where appropriate

---

## Documentation

Every major feature should have:

1. Architecture document in `docs/engineering/architecture/`
2. API reference if exposed
3. Test coverage
4. Update to this handbook if patterns change
