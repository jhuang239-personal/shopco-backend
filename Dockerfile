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

RUN npm install -g pnpm@11.22.0 && npm cache clean --force

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# Installs the Prisma CLI too (a runtime dependency) so `migrate deploy` can run in this image.
# The pnpm store is written to a temp folder and deleted in the same step, so it does not
# stay in the image layer (it was about 370 MB and duplicated the installed packages).
RUN pnpm install --frozen-lockfile --prod --store-dir /tmp/pnpm-store \
 && rm -rf /tmp/pnpm-store /root/.cache /root/.npm

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]
