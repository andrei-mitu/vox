# UI Navigation — Detail Pages

> Applies to: carriers, clients, shipments/trips, routes.
> Implementation phases tracked in [[02-Roadmap]].

---

## Design principle

Every entity follows the same two-level pattern:

- **List page** — discovery, filtering, creation. Row click navigates away; no modals for editing.
- **Detail page** — tabbed view of the entity + all its related data. Edit happens inline on the Details tab.

---

## URL structure

```
/[workspace]/carriers                          list
/[workspace]/carriers/[carrierId]              → redirect to .../details
/[workspace]/carriers/[carrierId]/details      details tab (inline edit)
/[workspace]/carriers/[carrierId]/shipments    paginated shipments
/[workspace]/carriers/[carrierId]/clients      clients via shipments
/[workspace]/carriers/[carrierId]/routes       routes serviced

/[workspace]/clients                           list
/[workspace]/clients/[clientId]                → redirect to .../details
/[workspace]/clients/[clientId]/details        details tab
/[workspace]/clients/[clientId]/shipments      client's shipments
/[workspace]/clients/[clientId]/carriers       carriers used

/[workspace]/shipments                         list (status filter tabs)
/[workspace]/shipments/[shipmentId]            → redirect to .../details
/[workspace]/shipments/[shipmentId]/details    details + status pipeline
/[workspace]/shipments/[shipmentId]/carrier    assigned carrier card
/[workspace]/shipments/[shipmentId]/documents  CMR + attachments
/[workspace]/shipments/[shipmentId]/timeline   checkpoint timeline

/[workspace]/routes                            list (new entity)
/[workspace]/routes/[routeId]                  → redirect to .../details
/[workspace]/routes/[routeId]/details          details + static map
/[workspace]/routes/[routeId]/shipments        shipments on this route
/[workspace]/routes/[routeId]/carriers         carriers that service it
```

URL param is the entity UUID. No custom slug needed.

---

## Detail page shell

Every detail page uses the same layout wrapper:

```
┌─────────────────────────────────────────────────────────────┐
│  [← Back to Carriers]                                       │
│  Carrier Name                    [Edit]  [Delete]           │
│  code · mode · status badge                                 │
├─────────────────────────────────────────────────────────────┤
│  Details | Shipments (12) | Clients (4) | Routes (3)        │
├─────────────────────────────────────────────────────────────┤
│  <tab content>                                              │
└─────────────────────────────────────────────────────────────┘
```

- Header: entity name, key meta badges, Edit / Delete actions
- Tab bar: labels with live counts in parentheses (fetched server-side)
- Active tab segment drives the URL (`/details`, `/shipments`, etc.)

---

## Tab content per entity

### Carrier

| Tab       | Content                                                                                                   |
|-----------|-----------------------------------------------------------------------------------------------------------|
| Details   | Contact info, mode, status, notes. Inline-editable form.                                                  |
| Shipments | Paginated table: shipment #, client, origin → dest, status, date. Row click → `/shipments/[id]/details`   |
| Clients   | Paginated table: client name, total shipments with this carrier. Row click → `/clients/[id]/details`      |
| Routes    | List + optional heatmap / map view of routes this carrier has covered. Row click → `/routes/[id]/details` |

### Client

| Tab       | Content                                                                                                  |
|-----------|----------------------------------------------------------------------------------------------------------|
| Details   | Contact name, email, phone, billing address, notes. Inline-editable.                                     |
| Shipments | Paginated table: shipment #, carrier, origin → dest, status, date. Row click → `/shipments/[id]/details` |
| Carriers  | Paginated table: carrier name, code, mode, # shipments together. Row click → `/carriers/[id]/details`    |

### Shipment / Trip

| Tab       | Content                                                                                                 |
|-----------|---------------------------------------------------------------------------------------------------------|
| Details   | Origin, destination, cargo, weight, value, status pipeline indicator, dates.                            |
| Carrier   | Assigned carrier card (name, contact, mode). Link → `/carriers/[id]/details`. Assign / reassign action. |
| Documents | Upload + list CMR, insurance, customs docs. Download / verify actions.                                  |
| Timeline  | Checkpoint list ordered by date. Each checkpoint: location, status, timestamp, notes.                   |

### Route

| Tab       | Content                                                                                                                  |
|-----------|--------------------------------------------------------------------------------------------------------------------------|
| Details   | Origin city/country, destination city/country, distance (km), estimated transit days. Static map or heatmap placeholder. |
| Shipments | Paginated table of shipments that used this route.                                                                       |
| Carriers  | Carriers that have delivered on this route with count + avg transit time.                                                |

---

## List page behaviour changes

- **Row click** → navigates to detail page (no modal).
- **"..." overflow menu per row** → Delete only (destructive action stays reachable without navigating away).
- Edit modal removed from list pages entirely.

---

## Component architecture

```
components/
  detail-shell/
    DetailShell.tsx       layout wrapper: header + tab bar
    DetailHeader.tsx      name + badges + Edit/Delete row
    DetailTabs.tsx        Radix Tabs nav, syncs with URL segment
  carriers/
    CarriersClient.tsx    existing list component (updated: row → navigate)
    CarrierDetailPage.tsx server component — fetches carrier, renders shell
    tabs/
      CarrierDetailsTab.tsx
      CarrierShipmentsTab.tsx
      CarrierClientsTab.tsx
      CarrierRoutesTab.tsx
  clients/
    ClientsClient.tsx     existing (updated)
    ClientDetailPage.tsx
    tabs/
      ClientDetailsTab.tsx
      ClientShipmentsTab.tsx
      ClientCarriersTab.tsx
  shipments/
    ShipmentsClient.tsx
    ShipmentDetailPage.tsx
    tabs/
      ShipmentDetailsTab.tsx
      ShipmentCarrierTab.tsx
      ShipmentDocumentsTab.tsx
      ShipmentTimelineTab.tsx
  routes/
    RoutesClient.tsx      new list component (mirrors CarriersClient)
    RouteDetailPage.tsx
    tabs/
      RouteDetailsTab.tsx
      RouteShipmentsTab.tsx
      RouteCarriersTab.tsx
```

`DetailShell` is the only shared layout wrapper. Each entity owns its own tab components.

---

## Sidebar

Add **Routes** as a new nav item after Shipments.

```
Dashboard
Shipments
Routes          ← new
Carriers
Clients
```

---

## Back navigation

Each detail page carries a breadcrumb / back link that returns to the list:

```
← Carriers    →  /[workspace]/carriers
← Clients     →  /[workspace]/clients
← Shipments   →  /[workspace]/shipments
← Routes      →  /[workspace]/routes
```

---

## Related docs

- [[02-Roadmap]] — implementation phases for this work
- [[04-Database-Schema]] — `routes` table (new), `shipments` table (planned)
- [[11-Module1-Trip-Creation]] — shipments / trips schema detail
