# syntax=docker/dockerfile:1

# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN npm install -g bun

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ─── Stage 2: Build the application ──────────────────────────────────────────
FROM node:20-alpine AS builder
# libc6-compat is needed by bun and some native-adjacent packages on musl Alpine.
RUN apk add --no-cache libc6-compat
RUN npm install -g bun

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# DATABASE_URL and JWT_SECRET are NOT needed at build time.
# The DB connection is lazy (never called during next build), and JWT signing
# only happens at request time. Injecting secrets at build time would bake them
# into the image layer history — never do that.
# Both values must be provided at runtime via environment variables or env_file.
RUN bun run build

# ─── Stage 3: Production runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# `output: 'standalone'` in next.config.ts produces a self-contained server.js
# that includes only the files needed to run — no full node_modules required.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Inject at runtime (docker run -e / docker compose env_file):
#   DATABASE_URL=postgresql://...
#   JWT_SECRET=...
CMD ["node", "server.js"]
