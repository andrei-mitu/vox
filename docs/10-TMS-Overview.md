# TMS — Transport Management System Overview

> This is the master feature plan for the Vox TMS product.
> Each module links to its own detailed implementation note.

---

## Trip Status Pipeline

```
CREATED → CARRIER_ASSIGNED → MONITORING → AWAITING_PAYMENT → COMPLETED
```

Every trip flows through this pipeline in order. No step can be skipped.

---

## Modules

| # | Module                           | Status         | Detail doc                              |
|---|----------------------------------|----------------|-----------------------------------------|
| 1 | Trip Creation                    | 🔲 Not started | [[11-Module1-Trip-Creation]]            |
| 2 | Carrier Search & Assignment      | 🔲 Not started | [[12-Module2-Carrier-Assignment]]       |
| 3 | Monitoring & Document Management | 🔲 Not started | [[13-Module3-Monitoring]]               |
| 4 | Differentiating Features         | 🔲 Not started | [[14-Module4-Differentiating-Features]] |
| 5 | Additional / Future Features     | 🔲 Backlog     | [[15-Additional-Features]]              |

---

## Module 1 — Trip Creation

Fields captured at trip creation:

**Cargo:** name, type, weight, volume, thermal regime (temp range), thermodiagram upload, ADR (class), phytosanitary (
cost responsibility)

**Client:** company, contact person, agreed price, payment period

**Route:** loading address, loading customs, unloading address, unloading customs, loading date/range

**Metadata:** comments, created-by (auto), status = `CREATED`

**Dashboard:** list all trips, filter by status, open detail, action button → Find Carrier

---

## Module 2 — Carrier Search & Assignment

**Carrier profile fields:** name, contact, routes served, ADR certified, truck fleet, partnership contract (period)

**Truck types:**

| Type    | Volume m³ |
|---------|-----------|
| MEGA    | 101       |
| PRELATA | 86        |
| FRIGO   | 86        |
| JUMBO   | 120       |
| SPECIAL | null      |

**Auto-filter logic:** match by truck type (volume / ADR / thermal → FRIGO), route overlap, ADR capability

**Assignment gate:** carrier + CMR Insurance upload required → status → `MONITORING`

---

## Module 3 — Monitoring & Document Management

**Document tracking:** CMR Insurance, Thermodiagram, ADR docs, custom attachments — each with
`PENDING / UPLOADED / VERIFIED`

**Driver checkpoints:**
Loaded → Departed loading → Arrived export customs → Cleared export customs → Arrived import customs → Cleared import
customs → Arrived unloading → Unloaded

**Transitions:** all unloaded + docs verified → `AWAITING_PAYMENT` → payment confirmed → `COMPLETED`

---

## Module 4 — Differentiating Features

| Feature                    | Description                                                             |
|----------------------------|-------------------------------------------------------------------------|
| Moldova MSign              | Generate + digitally sign contracts, invoices                           |
| Regional Activity Map      | Heatmap of load-up / load-out demand by corridor                        |
| Payment Calendar           | Visual calendar of incoming + outgoing payments                         |
| Logistician Alerts         | Payment due, doc deadline, unassigned trips, overdue, checkpoint delays |
| Financial Calculator / P&L | Per-trip margin, aggregated P&L by day/week/month/YTD/all-time          |

---

## Additional Features (Backlog)

**Operations:** rate management, multi-leg trips, load board integration, carrier rating

**Compliance:** license & insurance expiry tracking, sanctions check, audit trail

**Communication:** per-trip messaging, email/SMS notifications, client portal

**Reporting:** lane profitability, carrier performance, client profitability, forecasting

**Integrations:** GPS/telematics, accounting sync, customs/e-freight APIs
