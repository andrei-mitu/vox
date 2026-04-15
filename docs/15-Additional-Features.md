# Module 5 — Additional & Future Features

> Parent: [[10-TMS-Overview]]
> Status: 🔲 Backlog — plan before prioritizing, do not implement until Modules 1–4 are stable

---

## Overview

These features extend Vox into a full freight-broker / TMS platform. Each section includes enough detail to estimate
effort and make a priority decision. None are blockers for the core workflow.

---

## Operations

### 5.1 Rate Management

Store, compare, and history-track rate quotes per lane and carrier.

**What it adds:** instead of a one-off price per trip, maintain a rate card per carrier–corridor pair. When creating a
trip, the system suggests the last known rate for that route.

**Schema:**

```sql
CREATE TABLE rate_cards
(
    id            UUID PRIMARY KEY        DEFAULT gen_random_uuid(),
    team_id       UUID           NOT NULL REFERENCES teams (id),
    carrier_id    UUID REFERENCES carriers (id),
    origin_region TEXT           NOT NULL,
    dest_region   TEXT           NOT NULL,
    truck_type    truck_type,
    rate          NUMERIC(12, 2) NOT NULL,
    currency      CHAR(3)                 DEFAULT 'EUR',
    valid_from    DATE,
    valid_to      DATE,
    created_by    UUID REFERENCES users (id),
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
```

**UI:** rate card table per carrier, suggested rate auto-fill on trip creation

**Priority:** Medium — useful once carrier base grows

---

### 5.2 Multi-Leg / Multi-Modal Trips

Split a single shipment across multiple legs: truck → rail → truck, or truck → ferry → truck.

**What it adds:** a parent trip links to N child legs, each with its own carrier, route, and checkpoints. Final status
rolls up from all legs.

**Schema:**

```sql
ALTER TABLE trips
    ADD COLUMN parent_trip_id UUID REFERENCES trips (id),
    ADD COLUMN leg_sequence   INTEGER; -- 1, 2, 3 …
```

**Complexity:** HIGH — status pipeline per leg + rollup logic + UI for multi-leg view

**Priority:** Low for MVP, High for enterprise clients with complex routes

---

### 5.3 Load Board Integration

Post available loads or find loads from external freight exchanges (TimoCom, Trans.eu, Teleroute).

**What it adds:** publish unassigned trips to external load boards; import available capacity from carrier networks.

**Integration type:** REST API per board (each requires commercial access + API credentials)

**Priority:** Low — requires commercial partnerships

---

### 5.4 Carrier Rating System

Score carriers on performance metrics after each completed trip.

**Schema:**

```sql
CREATE TABLE carrier_ratings
(
    id             UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    trip_id        UUID        NOT NULL REFERENCES trips (id) UNIQUE,
    carrier_id     UUID        NOT NULL REFERENCES carriers (id),
    rated_by       UUID        NOT NULL REFERENCES users (id),
    on_time        INTEGER CHECK (on_time BETWEEN 1 AND 5),
    doc_compliance INTEGER CHECK (doc_compliance BETWEEN 1 AND 5),
    damage_rate    INTEGER CHECK (damage_rate BETWEEN 1 AND 5),
    overall        INTEGER CHECK (overall BETWEEN 1 AND 5),
    comment        TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**UI:** post-trip rating prompt (appears when trip → COMPLETED), carrier profile shows avg scores

**Priority:** Medium — builds long-term data quality on carrier reliability

---

## Compliance & Risk

### 5.5 License & Insurance Expiry Tracking

Track expiry dates for carrier documents: operating license, CMR insurance, ADR certificate.

**Schema:**

```sql
CREATE TABLE carrier_compliance_docs
(
    id         UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    carrier_id UUID        NOT NULL REFERENCES carriers (id),
    doc_type   TEXT        NOT NULL, -- 'LICENSE', 'CMR_INSURANCE', 'ADR_CERT', etc.
    expires_at DATE        NOT NULL,
    file_key   TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Alert integration:** feeds into [[14-Module4-Differentiating-Features#4.4 Logistician Alerts]] — alert N days before
expiry

**Priority:** High for compliance-sensitive clients

---

### 5.6 Sanctions / Blacklist Check

Flag carriers or clients that appear on EU/US/UN sanctions lists.

**What it adds:** on carrier or client save, check name against a sanctions list. Warn if match found.

**Data source options:**

- A. OpenSanctions API (free tier available)
- B. EU sanctions list (downloadable XML, self-hosted)
- C. Commercial compliance API (LexisNexis, Dow Jones)

**Priority:** Low for small operations, mandatory for any regulated corridor (Russia, Belarus)

---

### 5.7 Audit Trail

Full history of who changed what on every trip, document, or status transition.

**Schema:**

```sql
CREATE TABLE audit_log
(
    id          UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    team_id     UUID        NOT NULL REFERENCES teams (id),
    user_id     UUID REFERENCES users (id),
    entity_type TEXT        NOT NULL, -- 'trip', 'document', 'carrier', etc.
    entity_id   UUID        NOT NULL,
    action      TEXT        NOT NULL, -- 'created', 'updated', 'status_changed', etc.
    diff        JSONB,                -- before/after snapshot of changed fields
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Integration:** middleware or service-layer hooks on every write operation

**Priority:** High for enterprise; medium for small operations

---

## Communication

### 5.8 Per-Trip Messaging

Threaded conversation between dispatcher, carrier, and client on each trip.

**Schema:**

```sql
CREATE TABLE trip_messages
(
    id         UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    trip_id    UUID        NOT NULL REFERENCES trips (id),
    user_id    UUID        NOT NULL REFERENCES users (id),
    body       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**UI:** chat panel on TripDetailPage, real-time updates via SSE or polling

**Priority:** Medium

---

### 5.9 Email / SMS Notifications

Automated updates to stakeholders at each status change or checkpoint.

**Triggers:**

- Trip created → email to client contact
- Carrier assigned → email to carrier contact
- Each checkpoint reached → optional SMS to client
- AWAITING_PAYMENT → email to client with invoice
- COMPLETED → confirmation email

**Stack:** Resend (email), Twilio (SMS)

**Priority:** Medium — high value for client experience

---

### 5.10 Client Portal

Read-only view for clients to track their shipments without needing a Vox account.

**What it adds:** generate a shareable tracking link per trip → client sees live checkpoint progress + document list (
download only)

**Auth:** magic link token (no password) stored in `trip_access_tokens` table

**Priority:** Medium-High — strong differentiator for client retention

---

## Reporting & Analytics

### 5.11 Lane Profitability Report

Which origin → destination corridors make or lose money.

**Query:** group `trips` by `loading_region + unloading_region`, aggregate margin

**UI:** sortable table + bar chart; export to CSV

---

### 5.12 Carrier Performance Report

Reliability, cost, speed per carrier over a time period.

**Metrics:** on-time rate, avg margin on carrier trips, document compliance rate, checkpoint delay rate

**Depends on:** [[#5.4 Carrier Rating System]] for subjective scores; checkpoint data for timing

---

### 5.13 Client Profitability

Revenue and margin per client over time — who are the most valuable clients.

**Query:** group `trips` by `client_id`, aggregate revenue + margin

**UI:** sortable list, lifetime value trend chart per client

---

### 5.14 Forecasting

Projected revenue/cost based on the pipeline of trips in active statuses.

**Logic:** sum `price` for trips in CREATED + CARRIER_ASSIGNED + MONITORING = projected revenue pipeline

**UI:** pipeline bar on financials dashboard + simple trend extrapolation

---

## Integrations

### 5.15 GPS / Telematics

Live truck position displayed on the activity map during MONITORING status.

**What it adds:** a dot on the map showing where the truck is right now

**Integration:** telematics provider API (Flespi, Wialon, or carrier-provided tracker)

**Data model:** periodic position pings stored in `trip_positions(trip_id, lat, lng, recorded_at)`

**Priority:** Low for MVP, high UX value for monitoring-heavy operations

---

### 5.16 Accounting Software Sync

Export invoices and payment data to accounting tools (1C, QuickBooks, Xero).

**What it adds:** on COMPLETED, push invoice data to accounting system via API or CSV export

**Priority:** Low until client demand confirmed

---

### 5.17 Customs / E-Freight APIs

Automate customs declaration submissions where available (Moldova Customs Service API, EU eFTI).

**Priority:** Very low — regulatory APIs are complex and jurisdiction-specific

---

## Prioritization Summary

| Feature                     | Effort | Value    | Suggested order       |
|-----------------------------|--------|----------|-----------------------|
| 5.4 Carrier Rating          | Low    | Medium   | After Module 3        |
| 5.5 License Expiry Tracking | Low    | High     | After Module 2        |
| 5.7 Audit Trail             | Medium | High     | After Module 3        |
| 5.9 Email Notifications     | Medium | High     | After Module 3        |
| 5.10 Client Portal          | Medium | High     | After Module 3        |
| 5.8 Per-Trip Messaging      | Medium | Medium   | After Module 4        |
| 5.1 Rate Management         | Medium | Medium   | After Module 4        |
| 5.11–5.13 Reports           | Medium | Medium   | After Module 4        |
| 5.2 Multi-Leg Trips         | High   | Medium   | Enterprise phase      |
| 5.6 Sanctions Check         | Medium | Low/High | Corridor-dependent    |
| 5.15 GPS Telematics         | High   | High     | Future phase          |
| 5.3 Load Board              | High   | Low      | Partnership-dependent |
