# Vox — Project Hub

> Freight logistics SaaS. Multi-tenant. Next.js 16 App Router + Drizzle + PostgreSQL.

## Quick links

- [[01-Architecture]] — stack, layers, file structure
- [[02-Roadmap]] — what's done, what's next, priorities
- [[04-Database-Schema]] — all tables, enums, relations
- [[05-Auth-Flow]] — JWT auth, session lifecycle, workspace guard

## TMS Feature Plan

- [[10-TMS-Overview]] — master plan, status pipeline, module index
- [[11-Module1-Trip-Creation]] — schema, API, UI, open questions
- [[12-Module2-Carrier-Assignment]] — carrier search, assignment gate, CMR upload
- [[13-Module3-Monitoring]] — checkpoints, document tracking, payment confirmation
- [[14-Module4-Differentiating-Features]] — MSign, activity map, payment calendar, alerts, P&L
- [[15-Additional-Features]] — backlog: ratings, compliance, integrations, reporting

## At a glance

| Thing         | Value                                                             |
|---------------|-------------------------------------------------------------------|
| App name      | Vox                                                               |
| Purpose       | Multi-tenant freight/logistics management                         |
| Stack         | Next.js 16 · Drizzle ORM · PostgreSQL · Radix Themes · Tailwind 4 |
| Runtime       | Bun (scripts) + Node.js (Next.js)                                 |
| Deploy        | Vercel                                                            |
| Auth          | Custom JWT — `httpOnly` cookie `vox_session`                      |
| DB connection | Direct `postgres.js`, no Supabase SDK                             |

## Running the project

```bash
bun run dev            # start dev server
bun run db:migrate     # apply pending migrations
bun run db:seed        # run SQL seeds
bun run typecheck      # tsc --noEmit
bun run lint           # ESLint
```

## Seed accounts

| Email          | Password            | Role                                               |
|----------------|---------------------|----------------------------------------------------|
| admin@vox.com  | (see 001_admin.sql) | admin                                              |
| alice@demo.com | Password.1          | owner — apex-logistics, logistician — blue-freight |
| bob@demo.com   | Password.1          | logistician — apex-logistics                       |
| carol@demo.com | Password.1          | owner — blue-freight, coastal-carriers             |
| dave@demo.com  | Password.1          | logistician — coastal-carriers                     |
