# Same pattern as incel_prospiz frontend: multi-stage image → GHCR → CapRover
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time placeholder only (real DB URL comes from CapRover env at runtime)
ENV DATABASE_URL="postgresql://user:pass@127.0.0.1:5432/incel_feedback_db"
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

# Like prospiz Django CMD: migrate then start (no separate entrypoint script)
CMD ["sh", "-c", "if [ -z \"$DATABASE_URL\" ] && [ -n \"$DB_HOST\" ] && [ -n \"$DB_NAME\" ]; then export DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-5432}/${DB_NAME}\"; fi; npx prisma migrate deploy && npm run start"]
