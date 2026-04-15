# Vox — Transport Management System

Open-source multi-tenant TMS for freight logistics teams. Built with Next.js 16, Bun, Drizzle ORM, and PostgreSQL.

---

## Quick start — Docker (recommended)

**Prerequisites:** Docker Desktop 4.x+

```bash
git clone https://github.com/your-org/vox.git
cd vox
docker compose up
```

First boot: the migrator service applies all migrations and seeds a dev admin account.  
App available at **http://localhost:3000**

**Dev credentials (seeded automatically):**

| Email           | Password   | Role                         |
|-----------------|------------|------------------------------|
| admin@admin.com | Admin.123  | admin                        |
| alice@demo.com  | Password.1 | owner (apex-logistics)       |
| bob@demo.com    | Password.1 | logistician (apex-logistics) |

To reset the database: `docker compose down -v && docker compose up`

---

## Quick start — local Bun

**Prerequisites:** Bun 1.2.23+, PostgreSQL 16+

```bash
cp .env.example .env    # edit DATABASE_URL to point at your local PG
bun install
bun run db:migrate
bun run db:seed
bun run dev
```

App available at **http://localhost:3000**

---

## Environment variables

| Variable              | Required | Description                                 |
|-----------------------|----------|---------------------------------------------|
| `DATABASE_URL`        | yes      | PostgreSQL connection string                |
| `JWT_SECRET`          | yes      | HS256 signing key — minimum 32 characters   |
| `SEED_ADMIN_EMAIL`    | no       | Admin email used by `db:seed` (dev only)    |
| `SEED_ADMIN_PASSWORD` | no       | Admin password used by `db:seed` (dev only) |

Generate a secure JWT secret:

```bash
openssl rand -base64 32
```

Never commit real secrets. The `docker-compose.yml` uses hardcoded dev values intentionally — do not use them in
production.

---

## Scripts

| Command               | Description                                |
|-----------------------|--------------------------------------------|
| `bun run dev`         | Start dev server (Next.js with HMR)        |
| `bun run build`       | Production build                           |
| `bun run start`       | Start production server                    |
| `bun run lint`        | ESLint                                     |
| `bun run typecheck`   | TypeScript (`tsc --noEmit`)                |
| `bun run db:generate` | Generate SQL migration from schema changes |
| `bun run db:migrate`  | Apply pending migrations                   |
| `bun run db:seed`     | Run SQL seed files                         |
| `bun run db:studio`   | Open Drizzle Studio (visual DB browser)    |

---

## Architecture

Layered architecture: Route Handler → Service → Repository → Drizzle ORM → PostgreSQL.  
No business logic in route handlers, no raw SQL in services.

See [`docs/01-Architecture.md`](docs/01-Architecture.md) for the full layer diagram and file structure.

---

## Database migrations

Schema lives in `lib/db/schema/`. After editing a schema file:

```bash
bun run db:generate   # creates a new file in db/migrations/
bun run db:migrate    # applies pending migrations to the database
```

Never edit files in `db/migrations/` by hand.

On Fly.io: `release_command = "bun run db:migrate"` in `fly.toml` runs migrations automatically before traffic switches
to the new release.

---

## Production deploy (Fly.io)

```bash
# Set secrets (run once per environment)
flyctl secrets set DATABASE_URL="postgresql://..." JWT_SECRET="..."

# Deploy
flyctl deploy
```

---

## Access gating (hosted instance)

Vox is invite-only by default on the hosted instance.

- **Public users** visit `/request-access`, fill in their details, and submit a request.
- **Admin** reviews pending requests at `/{workspace}/admin/access-requests` and approves or rejects.
- On approval, a user account is created and the admin receives a one-time temporary password to share.
- Until approved, users cannot log in.

**Self-hosted:** run `bun run db:seed` to create a pre-confirmed admin account — no approval flow needed for your own
instance.

---

## Docs

The `docs/` directory is an [Obsidian](https://obsidian.md) vault with detailed notes on architecture, the TMS feature
plan, database schema, and auth flow. Open the `docs/` folder as a vault in Obsidian for a linked, navigable view.
