# Agent instructions — Vox (senior TypeScript fullstack)

You are contributing to a **production-minded** fullstack app. Write code as a **senior TypeScript fullstack engineer**:
clear boundaries, explicit types, secure defaults, and patterns that survive review and deployment.

---

## Stack (non-negotiable context)

| Layer           | Choice                                                                                    |
|-----------------|-------------------------------------------------------------------------------------------|
| Framework       | **Next.js 16** (App Router)                                                               |
| Runtime / PM    | **Bun** (`bun --bun` in scripts)                                                          |
| UI              | **Radix Themes** (`@radix-ui/themes`) — theming, layout primitives, accessible components |
| Styling         | **Tailwind CSS 4** (with `tailwind-merge` where class names merge)                        |
| Database & auth | **Supabase** (Postgres + Auth; `@supabase/supabase-js`, auth helpers for Next.js)         |
| Deploy          | **Vercel** (env vars, build output, serverless/Node runtimes)                             |
| React           | **React 19**                                                                              |

---

<!-- BEGIN:nextjs-agent-rules -->

## Next.js 16 — verify before you ship

This is **not** the Next.js from older training data: APIs, conventions, and file layout can differ. **Before** adding
routes, data fetching, caching, or config:

1. Read the relevant topic under `node_modules/next/dist/docs/` (or the official Next.js 16 docs).
2. Follow current App Router patterns; **heed deprecation notices** and prefer documented APIs over assumptions.

<!-- END:nextjs-agent-rules -->

---

## Fullstack architecture (Next.js App Router)

- **Server Components by default** for pages and data reads that do not need client state; add `"use client"` only when
  strictly needed (event handlers, browser APIs, hooks).
- Use `<Suspense>` boundaries with fallbacks around async Server Components.
- Use `next/image` for all images; never raw `<img>`.
- Use `next/link` for all internal navigation.
- Always provide `loading.tsx` and `error.tsx` for every route segment.
- Use Server Actions (`"use server"`) for all mutations.
- **Route Handlers** (`app/api/.../route.ts`) for mutations, webhooks, and APIs that must not expose secrets to the
  browser. Use appropriate HTTP methods and status codes.
- **Caching**: Be explicit about what is static vs dynamic. If you use `fetch` with caching or Next.js cache APIs,
  document intent in code so behavior matches product expectations.
- **Environment variables**: `NEXT_PUBLIC_*` only for values safe in the browser. **Never** expose service role keys or
  server secrets to the client. Use `.env.example` as the contract for required vars (see existing Supabase entries).

---

## TypeScript and code quality

- **Strict typing**: Prefer explicit function return types for public exports and route handlers. Avoid `any`; use
  `unknown` + narrowing when shape is uncertain. Strictly no `@ts-ignore`.
- Prefer `interface` over `type` for object shapes.
- Avoid enums; use `as const` objects instead.
- Export types from `src/types/` or `types/`.
- **Narrow boundaries**: Validate external input (request bodies, query params, webhooks) at the edge of the system (Zod
  or equivalent if the project adds it; otherwise minimal manual checks with clear errors).
- **Errors**: Use typed results or consistent HTTP JSON error shapes in Route Handlers. Do not leak stack traces or
  internal messages to clients in production paths.
- **Imports**: Use path aliases if the project defines them; otherwise consistent relative imports. Keep server-only
  code out of client bundles (no Supabase service role or secrets in `"use client"` modules).

---

## Code Style

- Functional components only — no class components.
- Arrow functions for components.
- Named exports for components, default export only for page/layout files.
- kebab-case for filenames: `user-profile.tsx` not `UserProfile.tsx`.
- Early returns instead of nested conditionals.

---

## UI: Radix Themes and components

- **Prefer Radix Themes** for layout and controls: `Theme`, `Flex`, `Box`, `Text`, `Heading`, `Button`, `TextField`,
  `Callout`, dialogs, etc. Compose these instead of raw HTML when a Theme primitive fits.
- **Custom components** should be **thin wrappers or compositions** around Radix Themes (and, when needed, lower-level
  `@radix-ui/react-*` primitives). Re-export or wrap for app-specific props and styling; do not duplicate accessibility
  behavior by reimplementing focus traps, ARIA, or keyboard handling.
- **Component Rules**: Custom components should be used. All components should be created as a wrapper for a Radix
  existing component or a set of components.
- **Theming**: Respect dark/light via existing setup (`next-themes` + Radix Themes `appearance`). Use Theme tokens (
  `--accent-9`, `--gray-2`) and `className` with Tailwind for one-off layout; avoid hard-coded colors that fight the
  theme.
- **Never mix Shadcn/ui** — this project uses Radix Themes directly.
- **`"use client"`**: Only mark components client when they need hooks, browser APIs, or Radix client interactivity.
  Keep pages and data-loading logic server-side when possible.

---

## Supabase

- Use the **SSR** Supabase client from `src/lib/supabase/server.ts` (or standard Next Auth helpers) in Server Components
  and Server Actions.
- Use the browser client from `src/lib/supabase/client.ts` in Client Components only.
- **Row Level Security (RLS)**: Assume RLS is enforced. Client-side code uses the **anon key** and policies. Privileged
  operations belong in Route Handlers or Server Actions with a **service role** only on the server and never in client
  bundles.
- Use `supabase.auth.getUser()` (not `getSession()`) in server-side code.
- **Queries**: Prefer typed database types when generated (e.g. Supabase CLI types); otherwise define narrow interfaces
  for query results used across the app.
- **Migrations and schema**: Schema changes belong in Supabase migrations or documented SQL — not ad-hoc production
  edits. When suggesting schema, consider indexes and RLS policies together with queries.

---

## What NOT to do

- Do NOT add `"use client"` to layouts or pages unless unavoidable.
- Do NOT use `useEffect` for data fetching — use RSC or Server Actions.
- Do NOT hardcode secrets or API keys anywhere — use `.env.local`.
- Do NOT commit `.env.local`.
- Do NOT install new packages without confirming with the user first.

---

## Security and privacy

- Validate and sanitize user input server-side for authoritative actions.
- Use parameterized Supabase queries; never concatenate raw SQL from user input in application code.
- Cookies: `httpOnly`, `secure`, and `sameSite` where applicable for session cookies.
- Do not log tokens, passwords, or PII.

---

## Vercel deployment

- **Build**: Ensure `bun run build` succeeds locally before treating work as done.
- **Env**: Document new variables in `.env.example`. Match Vercel project settings for preview vs production.
- **Runtime**: Choose Node vs Edge deliberately for Route Handlers (Supabase and some Node APIs may require Node
  runtime).
- **Assets and regions**: Keep default assumptions unless the product requires otherwise; note any constraint in
  PR-style summaries when relevant.

---

## What “done” looks like

- Types compile; no new avoidable `any`.
- UI uses Radix Themes consistently; new primitives are wrapped/composed, not reimplemented.
- Secrets stay server-side; client only sees `NEXT_PUBLIC_*` where appropriate.
- Next.js 16 patterns match current docs; no deprecated APIs without a planned migration.
- Changes are scoped to the task — no unrelated refactors or gratuitous new files.

---

## Quick reference — project scripts

- Dev: `bun run dev`
- Build: `bun run build`
- Start (production): `bun run start`
- Lint: `bun run lint`
- Typecheck: `bun run typecheck`
- Test: `bun run test`

Always run `bun run typecheck && bun run lint` after making changes.
