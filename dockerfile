# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

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

# Install deps (dev deps needed for tsc)
COPY package-lock.json package.json ./
RUN npm ci --include=dev

# Copy source
COPY . .

# Build TypeScript (deploy-friendly): exclude seed/tests from compilation
RUN node -e "const fs=require('fs'); \
  const base='tsconfig.json'; \
  if(!fs.existsSync(base)) { console.error('Missing tsconfig.json'); process.exit(1); } \
  const cfg={extends:'./tsconfig.json',exclude:['src/seed.ts','**/*.test.ts','**/*.spec.ts']}; \
  fs.writeFileSync('tsconfig.fly.json', JSON.stringify(cfg, null, 2));"

RUN npx tsc -p tsconfig.fly.json

# Keep only production deps
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

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
