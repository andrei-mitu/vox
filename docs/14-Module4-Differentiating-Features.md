# Module 4 — Differentiating Features

> Parent: [[10-TMS-Overview]]
> Status: 🔲 Not started
> Depends on: [[11-Module1-Trip-Creation]], [[12-Module2-Carrier-Assignment]], [[13-Module3-Monitoring]]

---

## Overview

These features differentiate Vox from generic TMS tools. They build on top of the core trip pipeline and add
intelligence, legal validity, and financial clarity.

| Feature                        | Priority | Complexity |
|--------------------------------|----------|------------|
| 4.1 Moldova MSign              | High     | High       |
| 4.2 Regional Activity Map      | Medium   | High       |
| 4.3 Payment Calendar           | High     | Medium     |
| 4.4 Logistician Alerts         | High     | Medium     |
| 4.5 Financial Calculator / P&L | High     | Medium     |

---

## 4.1 Moldova MSign — Digital Document Generation

### What it does

Generate legally binding documents (contracts, invoices, CMR confirmations) with **Moldova MSign** digital signatures —
no paper required.

### Database Schema

```sql
CREATE TYPE msign_doc_type AS ENUM ('CONTRACT', 'INVOICE', 'CMR_CONFIRMATION', 'OTHER');
CREATE TYPE msign_doc_status AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'REJECTED');

CREATE TABLE msign_documents
(
    id           UUID PRIMARY KEY          DEFAULT gen_random_uuid(),
    trip_id      UUID REFERENCES trips (id),
    team_id      UUID             NOT NULL REFERENCES teams (id),
    doc_type     msign_doc_type   NOT NULL,
    status       msign_doc_status NOT NULL DEFAULT 'DRAFT',
    msign_ref    TEXT, -- external MSign document reference ID
    file_key     TEXT, -- signed PDF storage key
    generated_by UUID             NOT NULL REFERENCES users (id),
    signed_at    TIMESTAMPTZ,
    created_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);
```

### API Routes

| Method | Path                                      | Description                      |
|--------|-------------------------------------------|----------------------------------|
| `POST` | `/api/[workspace]/msign/generate`         | Generate document from trip data |
| `GET`  | `/api/[workspace]/msign/[docId]/status`   | Poll signature status            |
| `POST` | `/api/[workspace]/msign/[docId]/send`     | Send for signature via MSign     |
| `GET`  | `/api/[workspace]/msign/[docId]/download` | Download signed PDF              |

### Implementation notes

- MSign API integration: `lib/services/msign.service.ts`
- Document templates: `lib/msign/templates/` — one Handlebars/JSX template per doc type
- Populate templates from trip + assignment + team data
- Send to MSign API → receive `msign_ref` → poll status webhook or manual check
- On signed status → download PDF → store in Vercel Blob → save `file_key`

### UI

- On `TripDetailPage` — Documents section — "Generate Document" dropdown
- MSign Documents list: type, status badge, signed date, download/send actions
- Status badge: DRAFT → PENDING SIGNATURE → SIGNED / REJECTED

### Open Questions

- [ ] MSign API documentation — do we have sandbox credentials?
- [ ] Which document types are mandatory per trip type?
- [ ] Can a document be re-generated after rejection?

---

## 4.2 Regional Activity Map

### What it does

Heatmap visualization showing which corridors/regions have the most:

- **Load-up demand** — where trips are being picked up
- **Load-out demand** — where trips are being delivered

Helps the team spot high-demand corridors and underserved areas.

### Data source

Aggregate from `trips` table: group by `loading_address` and `unloading_address` regions.

### Database

No new tables — query `trips` with aggregations:

```sql
SELECT loading_address,
       COUNT(*) as load_up_count
FROM trips
WHERE team_id = $1
  AND created_at > NOW() - INTERVAL '90 days'
GROUP BY loading_address
ORDER BY load_up_count DESC;
```

Need: structured region data. Options:

- A. Free-text addresses → geocode to coordinates → aggregate by bounding box
- B. Add `loading_region` + `unloading_region` fields to `trips` (dropdown from a regions list)

**Recommendation: Option B** — simpler, no geocoding dependency.

```sql
ALTER TABLE trips
    ADD COLUMN loading_region   TEXT,
    ADD COLUMN unloading_region TEXT;
```

### API Routes

| Method | Path                                      | Description             |
|--------|-------------------------------------------|-------------------------|
| `GET`  | `/api/[workspace]/analytics/activity-map` | Region aggregation data |

Query params: `days` (default 90), `type` (load_up / load_out / both)

### UI Component

- `/[workspace]/analytics/map` page
- Map library: **Leaflet** (lightweight, OSS) or **Mapbox GL** (rich styling)
- Overlay: circle markers sized by trip count, colored by demand intensity
- Toggle: Load-up / Load-out / Both
- Time range filter: 7d / 30d / 90d / 1y
- Sidebar: top 10 corridors ranked by volume

### Open Questions

- [ ] Map library choice: Leaflet vs Mapbox (Mapbox requires API key + billing)
- [ ] Region taxonomy: country-level, city-level, or custom corridor strings?
- [ ] Include cancelled/deleted trips in the map or only completed?

---

## 4.3 Payment Calendar

### What it does

Visual calendar showing:

- **Incoming payments** — when clients owe the company (based on client price + payment period)
- **Outgoing payments** — when the company owes carriers (based on carrier price + payment terms)

### Database

Computed from `trips` + `trip_carrier_assignments`:

```sql
-- Incoming (client owes us)
SELECT id,
       cargo_name,
       client_name,
       price,
       currency,
       loading_date_from + payment_period AS due_date,
       status
FROM trips
WHERE team_id = $1
  AND status IN ('AWAITING_PAYMENT', 'COMPLETED');

-- Outgoing (we owe carrier)
SELECT t.id,
       t.cargo_name,
       c.name                   AS carrier_name,
       a.carrier_price,
       a.currency,
       t.loading_date_from + 30 AS due_date -- carrier payment terms (configurable)
FROM trips t
         JOIN trip_carrier_assignments a ON a.trip_id = t.id
         JOIN carriers c ON c.id = a.carrier_id
WHERE t.team_id = $1
  AND t.status IN ('AWAITING_PAYMENT', 'COMPLETED');
```

Need: `carrier_payment_period` on `trip_carrier_assignments` (add column).

### API Routes

| Method | Path                                 | Description                   |
|--------|--------------------------------------|-------------------------------|
| `GET`  | `/api/[workspace]/payments/calendar` | Calendar events (month range) |
| `GET`  | `/api/[workspace]/payments/upcoming` | Next N payments list          |

Query params: `from` (date), `to` (date), `type` (incoming / outgoing / both)

### UI Component

- `/[workspace]/payments/calendar` page
- Calendar library: **FullCalendar** (React) or custom week/month grid
- Color coding:
    - Green events: incoming payments due
    - Red events: outgoing payments due
- Click event → trip detail side panel
- Month navigation
- Summary bar: total incoming vs outgoing in current view

### Open Questions

- [ ] What is the carrier payment period — fixed (e.g. net 30) or per-assignment?
- [ ] Show overdue payments (past-due date, status still AWAITING_PAYMENT) in red highlight?
- [ ] Export to CSV or PDF for accounting?

---

## 4.4 Logistician Alerts

### What it does

Proactive notifications surfaced in-app (and optionally by email/SMS) to prevent dropped balls.

### Alert Types

| Alert                      | Trigger Condition                              | Urgency |
|----------------------------|------------------------------------------------|---------|
| Payment due tomorrow       | Trip in AWAITING_PAYMENT, due_date = tomorrow  | High    |
| Document exchange deadline | Trip document with deadline approaching        | High    |
| Unassigned shipments       | Trip in CREATED for > 24h without carrier      | Medium  |
| Overdue payment            | Past payment_period, status = AWAITING_PAYMENT | High    |
| Checkpoint delay           | Expected next checkpoint not reached in time   | Medium  |

### Database Schema

```sql
CREATE TYPE alert_type AS ENUM (
    'PAYMENT_DUE',
    'DOC_DEADLINE',
    'UNASSIGNED_SHIPMENT',
    'OVERDUE_PAYMENT',
    'CHECKPOINT_DELAY'
    );
CREATE TYPE alert_status AS ENUM ('ACTIVE', 'DISMISSED', 'RESOLVED');

CREATE TABLE alerts
(
    id          UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    team_id     UUID         NOT NULL REFERENCES teams (id),
    trip_id     UUID REFERENCES trips (id),
    user_id     UUID REFERENCES users (id), -- null = all logisticians on team
    alert_type  alert_type   NOT NULL,
    message     TEXT         NOT NULL,
    status      alert_status NOT NULL DEFAULT 'ACTIVE',
    due_at      TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
```

### Alert Generation

Two approaches (pick one or combine):

- **A. Cron job** — scheduled task runs every hour, evaluates all trips, creates/resolves alerts
- **B. Event-driven** — alert rows created/resolved as side effects of status transitions and document actions

**Recommendation: A + B hybrid** — event-driven for immediate triggers (unassigned, overdue), cron for time-based
checks (due tomorrow, checkpoint delay).

Cron: `scripts/generate-alerts.ts` — run via Vercel Cron or external scheduler.

### API Routes

| Method  | Path                                        | Description                 |
|---------|---------------------------------------------|-----------------------------|
| `GET`   | `/api/[workspace]/alerts`                   | List active alerts for team |
| `PATCH` | `/api/[workspace]/alerts/[alertId]/dismiss` | Dismiss alert               |
| `PATCH` | `/api/[workspace]/alerts/[alertId]/resolve` | Mark resolved               |

### UI

- **Alert bell icon** in sidebar header — badge count of active alerts
- **Alerts panel** (slide-out or `/alerts` page):
    - Grouped by urgency: HIGH → MEDIUM
    - Each alert: icon, message, trip link, due date, dismiss button
    - "Dismiss all" bulk action
- **Dashboard widget**: top 3 active alerts

### Open Questions

- [ ] Email/SMS notifications — which provider? (Resend for email, Twilio for SMS)
- [ ] Alert frequency: once per condition or re-alert if not dismissed?
- [ ] Who receives alerts — all team members or only the logistician who created the trip?
- [ ] Checkpoint delay — how many hours late triggers an alert?

---

## 4.5 Financial Calculator / P&L Dashboard

### What it does

Per-trip P&L and aggregated views showing revenue, costs, and margin over time.

### Per-trip P&L formula

```
Revenue    = trips.price (client rate)
Cost       = trip_carrier_assignments.carrier_price
             + phytosanitary cost (if phyto_cost_by = CARRIER → deduct from margin)
             + any extra costs (future: extra_costs table)
Margin     = Revenue − Cost
Margin %   = Margin / Revenue × 100
```

### Database

No new tables for MVP. Query from `trips` + `trip_carrier_assignments`:

```sql
SELECT t.id,
       t.cargo_name,
       t.price                                                 AS revenue,
       a.carrier_price                                         AS cost,
       (t.price - a.carrier_price)                             AS margin,
       ROUND(((t.price - a.carrier_price) / t.price) * 100, 2) AS margin_pct,
       t.currency,
       t.created_at
FROM trips t
         LEFT JOIN trip_carrier_assignments a ON a.trip_id = t.id
WHERE t.team_id = $1
  AND t.status IN ('MONITORING', 'AWAITING_PAYMENT', 'COMPLETED');
```

Future: `extra_costs` table per trip (insurance premiums, phyto fees, etc.)

### Aggregation Time Frames

| Frame        | SQL filter                                                     |
|--------------|----------------------------------------------------------------|
| Today        | `DATE(created_at) = CURRENT_DATE`                              |
| This week    | `DATE_TRUNC('week', created_at) = DATE_TRUNC('week', NOW())`   |
| This month   | `DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())` |
| MTD          | same as This month                                             |
| This year    | `DATE_TRUNC('year', created_at) = DATE_TRUNC('year', NOW())`   |
| YTD          | same as This year                                              |
| Last 5 years | `created_at >= NOW() - INTERVAL '5 years'`                     |
| All time     | no filter                                                      |

### API Routes

| Method | Path                                     | Description                     |
|--------|------------------------------------------|---------------------------------|
| `GET`  | `/api/[workspace]/financials/summary`    | Aggregated P&L for a time frame |
| `GET`  | `/api/[workspace]/financials/trips`      | Per-trip P&L list (paginated)   |
| `GET`  | `/api/[workspace]/financials/by-carrier` | P&L grouped by carrier          |
| `GET`  | `/api/[workspace]/financials/by-client`  | P&L grouped by client           |

Query params: `frame` (today/week/month/ytd/year/5y/all), `currency`

### UI

**`/[workspace]/financials` page**

- Time frame selector (tab strip or dropdown)
- Summary cards:
    - Total Revenue
    - Total Cost
    - Total Margin
    - Avg Margin %
- Revenue vs Cost bar chart (by week/month depending on frame)
- Margin trend line chart
- Per-trip table: cargo, client, revenue, cost, margin, margin %
- Group-by toggle: by carrier / by client

**Dashboard widget** (on main dashboard):

- This month: Revenue / Cost / Margin in 3 mini cards

### Open Questions

- [ ] Multi-currency handling — convert to base currency (EUR) for aggregation? Exchange rate source?
- [ ] Individual vs team P&L — can a logistician see only their own trips' P&L?
- [ ] Extra costs — where are they entered? Per-trip "extras" section, or invoice uploads?
- [ ] Should margin calculations include time-value (payment received date) or just agreement date?
