# Target Architecture

> **Status: Aspirational**
> 
> This architecture is not currently deployed.
> This document represents the intended evolution of CodeOrbit.

---

## Vision

A scalable, enterprise-grade platform that serves 10,000+ concurrent students across hundreds of bootcamps.

---

## Current vs Target

| Component | Current | Target |
|-----------|---------|--------|
| Frontend | Vite + React | Next.js + React |
| Backend | Supabase | Node.js + Express + Prisma |
| Database | PostgreSQL (Supabase) | PostgreSQL (AWS RDS) |
| Cache | None | Redis (ElastiCache) |
| Queue | None | Bull (Redis) |
| AI | Gemini via Lovable | Claude API |
| Storage | Supabase | AWS S3 |
| CDN | None | CloudFront |
| Hosting | Vercel/Netlify | AWS EC2 + Auto-scaling |
| Search | None | Elasticsearch |

---

## Target Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CDN (CloudFront)                         │
│                    Static Assets + API Cache                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Load Balancer (ALB)                          │
│                    SSL Termination                              │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐  ┌────────────────────┐  ┌─────────────┐
│   API Server    │  │   Worker Server    │  │   WebSocket │
│   (Express)     │  │   (Bull Queue)     │  │   Server    │
│   Port 3000     │  │   Background Jobs  │  │   Real-time │
└─────────────────┘  └────────────────────┘  └─────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐  ┌────────────────────┐  ┌─────────────┐
│   PostgreSQL    │  │      Redis         │  │   S3        │
│   (RDS)         │  │   (ElastiCache)    │  │  Storage    │
│   Primary +     │  │   Sessions +       │  │  Files +    │
│   Read Replica  │  │   Cache + Queue    │  │  Exports    │
└─────────────────┘  └────────────────────┘  └─────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Services                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Claude API  │  │ Embeddings  │  │   Understanding Score   │ │
│  │ (Orbit)     │  │ (Semantic)  │  │   ML Pipeline           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### Frontend (Next.js)

| Feature | Implementation |
|---------|----------------|
| SSR/SSG | Next.js App Router |
| State | Zustand |
| Data Fetching | TanStack Query |
| Styling | Tailwind + shadcn/ui |
| Editor | Monaco Editor |

### Backend (Node.js + Express)

| Feature | Implementation |
|---------|----------------|
| Framework | Express.js |
| ORM | Prisma |
| Validation | Zod |
| Auth | JWT + Refresh Tokens |
| Rate Limiting | Express Rate Limit |

### Database (PostgreSQL + Redis)

| Feature | Implementation |
|---------|----------------|
| Primary | AWS RDS PostgreSQL |
| Read Replica | AWS RDS Read Replica |
| Cache | AWS ElastiCache Redis |
| Queue | Bull (Redis-based) |

### AI (Claude API)

| Feature | Implementation |
|---------|----------------|
| Chat | Claude API (Streaming) |
| Embeddings | Claude Embeddings |
| Understanding Score | ML Pipeline |
| Telemetry Analysis | Background Workers |

### Infrastructure (AWS)

| Feature | Implementation |
|---------|----------------|
| Compute | EC2 Auto-scaling |
| Database | RDS |
| Cache | ElastiCache |
| Storage | S3 |
| CDN | CloudFront |
| Queue | SQS + Bull |

---

## Scaling Targets

| Metric | Current | Target |
|--------|---------|--------|
| Concurrent Students | 50 | 10,000+ |
| Bootcamps | 1 | 100+ |
| Response Time | 2s | <200ms |
| Uptime | 99% | 99.9% |

---

## Migration Path

### Phase 1: Foundation
- Move from Supabase to self-hosted PostgreSQL
- Add Redis for caching
- Implement proper API server

### Phase 2: Scale
- Add load balancing
- Implement auto-scaling
- Add read replicas

### Phase 3: Enterprise
- Add SSO/SAML
- Implement audit logging
- Add compliance features

---

## Cost Estimates

| Component | Monthly Cost |
|-----------|--------------|
| EC2 (2 instances) | $150 |
| RDS (PostgreSQL) | $100 |
| ElastiCache (Redis) | $50 |
| S3 (Storage) | $20 |
| CloudFront (CDN) | $30 |
| Claude API | $500 |
| **Total** | **~$850/month** |

**At 100 bootcamps × 100 students × ₹149/student/year = ₹1.49 Cr/year (~$180k/year)**

**Margin**: ~85%

---

## Security

| Feature | Implementation |
|---------|----------------|
| Encryption at rest | AES-256 |
| Encryption in transit | TLS 1.3 |
| Secrets | AWS Secrets Manager |
| JWT | 1hr access + 7-day refresh |
| RBAC | Role-based access control |
| Rate Limiting | 100 req/min |
| Input Validation | Zod schemas |
| CORS | Whitelist |
| CSRF | Tokens |

---

> **Note**: This architecture is aspirational. The current deployed architecture is documented in `docs/engineering/architecture/CURRENT_ARCHITECTURE.md`.

---

*This document represents the intended evolution of CodeOrbit's architecture.*
