# Module 2 — Carrier Search & Assignment

> Parent: [[10-TMS-Overview]]
> Status: 🔲 Not started
> Depends on: [[11-Module1-Trip-Creation]] (trips table + CREATED status), carriers table ✅

---

## Goal

A logistician opens a trip in `CREATED` status, clicks "Find Carrier", sees a filtered list of matching carriers, picks
one, uploads CMR Insurance, and confirms. The trip advances to `CARRIER_ASSIGNED` → `MONITORING`.

---

## Database Schema

### Extend `carriers` table

The existing `carriers` table needs additional columns to support the TMS assignment flow:

```sql
ALTER TABLE carriers
    ADD COLUMN adr_certified   BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN routes_served   TEXT[], -- array of region/corridor strings
    ADD COLUMN contract_active BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN contract_start  DATE,
    ADD COLUMN contract_end    DATE;
```

### Table: `carrier_trucks`

```sql
CREATE TYPE truck_type AS ENUM ('MEGA', 'PRELATA', 'FRIGO', 'JUMBO', 'SPECIAL');

CREATE TABLE carrier_trucks
(
    id           UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    carrier_id   UUID        NOT NULL REFERENCES carriers (id) ON DELETE CASCADE,
    truck_type   truck_type  NOT NULL,
    volume_m3    NUMERIC(6, 1), -- null for SPECIAL
    plate_number TEXT,
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Table: `trip_carrier_assignments`

```sql
CREATE TABLE trip_carrier_assignments
(
    id            UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    trip_id       UUID        NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    carrier_id    UUID        NOT NULL REFERENCES carriers (id),
    truck_id      UUID REFERENCES carrier_trucks (id),
    carrier_price NUMERIC(12, 2), -- what we pay the carrier
    currency      CHAR(3)              DEFAULT 'EUR',
    cmr_insurance TEXT,           -- file path / storage key
    assigned_by   UUID        NOT NULL REFERENCES users (id),
    assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (trip_id)              -- one active assignment per trip
);
```

### Migration steps

1. `lib/db/schema/carrier-trucks.ts` — new Drizzle table
2. `lib/db/schema/trip-carrier-assignments.ts` — new Drizzle table
3. Update `lib/db/schema/carriers.ts` — add columns
4. `bun run db:generate` → commit
5. `bun run db:migrate`

---

## Auto-Filter Logic

When a trip triggers carrier search, the system derives filters automatically:

| Trip field                            | Derived filter                                 |
|---------------------------------------|------------------------------------------------|
| `thermal = true`                      | truck type must be `FRIGO`                     |
| `adr = true`                          | carrier must have `adr_certified = true`       |
| `volumeM3`                            | truck volume ≥ trip volume                     |
| `loadingAddress` / `unloadingAddress` | carrier `routes_served` overlaps these regions |

All filters applied simultaneously. Results ranked by: contract carriers first → then by name.

If zero matches → surface "Add Carrier" inline CTA.

---

## API Routes

| Method   | Path                                                     | Description                                  |
|----------|----------------------------------------------------------|----------------------------------------------|
| `GET`    | `/api/[workspace]/trips/[tripId]/carrier-search`         | Auto-filtered carrier list for this trip     |
| `POST`   | `/api/[workspace]/trips/[tripId]/assign-carrier`         | Assign carrier + upload CMR → advance status |
| `DELETE` | `/api/[workspace]/trips/[tripId]/assign-carrier`         | Unassign (if still CARRIER_ASSIGNED)         |
| `GET`    | `/api/[workspace]/carriers/[carrierId]/trucks`           | List trucks for a carrier                    |
| `POST`   | `/api/[workspace]/carriers/[carrierId]/trucks`           | Add truck to carrier                         |
| `DELETE` | `/api/[workspace]/carriers/[carrierId]/trucks/[truckId]` | Remove truck                                 |

### POST /assign-carrier body

```ts
{
    carrierId: string(uuid)
    truckId ? : string(uuid)
    carrierPrice ? : number
    currency ? : string
    cmrInsurance: string   // file storage key (uploaded separately via /api/upload)
}
```

Validation gate: `carrierId` + `cmrInsurance` both required. Missing either → 422.

---

## File Upload

CMR Insurance is a document file (PDF / image).

**Upload endpoint:** `POST /api/[workspace]/upload`

- Accepts multipart/form-data
- Stores in Vercel Blob or local `/uploads` (configurable via `STORAGE_PROVIDER` env var)
- Returns `{ key: string, url: string }`
- The `key` is then passed to `assign-carrier`

---

## DTOs

**`lib/dto/carrier-assignment.dto.ts`**

```ts
AssignCarrierDto
{
    carrierId: string
    truckId ? : string
    carrierPrice ? : number
    currency ? : string    // default EUR
    cmrInsurance: string // required
}

CarrierSearchResultDto
{
    id: string
    name: string
    contact: string
    adrCertified: boolean
    contractActive: boolean
    matchScore: number   // internal ranking
    trucks: TruckDto[]
}

TruckDto
{
    id: string
    truckType: 'MEGA' | 'PRELATA' | 'FRIGO' | 'JUMBO' | 'SPECIAL'
    volumeM3: number | null
    plateNumber ? : string
}
```

---

## Repository

**`lib/repositories/carrier-assignment.repository.ts`**

```ts
findAssignmentByTrip(tripId)                    → Assignment | null
createAssignment(data)                          → Assignment
deleteAssignment(tripId)                        → void
    searchCarriersForTrip(tripId, filters)          → CarrierWithTrucks[]
```

**`lib/repositories/carrier-truck.repository.ts`**

```ts
findByCarrier(carrierId)                        → Truck[]
create(data)                                    → Truck
delete (truckId, carrierId)                      → void
```

---

## Service

**`lib/services/carrier-assignment.service.ts`**

- `searchCarriers(teamId, tripId)` — derive filters from trip, query, rank results
- `assignCarrier(teamId, tripId, userId, dto)`:
    1. Verify trip in `CREATED` status
    2. Validate carrier belongs to team
    3. Validate CMR key exists in storage
    4. Insert assignment row
    5. Update trip status → `CARRIER_ASSIGNED`
    6. (Auto-advance) Update trip status → `MONITORING`
- `unassignCarrier(teamId, tripId)` — only if `CARRIER_ASSIGNED`

---

## UI Components

### Pages

| Path                                       | Component         | Description              |
|--------------------------------------------|-------------------|--------------------------|
| `/[workspace]/trips/[tripId]/find-carrier` | `FindCarrierPage` | Search + assignment flow |

### Component breakdown

**`FindCarrierPage`**

Layout: trip summary panel (left) + carrier results (right)

Trip summary panel:

- Cargo name, volume, thermal/ADR flags
- Route: loading → unloading
- Active filters chip list (auto-derived)

Carrier results:

- Filter controls: ADR toggle, truck type selector, manual route override
- Carrier cards:
    - Name + contact
    - Contract badge (if active)
    - ADR badge (if certified)
    - Truck list (type + volume)
    - "Select" button
- Empty state: "No carriers match — Add a carrier"

**`CarrierSelectionModal`** (triggered by "Select"):

- Summary: carrier name + selected truck
- Carrier price field + currency
- CMR Insurance file upload (drag & drop)
- "Confirm Assignment" button (disabled until file uploaded)
- Validation error if missing CMR

**`AssignedCarrierPanel`** (shown on TripDetailPage after assignment):

- Carrier name, contact
- Truck type + plate
- Carrier price
- CMR Insurance link (download)
- "Change Carrier" button (if still MONITORING — opens unassign flow)

---

## Carrier Profile Enhancements (Module 2 additions to Carriers UI)

The existing carriers page/form needs new fields exposed:

- ADR certified toggle
- Routes served (tag input — free text regions)
- Contract active toggle + date range picker
- Trucks sub-section: add / remove trucks (type, volume, plate)

---

## Implementation Order

1. Extend `carriers` schema + migrate
2. `carrier_trucks` table + migrate
3. `trip_carrier_assignments` table + migrate
4. `carrier-truck.repository.ts`
5. `carrier-assignment.repository.ts`
6. `carrier-assignment.service.ts`
7. Upload API (`/api/[workspace]/upload`)
8. `/api/[workspace]/trips/[tripId]/carrier-search` route
9. `/api/[workspace]/trips/[tripId]/assign-carrier` route
10. `FindCarrierPage` + `CarrierSelectionModal`
11. `AssignedCarrierPanel` on trip detail
12. Carrier profile form — add new fields + trucks sub-section
13. Typecheck + lint pass

---

## Open Questions

- [ ] Storage provider: Vercel Blob (production) vs local filesystem (dev)? Need `STORAGE_PROVIDER` env var strategy.
- [ ] Route matching: free-text region tags vs structured geography (country codes, cities)?
- [ ] Can a trip be re-assigned to a different carrier after reaching `MONITORING`? If yes — what happens to documents?
- [ ] Carrier price — is this always in the same currency as the client price, or can they differ?
- [ ] Should truck plate numbers be optional (some carriers may not know in advance)?
