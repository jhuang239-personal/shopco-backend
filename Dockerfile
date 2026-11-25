# Prisma 7 requires Node.js 22.18+.
# Debian-slim (glibc) rather than Alpine (musl): Prisma's engine binaries are best supported there.
FROM node:22-slim AS builder

WORKDIR /app

RUN npm install -g pnpm@11.22.0

# pnpm-workspace.yaml holds the allowBuilds list (Prisma engines), so it must be present
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

COPY src/ ./src/

# `prisma generate` only needs a syntactically valid URL; the real connector is
# injected at runtime through env_file, so no secret ends up in an image layer.
RUN prismadb_connector="postgresql://build:build@localhost:5432/build" pnpm run build

# Production stage
FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm@11.22.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# Installs the Prisma CLI too (a runtime dependency) so `migrate deploy` can run in this image
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]
