# CodeOrbit Architectural Decision Records (ADR)

This document tracks major architectural decisions, their context, and tradeoffs.

---

## ADR-001: Supabase over Custom Node/Express/Prisma Backend

### Status
Accepted

### Date
2026-06-20

### Context
CodeOrbit needs an enterprise-grade backend infrastructure supporting PostgreSQL, Real-Time Subscriptions, Row Level Security (RLS), and secure Authentication. We evaluated running a custom Node.js Express server with Prisma ORM versus adopting Supabase as a Backend-as-a-Service (BaaS).

### Decision
Adopt Supabase as the primary backend provider for database, auth, and edge functions.

### Consequences

#### Positive
*   **Rapid Development**: No need to write auth boilerplate, token validation middleware, or connection pool configuration.
*   **Built-in Security**: Postgres RLS ensures strict data isolation at the database layer.
*   **Edge Scaling**: Supabase Edge Functions allow Deno-based serverless execution closer to users.

#### Negative
*   **Vendor Lock-in**: Dependent on Supabase hosting or self-hosted Supabase instances.
*   **Cold Starts**: Edge functions may experience minor cold-start latency.
*   **Local Setup**: Requires Supabase CLI for local database schema management and function testing.

---

## ADR-002: Monaco Editor for Browser IDE

### Status
Accepted

### Date
2026-06-20

### Context
To simulate a real engineering workflow, the in-browser IDE needs to provide autocomplete, syntax highlighting, and a familiar keyboard-shortcut setup.

### Decision
Use `@monaco-editor/react` (VS Code's core editor) for the code workspace editor.

### Consequences

#### Positive
*   Highly customizable and supports TypeScript types, Monaco themes, and multi-cursor.
*   Matches student familiarity with VS Code.

#### Negative
*   Large package bundle size.
*   Heavy initial initialization load.
