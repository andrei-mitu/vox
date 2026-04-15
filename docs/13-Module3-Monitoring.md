# Module 3 — Monitoring & Document Management

> Parent: [[10-TMS-Overview]]
> Status: 🔲 Not started
> Depends on: [[12-Module2-Carrier-Assignment]] (trip must be in MONITORING status)

---

## Goal

Once a carrier is assigned, a logistician tracks the live movement of the shipment through driver checkpoints and
manages all required documents. When the truck is unloaded and all documents are verified, the trip moves to
`AWAITING_PAYMENT`.

---

## Database Schema

### Table: `trip_documents`

```sql
CREATE TYPE document_status AS ENUM ('PENDING', 'UPLOADED', 'VERIFIED');
CREATE TYPE document_type AS ENUM ('CMR_INSURANCE', 'THERMODIAGRAM', 'ADR', 'OTHER');

CREATE TABLE trip_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  document_type   document_type NOT NULL,
  label           TEXT,                  -- custom label for OTHER type
  status          document_status NOT NULL DEFAULT 'PENDING',
  file_key        TEXT,                  -- storage key (null until uploaded)
  file_name       TEXT,
  uploaded_by     UUID REFERENCES users(id),
  uploaded_at     TIMESTAMPTZ,
  verified_by     UUID REFERENCES users(id),
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Table: `trip_checkpoints`

```sql
CREATE TYPE checkpoint_type AS ENUM (
  'LOADED',
  'DEPARTED_LOADING',
  'ARRIVED_EXPORT_CUSTOMS',
  'CLEARED_EXPORT_CUSTOMS',
  'ARRIVED_IMPORT_CUSTOMS',
  'CLEARED_IMPORT_CUSTOMS',
  'ARRIVED_UNLOADING',
  'UNLOADED'
);

CREATE TABLE trip_checkpoints (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id           UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  checkpoint_type   checkpoint_type NOT NULL,
  reached_at        TIMESTAMPTZ,         -- null = not yet reached
  notes             TEXT,
  recorded_by       UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (trip_id, checkpoint_type)
);
```

### Auto-populate documents on assignment

When trip transitions to `MONITORING`, seed `trip_documents` rows automatically based on trip flags:

- Always: `CMR_INSURANCE` (already uploaded — status = `UPLOADED`)
- If `thermodiagram = true`: `THERMODIAGRAM` (status = `PENDING`)
- If `adr = true`: `ADR` (status = `PENDING`)

Auto-populate all 8 checkpoint rows as `PENDING` (reached_at = null).

### Migration steps

1. `lib/db/schema/trip-documents.ts`
2. `lib/db/schema/trip-checkpoints.ts`
3. `bun run db:generate` → commit
4. `bun run db:migrate`

---

## Status Transition Logic

### MONITORING → AWAITING_PAYMENT (auto-trigger)

Conditions (checked after every checkpoint or document update):

1. `UNLOADED` checkpoint has `reached_at` set
2. All required documents have `status = VERIFIED`

Both must be true simultaneously. System checks automatically — no manual trigger.

### AWAITING_PAYMENT → COMPLETED

Manual action by logistician: "Mark Payment Received" button on trip detail.

---

## API Routes

### Documents

| Method  | Path                                                       | Description                 |
|---------|------------------------------------------------------------|-----------------------------|
| `GET`   | `/api/[workspace]/trips/[tripId]/documents`                | List all documents for trip |
| `POST`  | `/api/[workspace]/trips/[tripId]/documents`                | Add an OTHER document       |
| `PATCH` | `/api/[workspace]/trips/[tripId]/documents/[docId]/upload` | Upload file to document     |
| `PATCH` | `/api/[workspace]/trips/[tripId]/documents/[docId]/verify` | Mark document verified      |

### Checkpoints

| Method  | Path                                                 | Description                        |
|---------|------------------------------------------------------|------------------------------------|
| `GET`   | `/api/[workspace]/trips/[tripId]/checkpoints`        | List all checkpoints               |
| `PATCH` | `/api/[workspace]/trips/[tripId]/checkpoints/[type]` | Record checkpoint (set reached_at) |

### Payment

| Method  | Path                                        | Description                  |
|---------|---------------------------------------------|------------------------------|
| `PATCH` | `/api/[workspace]/trips/[tripId]/mark-paid` | AWAITING_PAYMENT → COMPLETED |

---

## DTOs

**`lib/dto/monitoring.dto.ts`**

```ts
RecordCheckpointDto {
  reachedAt: string (ISO datetime)   // defaults to NOW() if omitted
  notes?: string
}

UploadDocumentDto {
  fileKey: string
  fileName: string
}

AddDocumentDto {
  label: string   // required for OTHER type
}

VerifyDocumentDto {
  // no body — sets verified_by + verified_at from session user
}
```

---

## Repository

**`lib/repositories/trip-document.repository.ts`**

```ts
findByTrip(tripId)                                → Document[]
create(data)                                      → Document
uploadFile(docId, fileKey, fileName, userId)      → Document
verify(docId, userId)                             → Document
allVerified(tripId)                               → boolean
```

**`lib/repositories/trip-checkpoint.repository.ts`**

```ts
findByTrip(tripId)                                → Checkpoint[]
record(tripId, type, reachedAt, notes, userId)    → Checkpoint
isUnloaded(tripId)                                → boolean
initCheckpoints(tripId)                           → void   // seed 8 rows
```

---

## Service

**`lib/services/monitoring.service.ts`**

- `initMonitoring(tripId)` — called when trip → MONITORING:
    1. Seed all 8 checkpoint rows
    2. Seed document rows based on trip flags
    3. Mark CMR_INSURANCE as UPLOADED (file key from assignment)
- `recordCheckpoint(teamId, tripId, type, dto, userId)`:
    1. Update checkpoint
    2. Check transition condition → advance to AWAITING_PAYMENT if met
- `uploadDocument(teamId, tripId, docId, dto, userId)`:
    1. Update document file key + status = UPLOADED
    2. Check transition condition
- `verifyDocument(teamId, tripId, docId, userId)`:
    1. Set status = VERIFIED
    2. Check transition condition
- `markPaid(teamId, tripId, userId)` → COMPLETED
- `checkTransitionCondition(tripId)` — private, called after every update

---

## UI Components

### Section on TripDetailPage

All monitoring content lives on the existing `TripDetailPage` as collapsible sections:

**Checkpoints section**

- Vertical timeline (8 steps)
- Each step: icon (pending/done), label, timestamp (or "Not reached"), "Record" button
- "Record" opens a small modal: datetime picker + optional notes
- Steps are ordered — cannot mark step N+2 before N+1 (warn if out of order, allow override)
- Visual progress: `X / 8 checkpoints reached`

**Documents section**

- Document rows: type label, status badge (PENDING / UPLOADED / VERIFIED), file name, actions
- Actions by status:
    - PENDING: Upload button → file picker → calls upload API
    - UPLOADED: Download link + "Verify" button (owner/admin only)
    - VERIFIED: Download link + verified-by info + timestamp
- "+ Add Document" → label input → creates OTHER row

**Payment section** (visible only in AWAITING_PAYMENT)

- Summary: client name, agreed price, payment period / due date
- "Mark Payment Received" button → COMPLETED
- Confirmation modal: "Confirm that payment of €X from [client] has been received"

---

### Shared components

- `CheckpointTimeline` — vertical 8-step progress component
- `DocumentRow` — status badge + file actions
- `RecordCheckpointModal` — datetime + notes
- `VerifyDocumentButton` — role-gated (owner/admin only)
- `MonitoringStatusBanner` — banner at top of monitoring section showing what's blocking next step

**`MonitoringStatusBanner` logic:**

| Condition           | Message                                        |
|---------------------|------------------------------------------------|
| Missing checkpoints | "X of 8 checkpoints not yet reached"           |
| Missing documents   | "X document(s) pending upload or verification" |
| All done            | "Ready to advance — awaiting payment"          |

---

## Implementation Order

1. `trip_documents` table + migrate
2. `trip_checkpoints` table + migrate
3. `trip-document.repository.ts`
4. `trip-checkpoint.repository.ts`
5. `monitoring.service.ts`
6. Documents API routes
7. Checkpoints API routes
8. Payment mark-paid route
9. `CheckpointTimeline` component
10. `DocumentRow` component
11. Integrate into `TripDetailPage` — Checkpoints section
12. Integrate into `TripDetailPage` — Documents section
13. Integrate into `TripDetailPage` — Payment section
14. `MonitoringStatusBanner`
15. Auto-transition logic test cases
16. Typecheck + lint pass

---

## Open Questions

- [ ] Can checkpoints be recorded out of order (e.g. skip export customs for domestic trips)?
- [ ] Who can verify documents — any team member, or owner/admin only?
- [ ] When marking payment received — do we record a payment date and who confirmed it?
- [ ] Should there be a way to add a note/comment to a checkpoint after the fact?
- [ ] Thermodiagram: uploaded as a file during monitoring, or referenced from a trip-creation upload?
