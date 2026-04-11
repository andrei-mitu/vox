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
RUN npm install -g bun

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The DB connection is lazy — it never runs at build time.
# These are safe placeholders so `next build` succeeds without a real database.
ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/vox
ARG JWT_SECRET=placeholder-not-used-at-build-time
ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV NEXT_TELEMETRY_DISABLED=1

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

# DATABASE_URL and JWT_SECRET must be injected at runtime via environment variables.
CMD ["node", "server.js"]
