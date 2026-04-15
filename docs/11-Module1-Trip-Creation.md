# Module 1 — Trip Creation

> Parent: [[10-TMS-Overview]]
> Status: 🔲 Not started
> Depends on: existing `clients` table (to be built), existing `carriers` table ✅

---

## Goal

A logistician opens a form, fills in cargo + client + route details, and saves a trip. The trip lands in status
`CREATED` and appears on the dashboard.

---

## Database Schema

### Table: `trips`

```sql
CREATE TYPE trip_status AS ENUM (
  'CREATED',
  'CARRIER_ASSIGNED',
  'MONITORING',
  'AWAITING_PAYMENT',
  'COMPLETED'
);

CREATE TABLE trips
(
    id                UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    team_id           UUID        NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
    created_by        UUID        NOT NULL REFERENCES users (id),
    status            trip_status NOT NULL DEFAULT 'CREATED',

    -- Cargo
    cargo_name        TEXT        NOT NULL,
    cargo_type        TEXT,
    weight_kg         NUMERIC(10, 2),
    volume_m3         NUMERIC(10, 2),
    thermal           BOOLEAN     NOT NULL DEFAULT FALSE,
    temp_min          NUMERIC(5, 1),
    temp_max          NUMERIC(5, 1),
    thermodiagram     BOOLEAN     NOT NULL DEFAULT FALSE,
    adr               BOOLEAN     NOT NULL DEFAULT FALSE,
    adr_class         TEXT,
    phytosanitary     BOOLEAN     NOT NULL DEFAULT FALSE,
    phyto_cost_by     TEXT CHECK (phyto_cost_by IN ('CARRIER', 'SENDER')),

    -- Client
    client_id         UUID REFERENCES clients (id),
    client_name       TEXT,    -- denormalised fallback
    contact_person    TEXT,
    contact_phone     TEXT,
    contact_email     TEXT,
    price             NUMERIC(12, 2),
    currency          CHAR(3)     NOT NULL DEFAULT 'EUR',
    payment_period    INTEGER, -- net days

    -- Route
    loading_address   TEXT,
    loading_customs   TEXT,
    unloading_address TEXT,
    unloading_customs TEXT,
    loading_date_from DATE,
    loading_date_to   DATE,

    -- Meta
    comments          TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Migration steps

1. Edit `lib/db/schema/trips.ts` with Drizzle table definition
2. `bun run db:generate` → commit generated SQL
3. `bun run db:migrate`

---

## API Routes

| Method   | Path                                     | Description                                    |
|----------|------------------------------------------|------------------------------------------------|
| `GET`    | `/api/[workspace]/trips`                 | List all trips for team (filterable by status) |
| `POST`   | `/api/[workspace]/trips`                 | Create a trip                                  |
| `GET`    | `/api/[workspace]/trips/[tripId]`        | Get single trip                                |
| `PUT`    | `/api/[workspace]/trips/[tripId]`        | Update trip fields                             |
| `DELETE` | `/api/[workspace]/trips/[tripId]`        | Delete trip (only if CREATED)                  |
| `PATCH`  | `/api/[workspace]/trips/[tripId]/status` | Advance status (guarded transitions)           |

### Query params for GET /trips

- `status` — filter by enum value
- `page`, `limit` — pagination (default limit 20)
- `search` — cargo name or client name substring

---

## DTOs (Zod)

**`lib/dto/trip.dto.ts`**

```ts
// CreateTripDto
{
    cargoName: string                          // required
    cargoType ? : string
    weightKg ? : number
    volumeM3 ? : number
    thermal: boolean
    tempMin ? : number                           // required if thermal
    tempMax ? : number                           // required if thermal
    thermodiagram: boolean
    adr: boolean
    adrClass ? : string                          // required if adr
    phytosanitary: boolean
    phytoCostBy ? : 'CARRIER' | 'SENDER'         // required if phytosanitary

    clientId ? : string(uuid)
    clientName ? : string
    contactPerson ? : string
    contactPhone ? : string
    contactEmail ? : string
    price ? : number
    currency ? : string                          // default 'EUR'
    paymentPeriod ? : number

    loadingAddress ? : string
    loadingCustoms ? : string
    unloadingAddress ? : string
    unloadingCustoms ? : string
    loadingDateFrom ? : string(date)
    loadingDateTo ? : string(date)

    comments ? : string
}
```

Refinements:

- `tempMin` + `tempMax` required when `thermal = true`
- `adrClass` required when `adr = true`
- `phytoCostBy` required when `phytosanitary = true`

---

## Repository

**`lib/repositories/trip.repository.ts`**

```ts
findAllByTeam(teamId, filters)  → Trip[]
findById(tripId, teamId)        → Trip | null
create(data)                    → Trip
update(tripId, teamId, data)    → Trip
delete (tripId, teamId)          → void
    updateStatus(tripId, teamId, status) → Trip
```

---

## Service

**`lib/services/trip.service.ts`**

- `createTrip(teamId, userId, dto)` — validate, set status = CREATED, insert
- `listTrips(teamId, filters)` — paginated, filterable
- `getTrip(teamId, tripId)` — 404 if not found
- `updateTrip(teamId, tripId, dto)` — deny if status !== CREATED
- `deleteTrip(teamId, tripId)` — deny if status !== CREATED
- `advanceStatus(teamId, tripId, newStatus)` — enforce pipeline order

---

## UI Components

### Pages

| Path                          | Component        | Description                |
|-------------------------------|------------------|----------------------------|
| `/[workspace]/trips`          | `TripsPage`      | Dashboard — list + filters |
| `/[workspace]/trips/new`      | `NewTripPage`    | Creation form              |
| `/[workspace]/trips/[tripId]` | `TripDetailPage` | Full detail + actions      |

### Component breakdown

**`TripsPage`**

- Status filter tabs (All / Created / Carrier Assigned / Monitoring / Awaiting Payment / Completed)
- Trips table: reference#, cargo name, client, route summary, status badge, loading date, actions
- "+ New Trip" button → `/trips/new`
- Empty state

**`NewTripPage`** — multi-section form:

- Section 1: Cargo Information (conditional fields for thermal, ADR, phytosanitary)
- Section 2: Client Information
- Section 3: Route & Logistics
- Section 4: Comments
- Save button → POST → redirect to trip detail

**`TripDetailPage`**

- All fields displayed (read mode)
- Edit button (if CREATED)
- Status badge + pipeline progress indicator
- Action button: "Find Carrier" → navigates to Module 2 flow (if CREATED)
- Comments section

### Shared components

- `TripStatusBadge` — color-coded enum label
- `TripPipeline` — 5-step horizontal progress bar
- `ConditionalFields` — show/hide thermal/ADR/phyto sections
- `DateRangePicker` — for loading date range

---

## Implementation Order

1. `lib/db/schema/trips.ts` → generate + migrate
2. `lib/repositories/trip.repository.ts`
3. `lib/services/trip.service.ts`
4. `lib/dto/trip.dto.ts`
5. API routes (GET list, POST create, GET detail, PUT update, DELETE, PATCH status)
6. `TripsPage` — list with static mock data
7. `NewTripPage` — creation form wired to API
8. `TripDetailPage` — detail view + edit mode
9. Status pipeline indicator
10. Typecheck + lint pass

---

## Open Questions

- [ ] Do we require `clientId` to reference the `clients` table, or allow free-text client entry?
- [ ] Trip reference number format — auto-generated (e.g. `VOX-2025-001`) or manual?
- [ ] Should deleting a trip be a soft-delete (`deleted_at`) or hard-delete?
- [ ] Currency list — just EUR/USD/MDL or open text?
