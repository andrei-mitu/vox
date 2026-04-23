# Architecture

## Stack

| Layer        | Choice                                           |
|--------------|--------------------------------------------------|
| Framework    | Next.js 16 (App Router)                          |
| Runtime / PM | Bun                                              |
| UI           | Radix Themes (`@radix-ui/themes`)                |
| Styling      | Tailwind CSS 4 + `tailwind-merge`                |
| Database     | PostgreSQL via Drizzle ORM + `postgres.js`       |
| Auth         | Custom JWT — `jose` sign/verify, `bcryptjs` hash |
| Deploy       | Vercel (Node.js runtime)                         |

## Layer responsibilities

```
Route Handler (app/api/)
  → parse request
  → validate with Zod DTO
  → call ONE service
  → return ApiResponse JSON

Service (lib/services/)
  → business rules
  → calls repositories
  → NO raw SQL, NO imports from app/

Repository (lib/repositories/)
  → Drizzle queries
  → typed return values
  → NO business logic

DTO (lib/dto/)
  → Zod schemas + inferred TS types
  → NO imports from services or repos

Schema (lib/db/schema/)
  → Drizzle table definitions
  → exported Drizzle-inferred types
  → NO application logic
```

## File layout

```
app/
  (auth)/                         unauthenticated pages
    login/page.tsx
    no-access/page.tsx
    select-workspace/page.tsx
    layout.tsx
  (dashboard)/
    [workspace]/                  workspace-scoped pages
      dashboard/page.tsx
      carriers/
        page.tsx                  carrier list
        [carrierId]/
          details/page.tsx        carrier details tab
          shipments/page.tsx      carrier's shipments
          clients/page.tsx        clients via shipments
          routes/page.tsx         routes serviced
      clients/
        page.tsx                  client list
        [clientId]/
          details/page.tsx
          shipments/page.tsx
          carriers/page.tsx
      shipments/
        page.tsx                  shipment list (status tabs)
        [shipmentId]/
          details/page.tsx
          carrier/page.tsx
          documents/page.tsx
          timeline/page.tsx
      routes/
        page.tsx                  route list (new)
        [routeId]/
          details/page.tsx
          shipments/page.tsx
          carriers/page.tsx
      trips/
        page.tsx                  trip list
        new/page.tsx              create trip
        [tripId]/page.tsx         trip detail + monitoring
        [tripId]/find-carrier/page.tsx
      layout.tsx                  auth guard + membership check
  api/
    auth/
      login/route.ts
      logout/route.ts
    [workspace]/
      carriers/route.ts
      carriers/[carrierId]/route.ts
      carriers/[carrierId]/trucks/route.ts
      routes/route.ts
      routes/[routeId]/route.ts
      trips/route.ts
      trips/[tripId]/route.ts
      trips/[tripId]/status/route.ts
      trips/[tripId]/carrier-search/route.ts
      trips/[tripId]/assign-carrier/route.ts
      trips/[tripId]/documents/route.ts
      trips/[tripId]/documents/[docId]/upload/route.ts
      trips/[tripId]/documents/[docId]/verify/route.ts
      trips/[tripId]/checkpoints/route.ts
      trips/[tripId]/checkpoints/[type]/route.ts
      trips/[tripId]/mark-paid/route.ts
      upload/route.ts             file upload (CMR, thermodiagram, etc.)
      alerts/route.ts
      payments/calendar/route.ts
      financials/summary/route.ts

lib/
  auth/
    session.ts                    JWT sign / verify (server-only)
    workspace.ts
  db/
    schema/                       one file per table
      users.ts
      profiles.ts
      teams.ts
      team-members.ts
      access-requests.ts
      carriers.ts
      clients.ts
      routes.ts                   (UI Phase 1)
      carrier-trucks.ts           (TMS Module 2)
      trips.ts                    (TMS Module 1)
      trip-carrier-assignments.ts (TMS Module 2)
      trip-documents.ts           (TMS Module 3)
      trip-checkpoints.ts         (TMS Module 3)
      alerts.ts                   (TMS Module 4)
      index.ts                    re-exports all schema
    index.ts                      lazy drizzle singleton (getDb)
  repositories/
    user.repository.ts
    team.repository.ts
    access-request.repository.ts
    carrier.repository.ts
    client.repository.ts
    route.repository.ts           (UI Phase 1)
    carrier-truck.repository.ts
    trip.repository.ts
    carrier-assignment.repository.ts
    trip-document.repository.ts
    trip-checkpoint.repository.ts
  services/
    auth.service.ts
    team.service.ts
    carrier.service.ts
    client.service.ts
    route.service.ts              (UI Phase 1)
    trip.service.ts
    carrier-assignment.service.ts
    monitoring.service.ts
  dto/
    auth.dto.ts
    team.dto.ts
    carrier.dto.ts
    client.dto.ts
    route.dto.ts                  (UI Phase 1)
    trip.dto.ts
    carrier-assignment.dto.ts
    monitoring.dto.ts
  api/response.ts                 ApiResponse helper
  client/login-client.ts          browser-side fetch
  utils.ts
  fonts.ts

db/
  migrations/                     drizzle-kit output — never edit manually
  seeds/
    001_admin.sql
    002_demo_data.sql

docs/                             Obsidian vault — you are here
scripts/
  seed.ts
```

## Key invariants

- DB client initializes lazily — never at import time.
- `getSessionUser()` is the single source of truth for the current user.
- Admin bypasses workspace membership checks.
- Workspace slug is the URL segment — `/{slug}/dashboard`.
- No Supabase SDK anywhere. Direct `postgres.js` connection only.
- `DATABASE_URL` + `JWT_SECRET` are the only required env vars.
- All file uploads (CMR, thermodiagram, ADR docs) go through `POST /api/[workspace]/upload` — never directly from the
  client to storage.
- Trip status can only advance forward through the pipeline — no skipping, no reverting.
