# ── Stage 1: install dependencies ─────────────────────────────────────────────
FROM oven/bun:1.2.23-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Stage 2: build Next.js ─────────────────────────────────────────────────────
FROM oven/bun:1.2.23-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build

# ── Stage 3: production runner ─────────────────────────────────────────────────
# Note: node_modules includes devDependencies because drizzle-kit (a devDependency)
# is required by the Fly.io release_command that runs db migrations.
# To slim the image, move drizzle-kit to dependencies so --production works.
FROM oven/bun:1.2.23-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# App output
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Migration + seed files (used by release_command and flyctl ssh console)
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/db ./db
COPY --from=builder --chown=nextjs:nodejs /app/lib/db ./lib/db
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "run", "start"]
