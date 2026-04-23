# Refactoring Plan

> Audit date: 2026-04-23  
> Scope: full codebase — 60+ duplication instances found across carriers / clients / routes

---

## 1 — Zod field primitives  `lib/validation/fields.ts`

**Problem.** The same field definitions are copy-pasted across every DTO:

| Field                                                 | Duplicated in          |
|-------------------------------------------------------|------------------------|
| `name` (`min 1`, `max 200`, `trim`)                   | carrier, client        |
| `contactName` (`max 200`, nullable, optional)         | carrier, client        |
| `contactEmail` (email, `max 254`, nullable, optional) | carrier, client        |
| `contactPhone` (`max 50`, nullable, optional)         | carrier, client        |
| `notes` (`max 2000`, nullable, optional)              | carrier, client, route |
| `email` (login)                                       | auth                   |

**Fix.** Create `lib/validation/fields.ts` — one definition per field type, with a `required()` helper that strips
`nullable().optional()`:

```ts
// lib/validation/fields.ts
import { z } from 'zod';

const opt = <T extends z.ZodTypeAny>(s: T) => s.nullable().optional();

export const fields = {
    name: (req = true) => req
        ? z.string().trim().min(1, 'Name is required').max(200)
        : opt(z.string().trim().max(200)),
    contactName: (req = false) => req
        ? z.string().trim().min(1).max(200)
        : opt(z.string().trim().max(200)),
    email: (req = false) => req
        ? z.string().trim().email('Enter a valid email').max(254)
        : opt(z.string().trim().email('Enter a valid email').max(254)),
    phone: (req = false) => req
        ? z.string().trim().max(50)
        : opt(z.string().trim().max(50)),
    notes: (req = false) => req
        ? z.string().trim().max(2000)
        : opt(z.string().trim().max(2000)),
    address: (req = false) => req
        ? z.string().trim().max(500)
        : opt(z.string().trim().max(500)),
    uuid: () => z.string().uuid(),
};
```

Then every DTO becomes:

```ts
// carrier.dto.ts (after)
import { fields } from '@/lib/validation/fields';

export const createCarrierSchema = z.object({
    name: fields.name(),
    contactName: fields.contactName(),
    contactEmail: fields.email(),
    contactPhone: fields.phone(),
    notes: fields.notes(),
    // ...carrier-specific fields
});
```

**Files to update:** `lib/dto/carrier.dto.ts`, `lib/dto/client.dto.ts`, `lib/dto/route.dto.ts`, `lib/dto/auth.dto.ts`

---

## 2 — DTO parse helper factory  `lib/validation/parse.ts`

**Problem.** Every DTO has two identical parse functions — one for route handlers (returns message string), one for
client forms (returns field errors map) — copy-pasted 3× each.

**Fix.** Create two factories:

```ts
// lib/validation/parse.ts
import type { ZodType } from 'zod';

// For route handlers — returns { ok, data } | { ok, message }
export function makeBodyParser<T>(schema: ZodType<T>) {
    return (input: unknown): { ok: true; data: T } | { ok: false; message: string } => {
        const r = schema.safeParse(input);
        if ( !r.success ) return { ok: false, message: r.error.issues[0]?.message ?? 'Invalid input' };
        return { ok: true, data: r.data };
    };
}

// For client forms — returns { ok, data } | { ok, fieldErrors }
export function makeFormParser<T>(schema: ZodType<T>) {
    return (input: unknown): { ok: true; data: T } | { ok: false; fieldErrors: Record<string, string> } => {
        const r = schema.safeParse(input);
        if ( !r.success ) {
            const flat = r.error.flatten().fieldErrors;
            const errors: Record<string, string> = {};
            for ( const [k, msgs] of Object.entries(flat) ) {
                if ( msgs?.[0] ) errors[k] = msgs[0];
            }
            return { ok: false, fieldErrors: errors };
        }
        return { ok: true, data: r.data };
    };
}
```

Then every DTO shrinks to schema definitions only, with:

```ts
export const parseCreateCarrierBody = makeBodyParser(createCarrierSchema);
export const parseUpdateCarrierBody = makeBodyParser(updateCarrierSchema);
```

**Files to update:** all `lib/dto/*.ts`, delete the manually written parse functions.

---

## 3 — Route handler auth middleware  `lib/api/with-workspace.ts`

**Problem.** Every single route handler (15+ handlers) repeats:

```ts
const user = await getSessionUser();
if ( !user ) return ApiResponse.unauthorized();

const access = await assertWorkspaceAccess(slug, user);
if ( !access.ok ) return ApiResponse.error('Not found', access.status);
```

**Fix.** A higher-order wrapper:

```ts
// lib/api/with-workspace.ts
type WorkspaceHandler = (
    req: Request,
    ctx: { slug: string; team: Team; user: SessionUserDto; params: Record<string, string> }
) => Promise<Response>;

export function withWorkspace(handler: WorkspaceHandler) {
    return async (req: Request, { params }: { params: Promise<Record<string, string>> }) => {
        const { workspace: slug, ...rest } = await params;

        const user = await getSessionUser();
        if ( !user ) return ApiResponse.unauthorized();

        const access = await assertWorkspaceAccess(slug, user);
        if ( !access.ok ) return ApiResponse.error('Not found', access.status);

        try {
            return await handler(req, { slug, team: access.team, user, params: rest });
        } catch ( error ) {
            return ApiResponse.internalServerError(error);
        }
    };
}
```

Route handler before → after:

```ts
// Before (25 lines of boilerplate)
export async function GET(request: Request, { params }:

...)
{
    const { workspace: slug, carrierId } = await params;
    const user = await getSessionUser();
    if ( !user ) return ApiResponse.unauthorized();
    const access = await assertWorkspaceAccess(slug, user);
    if ( !access.ok ) return ApiResponse.error('Not found', access.status);
    try {
        const carrier = await getCarrier(access.team.id, carrierId);
        if ( !carrier ) return ApiResponse.notFound('Carrier not found');
        return ApiResponse.ok(carrier);
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}

// After (6 lines)
export const GET = withWorkspace(async (_req, { team, params }) => {
    const carrier = await getCarrier(team.id, params.carrierId);
    if ( !carrier ) return ApiResponse.notFound('Carrier not found');
    return ApiResponse.ok(carrier);
});
```

**Files to update:** all `app/api/[workspace]/**/*.ts` — ~6 files, ~4 handlers each.

---

## 4 — Generic `DeleteButton` component  `components/ui/DeleteButton.tsx`

**Problem.** `CarrierDeleteButton`, `ClientDeleteButton`, `RouteDeleteButton` are 95% identical — same state, same
`handleDelete` logic, same `AlertDialog` JSX. Only the entity name, endpoint, and redirect path differ.

**Fix.** One generic component:

```ts
// components/ui/DeleteButton.tsx
interface DeleteButtonProps {
    endpoint: string;       // e.g. `/api/${slug}/carriers/${id}`
    redirectTo: string;     // e.g. `/${slug}/carriers`
    entityLabel: string;    // e.g. "carrier"
    entityName: string;     // displayed in confirmation — uses current value
}
```

Usage (replaces all three delete button files):

```tsx
<DeleteButton
    endpoint={ `/api/${ workspaceSlug }/carriers/${ carrier.id }` }
    redirectTo={ `/${ workspaceSlug }/carriers` }
    entityLabel="carrier"
    entityName={ form.name }
/>
```

**Files to delete:** `CarrierDeleteButton.tsx`, `ClientDeleteButton.tsx`, `RouteDeleteButton.tsx`  
**Files to update:** `CarrierDetailsTab.tsx`, `ClientDetailsTab.tsx`, `RouteDetailsTab.tsx`, layouts.

---

## 5 — Generic `EntityDialog` component  `components/ui/EntityDialog.tsx`

**Problem.** `CarrierDialog`, `ClientDialog`, `RouteDialog` share identical props shape, state management,
`handleOpenChange`, `set<K>`, `handleSubmit`, and dialog container JSX.

**Fix.** A generic form dialog driven by field config:

```ts
// components/ui/EntityDialog.tsx
interface EntityDialogProps<TForm, TDto> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (entity: TDto) => void;
    entityLabel: string;            // "carrier", "client", "route"
    defaultForm: () => TForm;
    toForm?: (dto: TDto) => TForm;  // for edit mode
    entity?: TDto;
    endpoint: string | ((form: TForm) => string);  // POST vs PATCH
    schema: ZodType<TForm>;
    children: (ctx: { form: TForm; set: SetFn<TForm> }) => ReactNode;
}
```

The common logic (state, submit, error handling) lives once inside `EntityDialog`. Each entity's dialog becomes:

```tsx
// components/carriers/CarrierDialog.tsx (after)
export function CarrierDialog({ carrier, workspaceSlug, ...rest }: CarrierDialogProps) {
    return (
        <EntityDialog
            entityLabel="carrier"
            defaultForm={ defaultCarrierForm }
            toForm={ carrierToForm }
            entity={ carrier }
            endpoint={ carrier
                ? `/api/${ workspaceSlug }/carriers/${ carrier.id }`
                : `/api/${ workspaceSlug }/carriers` }
            schema={ createCarrierSchema }
            { ...rest }
        >
            { ({ form, set }) => (
                // just the fields
            ) }
        </EntityDialog>
    );
}
```

**Files to update:** `CarrierDialog.tsx`, `ClientDialog.tsx`, `RouteDialog.tsx`

---

## 6 — Generic `EntityList` component  `components/ui/EntityList.tsx`

**Problem.** `CarriersClient`, `ClientsClient`, `RoutesClient` share:

- Identical delete state + delete handler (with local list mutation)
- Identical empty state UI
- Identical `AlertDialog` for delete confirmation
- Same table row click → detail page navigation

**Fix.** A generic list component:

```ts
interface EntityListProps<T extends { id: string }> {
    workspaceSlug: string;
    items: T[];
    entityLabel: string;           // "carrier"
    entityLabelPlural: string;     // "carriers"
    detailPath: (item: T) => string;
    columns: ColumnDef<T>[];
    dialog: ReactNode | ((open: boolean, onOpenChange:
    ...) =>
    ReactNode
    );
}
```

Each *Client file then only defines its columns and delegates everything else:

```tsx
// CarriersClient.tsx (after)
export function CarriersClient({ carriers, workspaceSlug }:

...)
{
    return (
        <EntityList
            workspaceSlug={ workspaceSlug }
            items={ carriers }
            entityLabel="carrier"
            entityLabelPlural="carriers"
            detailPath={ (c) => `/${ workspaceSlug }/carriers/${ c.id }/details` }
            columns={ carrierColumns }
            dialog={ (open, onOpenChange) => (
                <CarrierDialog open={ open } onOpenChange={ onOpenChange } ... />
                ) }
        />
    );
}
```

**Files to update:** `CarriersClient.tsx`, `ClientsClient.tsx`, `RoutesClient.tsx`

---

## 7 — Generic CRUD repository base  `lib/repositories/base.repository.ts`

**Problem.** `carrier.repository.ts`, `client.repository.ts`, `route.repository.ts` have 5 identical functions —
`findById`, `findByTeamId`, `create`, `update`, `delete` — differing only in the Drizzle table reference and type
parameter.

**Fix.** A factory function that generates the five standard functions for a given table:

```ts
// lib/repositories/base.repository.ts
import {
    and,
    eq
}                                  from 'drizzle-orm';
import type { PgTableWithColumns } from 'drizzle-orm/pg-core';
import { getDb }                   from '@/lib/db';

export function makeCrudRepository<TTable extends PgTableWithColumns<any>, TSelect, TInsert>(
    table: TTable,
    orderByCol?: TTable['_']['columns'][string],
) {
    return {
        findById: async (id: string, teamId: string): Promise<TSelect | null> => { ...
        },
        findByTeamId: async (teamId: string): Promise<TSelect[]> => { ...
        },
        create: async (data: TInsert): Promise<TSelect> => { ...
        },
        update: async (id: string, teamId: string, data: Partial<TInsert>): Promise<TSelect | null> => { ...
        },
        delete: async (id: string, teamId: string): Promise<boolean> => { ...
        },
    };
}
```

Each repository then calls the factory and adds entity-specific queries on top:

```ts
// carrier.repository.ts (after)
const base = makeCrudRepository<typeof carriers, Carrier, NewCarrier>(carriers, carriers.name);
export const { findById: findCarrierById, findByTeamId: findCarriersByTeamId, ... } = base;

// entity-specific extras stay here
export async function findCarriersByMode(...) { ...
}
```

**Files to update:** `carrier.repository.ts`, `client.repository.ts`, `route.repository.ts`

---

## 8 — Client-side API fetch utilities  `lib/client/api.ts`

**Problem.** Every client component (delete buttons, dialogs, form hooks) has the same fetch boilerplate:

```ts
const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
if ( !res.ok ) {
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? 'Something went wrong.');
    return;
}
```

**Fix.** Typed helpers that return discriminated unions:

```ts
// lib/client/api.ts
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function apiPatch<T>(url: string, body: unknown): Promise<ApiResult<T>> { ...
}

export async function apiPost<T>(url: string, body: unknown): Promise<ApiResult<T>> { ...
}

export async function apiDelete(url: string): Promise<ApiResult<void>> { ...
}
```

All three helpers share the same response-parsing logic, returning a consistent `ApiResult`. Callers become:

```ts
const result = await apiDelete(`/api/${ workspaceSlug }/carriers/${ id }`);
if ( !result.ok ) {
    setError(result.error);
    return;
}
router.push(`/${ workspaceSlug }/carriers`);
```

**Files to update:** all `*DeleteButton.tsx`, all `*Dialog.tsx`, `hooks/use-*.ts`

---

## 9 — Shared empty state with CTA  `components/ui/EmptyState.tsx`

**Problem.** The list empty states in `CarriersClient`, `ClientsClient`, `RoutesClient` are identical except for the
label text.

> `EmptyTabState` (detail page tabs) is already extracted — this is for the *list page* variant that includes a CTA
> button.

**Fix.**

```ts
// components/ui/EmptyState.tsx
interface EmptyStateProps {
    message: string;        // "No carriers yet."
    action?: { label: string; onClick: () => void };
}
```

**Files to update:** `CarriersClient.tsx`, `ClientsClient.tsx`, `RoutesClient.tsx`

---

## Implementation order

| Step | Item                                         | Effort | Impact                                |
|------|----------------------------------------------|--------|---------------------------------------|
| 1    | Zod field primitives (`fields.ts`)           | S      | high — eliminates silent divergence   |
| 2    | Parse helper factory (`parse.ts`)            | S      | medium                                |
| 3    | `withWorkspace` middleware                   | M      | high — removes most route boilerplate |
| 4    | `apiDelete` / `apiPatch` / `apiPost` helpers | S      | medium                                |
| 5    | Generic `DeleteButton`                       | S      | high — deletes 3 files                |
| 6    | Generic CRUD repository base                 | M      | medium                                |
| 7    | Generic `EntityDialog`                       | M      | high — deletes duplicate dialog logic |
| 8    | Generic `EntityList`                         | L      | high — deletes duplicate list logic   |
| 9    | `EmptyState` with CTA                        | XS     | low                                   |

Steps 1–5 are safe, independent, and well-scoped. Do them first.  
Steps 6–8 touch more files and should be done after the smaller ones land cleanly.

---

## What is NOT duplicated (already extracted)

- `DetailsForm` — shared editable details form shell
- `DetailsFormRow` — table row with label + error
- `EmptyTabState` — detail tab empty state
- `DetailTabs` — tab navigation
- `DetailsTable` — read-only label/value table
- `ApiResponse` — response builder
- `useDetailsForm` — form state + validation hook (now inside `DetailsForm`)
