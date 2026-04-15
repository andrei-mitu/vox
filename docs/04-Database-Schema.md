# Database Schema

> Tables marked **[planned]** are designed in the TMS module docs and not yet migrated.
> See [[11-Module1-Trip-Creation]], [[12-Module2-Carrier-Assignment]], [[13-Module3-Monitoring]] for full DDL.

---

## Existing tables (migrated ✅)

### `users`

| Column             | Type                 | Notes              |
|--------------------|----------------------|--------------------|
| id                 | uuid PK              | default random     |
| email              | text UNIQUE NOT NULL |                    |
| password_hash      | text NOT NULL        | bcrypt             |
| email_confirmed_at | timestamptz          | null = unconfirmed |
| banned_until       | timestamptz          | null = not banned  |
| created_at         | timestamptz          |                    |
| updated_at         | timestamptz          |                    |

### `profiles`

| Column      | Type               | Notes             |
|-------------|--------------------|-------------------|
| id          | uuid PK FK→users   | 1:1 with users    |
| full_name   | text               |                   |
| system_role | `system_role` enum | `admin` \| `user` |
| avatar_url  | text               |                   |
| created_at  | timestamptz        |                   |
| updated_at  | timestamptz        |                   |

### `teams`

| Column     | Type                   | Notes                 |
|------------|------------------------|-----------------------|
| id         | uuid PK                |                       |
| name       | text NOT NULL          |                       |
| slug       | text UNIQUE NOT NULL   | URL segment           |
| logo_url   | text                   |                       |
| visibility | `team_visibility` enum | `shared` \| `private` |
| created_at | timestamptz            |                       |
| updated_at | timestamptz            |                       |

### `team_members`

| Column     | Type             | Notes                    |
|------------|------------------|--------------------------|
| team_id    | uuid FK→teams    | composite PK             |
| user_id    | uuid FK→users    | composite PK             |
| role       | `team_role` enum | `owner` \| `logistician` |
| created_at | timestamptz      |                          |

### `access_requests`

| Column       | Type                         | Notes                                 |
|--------------|------------------------------|---------------------------------------|
| id           | uuid PK                      |                                       |
| email        | text NOT NULL                |                                       |
| full_name    | text NOT NULL                |                                       |
| company_name | text                         |                                       |
| message      | text                         |                                       |
| status       | `access_request_status` enum | `pending` \| `approved` \| `rejected` |
| created_at   | timestamptz                  |                                       |
| updated_at   | timestamptz                  |                                       |

### `carriers`

| Column        | Type                  | Notes                                |
|---------------|-----------------------|--------------------------------------|
| id            | uuid PK               |                                      |
| team_id       | uuid FK→teams         | cascade delete                       |
| name          | text NOT NULL         |                                      |
| code          | text NOT NULL         | unique per team                      |
| mode          | `carrier_mode` enum   | `air` \| `ocean` \| `road` \| `rail` |
| status        | `carrier_status` enum | `active` \| `inactive`               |
| contact_name  | text                  |                                      |
| contact_email | text                  |                                      |
| contact_phone | text                  |                                      |
| notes         | text                  |                                      |
| created_at    | timestamptz           |                                      |
| updated_at    | timestamptz           |                                      |

Unique: `(team_id, code)`

---

## Planned tables (TMS — not yet migrated)

### `trips` [planned — Module 1]

Core trip record. See [[11-Module1-Trip-Creation]] for full DDL.

Key columns: `team_id`, `created_by`, `status` (enum pipeline), cargo fields, client fields, route fields.

### `carrier_trucks` [planned — Module 2]

Trucks belonging to a carrier. Types: `MEGA` (101m³), `PRELATA` (86m³), `FRIGO` (86m³), `JUMBO` (120m³), `SPECIAL` (
null).

### `trip_carrier_assignments` [planned — Module 2]

Links a trip to a carrier + truck. Also stores `carrier_price` and `cmr_insurance` file key. One row per trip (UNIQUE on
`trip_id`).

### `trip_documents` [planned — Module 3]

Tracks required documents per trip (CMR_INSURANCE, THERMODIAGRAM, ADR, OTHER). Each document has a status: `PENDING` →
`UPLOADED` → `VERIFIED`.

### `trip_checkpoints` [planned — Module 3]

8 ordered checkpoints per trip (LOADED → UNLOADED). Each row stores `reached_at` timestamp once recorded. UNIQUE on
`(trip_id, checkpoint_type)`.

### `alerts` [planned — Module 4]

In-app notifications: payment due, doc deadline, unassigned shipment, overdue payment, checkpoint delay.

---

## Enums

### Existing

| Enum                    | Values                            |
|-------------------------|-----------------------------------|
| `system_role`           | `admin`, `user`                   |
| `team_visibility`       | `shared`, `private`               |
| `team_role`             | `owner`, `logistician`            |
| `carrier_mode`          | `air`, `ocean`, `road`, `rail`    |
| `carrier_status`        | `active`, `inactive`              |
| `access_request_status` | `pending`, `approved`, `rejected` |

### Planned (TMS)

| Enum              | Values                                                                                                                                                                |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `trip_status`     | `CREATED`, `CARRIER_ASSIGNED`, `MONITORING`, `AWAITING_PAYMENT`, `COMPLETED`                                                                                          |
| `truck_type`      | `MEGA`, `PRELATA`, `FRIGO`, `JUMBO`, `SPECIAL`                                                                                                                        |
| `document_type`   | `CMR_INSURANCE`, `THERMODIAGRAM`, `ADR`, `OTHER`                                                                                                                      |
| `document_status` | `PENDING`, `UPLOADED`, `VERIFIED`                                                                                                                                     |
| `checkpoint_type` | `LOADED`, `DEPARTED_LOADING`, `ARRIVED_EXPORT_CUSTOMS`, `CLEARED_EXPORT_CUSTOMS`, `ARRIVED_IMPORT_CUSTOMS`, `CLEARED_IMPORT_CUSTOMS`, `ARRIVED_UNLOADING`, `UNLOADED` |
| `alert_type`      | `PAYMENT_DUE`, `DOC_DEADLINE`, `UNASSIGNED_SHIPMENT`, `OVERDUE_PAYMENT`, `CHECKPOINT_DELAY`                                                                           |

---

## Relations diagram

### Current

```
users ──1:1── profiles
  │
  └──M:M── teams (via team_members)

teams ──1:N── carriers
teams ──1:N── team_members

access_requests (standalone)
```

### After TMS modules

```
users ──1:1── profiles
  │
  └──M:M── teams (via team_members)

teams ──1:N── carriers ──1:N── carrier_trucks
teams ──1:N── trips
  │
  trips ──1:1── trip_carrier_assignments ──N:1── carriers
  trips ──1:N── trip_documents
  trips ──1:N── trip_checkpoints
  trips ──1:N── alerts

access_requests (standalone)
```

---

## Migrations

| File                           | Contents                                                              |
|--------------------------------|-----------------------------------------------------------------------|
| `0000_illegal_leader.sql`      | Initial schema: users, profiles, teams, team_members, access_requests |
| `0001_cynical_vance_astro.sql` | Added carriers table + enums                                          |

Generated by `drizzle-kit`. Never edit manually.

---

## Adding a new table

1. Create `lib/db/schema/<table>.ts`
2. Export from `lib/db/schema/index.ts`
3. Run `bun run db:generate` → new file in `db/migrations/`
4. Run `bun run db:migrate` to apply
5. Commit both the schema file and the migration file
