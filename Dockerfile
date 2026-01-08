# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js/Prisma"

WORKDIR /app
ENV NODE_ENV=production

# -------------------------
# Build stage
# -------------------------
FROM base AS builder

RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y \
    build-essential node-gyp openssl pkg-config python-is-python3 && \
  rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install deps (dev deps needed for prisma/tsc)
COPY package-lock.json package.json ./
RUN npm ci --include=dev

# Copy full source
COPY . .

# Generate Prisma Client AFTER source is copied
RUN npx prisma generate

# Debug/verify generated output BEFORE tsc:
# If this fails, it means Prisma is not generating where your TS import expects.
RUN echo "== Prisma generated folders ==" && \
  (ls -la /app/src/generated || true) && \
  (ls -la /app/src/generated/prisma || true) && \
  (ls -la /app/generated || true) && \
  (ls -la /app/generated/prisma || true) && \
  echo "== Finding prisma index.js ==" && \
  (find /app -maxdepth 6 -type f -path "*generated*/prisma/index.js" -print || true) && \
  echo "== Finding prisma index.d.ts ==" && \
  (find /app -maxdepth 6 -type f -path "*generated*/prisma/index.d.ts" -print || true)

# Hard requirement for YOUR current TS import:
# src/plugins/prisma.ts imports: ../generated/prisma/index.js
RUN test -f /app/src/generated/prisma/index.js

# Build TypeScript
RUN npm run build

# Runtime import path from dist expects dist/generated/prisma/index.js
RUN mkdir -p /app/dist/generated/prisma && \
  cp -R /app/src/generated/prisma/* /app/dist/generated/prisma/

# Keep only production deps (optional)
RUN npm prune --omit=dev


# -------------------------
# Runtime stage
# -------------------------
FROM base AS runner

RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y openssl && \
  rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "run", "start"]

