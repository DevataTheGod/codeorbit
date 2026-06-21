# AI Development Playbook

This document defines how AI agents should work on the CodeOrbit codebase.

---

## Context Loading Order

Every AI agent MUST load these files in order before making changes:

1. **FOUNDER_THESIS.md** — Why CodeOrbit exists
2. **MASTER_CONTEXT.md** — Single source of truth
3. **AI_AGENT_RULES.md** — Rules for AI agents
4. **CURRENT_ARCHITECTURE.md** — Actual architecture
5. **PRODUCT_SPEC.md** — Product requirements
6. **ENGINEERING_HANDBOOK.md** — Coding standards

---

## Architecture Rules

### File Organization

- Components go in `frontend/src/components/`
- Pages go in `frontend/src/pages/`
- Services go in `frontend/src/services/`
- Hooks go in `frontend/src/hooks/`

### Forbidden Patterns

- Never use `any` type without explicit justification
- Never hardcode API keys
- Never skip JWT verification in edge functions
- Never bypass RLS policies
- Never commit `.env` files

### Required Patterns

- All Supabase queries must handle errors
- All edge functions must verify JWT
- All tables must have RLS enabled
- All components must handle loading states

---

## Coding Standards

### TypeScript

```typescript
// ✅ Good
interface Student {
  id: string;
  name: string;
  score: number;
}

// ❌ Bad
const student: any = { ... };
```

### React Components

```typescript
// ✅ Good
interface Props {
  studentId: string;
  onRefresh: () => void;
}

export const StudentCard = ({ studentId, onRefresh }: Props) => {
  // ...
};

// ❌ Bad
export const StudentCard = (props: any) => {
  // ...
};
```

### Services

```typescript
// ✅ Good
export const StudentService = {
  async getStudent(id: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to get student:', err);
      return null;
    }
  }
};

// ❌ Bad
export const getStudent = async (id: string) => {
  const { data } = await supabase.from('students').select('*').eq('id', id);
  return data;
};
```

---

## Supabase Rules

### Table Access

- Always use `auth.uid()` for user-specific queries
- Always check RLS policies before assuming access
- Never use service role key in frontend code

### Edge Functions

- Always verify JWT
- Always validate input
- Always return proper HTTP status codes
- Always handle errors gracefully

### Migrations

- Always use `IF NOT EXISTS` for safety
- Always add indexes for frequently queried columns
- Always document migration purpose
- Never delete data in migrations

---

## Testing Rules

### What to Test

- Service functions
- Utility functions
- Component rendering
- Auth flows

### What NOT to Test

- Third-party libraries
- Supabase internals
- Simple wrappers

### Test File Location

```
tests/
├── {feature}/
│   └── {Feature}.test.ts
```

---

## Git Rules

### Commit Messages

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: frontend, backend, database, docs
Description: imperative mood, under 72 chars
```

### Branch Naming

```
feature/description
bugfix/description
docs/description
```

### PR Requirements

- All tests pass
- Build succeeds
- No TypeScript errors
- Documentation updated if needed

---

## Common Tasks

### Adding a New Feature

1. Create service in `frontend/src/services/`
2. Create hook in `frontend/src/hooks/`
3. Create components in `frontend/src/components/`
4. Create page in `frontend/src/pages/`
5. Add route in `App.tsx`
6. Add tests in `tests/`
7. Update documentation

### Adding a New Table

1. Create migration in `database/migrations/`
2. Add RLS policies
3. Update Supabase types
4. Create service functions
5. Update documentation

### Adding a New Edge Function

1. Create function in `supabase/functions/`
2. Add JWT verification
3. Add input validation
4. Add error handling
5. Update API documentation

---

## Prohibited Actions

### Never

- Delete production data
- Bypass security checks
- Skip error handling
- Use hardcoded values
- Commit secrets

### Always

- Handle errors
- Validate input
- Verify authentication
- Document changes
- Test before committing

---

## AI Agent Workflow

### Before Making Changes

1. Load context files
2. Understand the task
3. Check existing patterns
4. Plan the implementation

### While Making Changes

1. Follow coding standards
2. Handle errors
3. Add comments where needed
4. Keep changes minimal

### After Making Changes

1. Run tests
2. Run build
3. Verify no TypeScript errors
4. Update documentation if needed
