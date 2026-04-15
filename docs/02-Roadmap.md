# Roadmap

> The full TMS feature plan lives in [[10-TMS-Overview]] and the per-module docs (11–15).
> This file tracks build status — what's shipped, what's actively in progress, what's next.

---

## Done ✅

### Foundation

- [x] Next.js 16 App Router project setup
- [x] Bun as package manager + script runner
- [x] Radix Themes + Tailwind CSS 4 styling
- [x] Drizzle ORM + postgres.js (direct, no Supabase SDK)
- [x] Custom JWT auth (`jose` + `bcryptjs`)
- [x] `.env.example` documented

### Database

- [x] Schema: `users`, `profiles`, `teams`, `team_members`, `access_requests`, `carriers`
- [x] Migrations generated and applied (`db/migrations/`)
- [x] Seed: admin user (`001_admin.sql`)
- [x] Seed: demo teams + users + memberships + access requests (`002_demo_data.sql`)

### Auth

- [x] Login route handler (`app/api/auth/login/route.ts`)
- [x] Logout route handler (`app/api/auth/logout/route.ts`)
- [x] Session JWT — sign, verify, cookie management (`lib/auth/session.ts`)
- [x] `getSessionUser()` — live role fetch from DB, timing-attack safe
- [x] Login page UI (`app/(auth)/login/page.tsx`)
- [x] No-access page

### Workspace routing

- [x] Select workspace page (auto-redirects if only 1 team)
- [x] `[workspace]/layout.tsx` — auth guard + membership check
- [x] Admin bypasses membership check (sees all workspaces)
- [x] Sidebar component with workspace context

### Carriers (back-end)

- [x] `carriers` table schema (`carrier_mode`, `carrier_status` enums)
- [x] Carrier repository (find all by team, find by id, create, update, delete)
- [x] Carrier service
- [x] Carrier DTOs (Zod)
- [x] Carriers API: `GET /api/[workspace]/carriers`
- [x] Carriers API: `POST /api/[workspace]/carriers`
- [x] Carriers API: `GET/PUT/DELETE /api/[workspace]/carriers/[carrierId]`

### Infrastructure

- [x] CI/CD (GitHub Actions)
- [x] Dockerfile + fly.toml

---

## In Progress / Next 🚧

### Carriers UI

- [ ] Carriers list page — table with name, code, mode, status, contact
- [ ] Create carrier form / modal
- [ ] Edit carrier inline or modal
- [ ] Delete carrier with confirmation
- [ ] Filter by mode / status

### Clients

- [ ] `clients` table schema (name, contact info, team_id)
- [ ] Client repository + service + DTOs
- [ ] Clients API: CRUD
- [ ] Clients list page + detail page

### TMS — Module 1: Trip Creation  ([[11-Module1-Trip-Creation]])

- [ ] `trips` table schema + migration
- [ ] Trip repository + service + DTOs
- [ ] Trips API: list, create, get, update, delete, advance status
- [ ] Trips list page (status filter tabs)
- [ ] New trip form (cargo / client / route sections)
- [ ] Trip detail page + pipeline progress indicator

### TMS — Module 2: Carrier Assignment  ([[12-Module2-Carrier-Assignment]])

- [ ] Extend `carriers` table (ADR, routes, contract)
- [ ] `carrier_trucks` table + migration
- [ ] `trip_carrier_assignments` table + migration
- [ ] Carrier search API (auto-filter for trip)
- [ ] File upload endpoint (CMR Insurance)
- [ ] Assign-carrier API + status advance
- [ ] Find Carrier page + CarrierSelectionModal
- [ ] Carrier profile — trucks sub-section

### TMS — Module 3: Monitoring  ([[13-Module3-Monitoring]])

- [ ] `trip_documents` table + migration
- [ ] `trip_checkpoints` table + migration
- [ ] Document API (upload, verify)
- [ ] Checkpoints API (record milestone)
- [ ] Auto-transition logic (MONITORING → AWAITING_PAYMENT)
- [ ] Checkpoint timeline UI
- [ ] Document management UI on trip detail
- [ ] Mark Payment Received → COMPLETED

---

## Backlog / Future 📋

### TMS — Module 4: Differentiating Features  ([[14-Module4-Differentiating-Features]])

- [ ] Payment Calendar (incoming + outgoing)
- [ ] Logistician Alerts (payment due, overdue, unassigned, checkpoint delay)
- [ ] Financial Calculator / P&L Dashboard
- [ ] Regional Activity Map
- [ ] Moldova MSign digital document generation

### TMS — Additional Features  ([[15-Additional-Features]])

- [ ] Carrier rating system (post-trip)
- [ ] License & insurance expiry tracking
- [ ] Audit trail
- [ ] Email / SMS notifications (Resend + Twilio)
- [ ] Client portal (shareable tracking link)
- [ ] Per-trip messaging
- [ ] Lane profitability + carrier performance reports
- [ ] GPS / telematics integration

### Platform

- [ ] Invite users to workspace (invite by email)
- [ ] Registration flow (self-serve signup → access request)
- [ ] Email confirmation
- [ ] Role management UI (promote/demote members)
- [ ] Access requests admin UI (approve / reject)
- [ ] Workspace settings page (rename, change visibility)
- [ ] User profile page (update name, change password)
- [ ] Dark / light theme toggle in sidebar
- [ ] Rate limiting on API routes
- [ ] JWT expiry — add `exp` claim in production (currently indefinite)
- [ ] Export to CSV / PDF
